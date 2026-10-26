const MedicalRequest = require('../models/MedicalRequest');
const FoodOrder = require('../models/FoodOrder');
const FuelOrder = require('../models/FuelOrder');
const FoodConsumption = require('../models/FoodConsumption');
const FuelConsumption = require('../models/FuelConsumption');
const PreventionPlan = require('../models/PreventionPlan');
const PackingOperation = require('../models/PackingOperation');
const Alert = require('../models/Alert');

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const ALERT_LIMIT = 8;
const completedMedicalStatuses = ['مكتمل', 'مرفوض'];

const severityWeight = {
  high: 3,
  medium: 2,
  low: 1
};

const toRoundedNumber = (value) => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value);
};

const saveAlert = async (alertData) => {
  try {
    const existing = await Alert.findOne({
      sourceId: alertData.sourceId || null,
      message: alertData.message,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });
    if (existing) return existing;

    const alert = new Alert(alertData);
    return await alert.save();
  } catch (err) {
    console.error('Error saving alert:', err);
    return null;
  }
};

exports.createLowStockAlert = async ({ itemName, itemType, currentStock, threshold, category = 'stock', targetRole = 'admin' }) => {
  const severity = (currentStock <= threshold * 0.3) ? 'high' : 'medium';
  const title = `⚠️ نقص حاد في ${itemName}`;
  const message = `المخزون الحالي من ${itemName} = ${toRoundedNumber(currentStock)} (الحد الأدنى: ${toRoundedNumber(threshold)})، يُنصح بإعادة التوريد.`;

  const alertData = {
    title,
    message,
    severity,
    category,
    targetRole,
    sourceModel: itemType === 'food' ? 'FoodOrder' : 'FuelOrder',
    sourceId: null,
    isActive: true
  };

  return await saveAlert(alertData);
};

const upsertAlert = (alertMap, alert) => {
  if (!alert || !alert.id) {
    return;
  }
  const existingAlert = alertMap.get(alert.id);
  if (!existingAlert) {
    alertMap.set(alert.id, alert);
    return;
  }
  const existingWeight = severityWeight[existingAlert.severity] || 0;
  const nextWeight = severityWeight[alert.severity] || 0;
  const existingDate = new Date(existingAlert.createdAt || 0).getTime();
  const nextDate = new Date(alert.createdAt || 0).getTime();
  if (nextWeight > existingWeight || (nextWeight === existingWeight && nextDate > existingDate)) {
    alertMap.set(alert.id, alert);
  }
};

const sortAlerts = (alertMap) => {
  return [...alertMap.values()]
    .sort((firstAlert, secondAlert) => {
      const firstWeight = severityWeight[firstAlert.severity] || 0;
      const secondWeight = severityWeight[secondAlert.severity] || 0;
      if (firstWeight !== secondWeight) {
        return secondWeight - firstWeight;
      }
      return new Date(secondAlert.createdAt || 0) - new Date(firstAlert.createdAt || 0);
    })
    .slice(0, ALERT_LIMIT);
};

const getMedicalSeverity = (request) => {
  const mortalityRate = request.birdCount ? (request.mortalityCount || 0) / request.birdCount : 0;
  if (request.priority === 'عاجل' || mortalityRate >= 0.05) {
    return 'high';
  }
  if (request.priority === 'مرتفع' || (request.affectedCount || 0) > 0) {
    return 'medium';
  }
  return 'low';
};

const addMedicalRequestAlert = (alertMap, request, prefix = 'medical') => {
  const severity = getMedicalSeverity(request);
  const affectedCount = toRoundedNumber(request.affectedCount);
  const mortalityCount = toRoundedNumber(request.mortalityCount);
  upsertAlert(alertMap, {
    id: `${prefix}-${request._id}`,
    title: request.priority === 'عاجل' ? 'طلب طبي عاجل' : 'متابعة طلب طبي',
    message: `المنشأة ${request.facilityName} بحالة ${request.status}${affectedCount ? `، والإصابات ${affectedCount}` : ''}${mortalityCount ? `، والنفوق ${mortalityCount}` : ''}.`,
    severity,
    category: 'medical',
    createdAt: request.updatedAt || request.requestDate || request.createdAt
  });
};

const buildAdminAlerts = async () => {
  const [medicalRequests, foodNeeds, fuelOrders, packingOperations] = await Promise.all([
    MedicalRequest.find({
      status: { $nin: completedMedicalStatuses },
      $or: [
        { priority: 'عاجل' },
        { priority: 'مرتفع' },
        { mortalityCount: { $gt: 0 } }
      ]
    })
      .sort({ requestDate: -1 })
      .limit(4)
      .lean(),
    FoodConsumption.find({
      recommendedOrder: { $gt: 0 }
    })
      .sort({ recommendedOrder: -1, recordDate: -1 })
      .limit(3)
      .lean(),
    FuelOrder.find({
      deliveryDate: { $lte: new Date(Date.now() + (3 * DAY_IN_MS)) }
    })
      .sort({ deliveryDate: 1 })
      .limit(3)
      .lean(),
    PackingOperation.find()
      .sort({ sortingDate: -1 })
      .limit(3)
      .lean()
  ]);

  const alerts = new Map();

  medicalRequests.forEach((request) => addMedicalRequestAlert(alerts, request));

  foodNeeds.forEach((record) => {
    const recommendedOrder = toRoundedNumber(record.recommendedOrder);
    upsertAlert(alerts, {
      id: `food-demand-${record._id}`,
      title: 'احتياج علف مرتفع',
      message: `الدفعة ${record.batchNumber} تحتاج طلباً موصى به بحوالي ${recommendedOrder} كغ من علف ${record.feedType}.`,
      severity: recommendedOrder >= 1000 ? 'high' : 'medium',
      category: 'food',
      createdAt: record.updatedAt || record.recordDate || record.createdAt
    });
  });

  fuelOrders.forEach((order) => {
    const daysUntilDelivery = Math.ceil((new Date(order.deliveryDate).getTime() - Date.now()) / DAY_IN_MS);
    upsertAlert(alerts, {
      id: `fuel-order-${order._id}`,
      title: 'تسليم وقود قريب',
      message: `يوجد طلب ${toRoundedNumber(order.quantity)} لتر من ${order.fuelType} لمنشأة ${order.facilityName} وتاريخ تسليمه ${new Date(order.deliveryDate).toLocaleDateString('ar-SY')}.`,
      severity: daysUntilDelivery <= 1 ? 'high' : 'medium',
      category: 'fuel',
      createdAt: order.createdAt || order.deliveryDate
    });
  });

  packingOperations.forEach((operation) => {
    const rejectedRatio = operation.totalQuantity ? (operation.rejected / operation.totalQuantity) * 100 : 0;
    if (rejectedRatio < 8) {
      return;
    }
    upsertAlert(alerts, {
      id: `packing-${operation._id}`,
      title: 'ارتفاع المنتجات المرفوضة',
      message: `عملية الفرز للدفعة ${operation.batchNumber} سجلت مرفوضاً بنسبة ${toRoundedNumber(rejectedRatio)}%.`,
      severity: rejectedRatio >= 15 ? 'high' : 'medium',
      category: 'quality',
      createdAt: operation.updatedAt || operation.sortingDate || operation.createdAt
    });
  });

  return sortAlerts(alerts);
};

const buildEmployeeAlerts = async (email) => {
  if (!email) {
    return [];
  }
  const sevenDaysAgo = new Date(Date.now() - (7 * DAY_IN_MS));
  const [medicalRequests, foodOrders] = await Promise.all([
    MedicalRequest.find({
      requesterEmail: email.toLowerCase(),
      status: { $nin: completedMedicalStatuses }
    })
      .sort({ requestDate: -1 })
      .limit(5)
      .lean(),
    FoodOrder.find({
      email: email.toLowerCase(),
      createdAt: { $gte: sevenDaysAgo }
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean()
  ]);

  const alerts = new Map();

  medicalRequests.forEach((request) => addMedicalRequestAlert(alerts, request, 'my-medical'));

  foodOrders.forEach((order) => {
    upsertAlert(alerts, {
      id: `my-food-order-${order._id}`,
      title: 'طلب علف مسجل باسمك',
      message: `تم تسجيل طلب ${order.foodType} بكمية ${toRoundedNumber(order.quantity)} كغ، ويمكنك متابعة أي تحديثات من السجل الأخير.`,
      severity: order.quantity >= 300 ? 'medium' : 'low',
      category: 'food',
      createdAt: order.createdAt
    });
  });

  return sortAlerts(alerts);
};

const buildVetAlerts = async () => {
  const sevenDaysAgo = new Date(Date.now() - (7 * DAY_IN_MS));
  const [medicalRequests, preventionPlans] = await Promise.all([
    MedicalRequest.find({
      status: { $nin: completedMedicalStatuses },
      $or: [
        { priority: 'عاجل' },
        { priority: 'مرتفع' },
        { mortalityCount: { $gt: 0 } },
        { affectedCount: { $gt: 0 } }
      ]
    })
      .sort({ requestDate: -1 })
      .limit(6)
      .lean(),
    PreventionPlan.find({
      date: { $gte: sevenDaysAgo }
    })
      .sort({ date: -1 })
      .limit(3)
      .lean()
  ]);

  const alerts = new Map();

  medicalRequests.forEach((request) => addMedicalRequestAlert(alerts, request, 'vet-medical'));

  preventionPlans.forEach((plan) => {
    upsertAlert(alerts, {
      id: `prevention-${plan._id}`,
      title: 'خطة وقاية جديدة',
      message: `تمت إضافة خطة وقاية للمنشأة ${plan.facilityName} في ${plan.location}.`,
      severity: 'medium',
      category: 'prevention',
      createdAt: plan.updatedAt || plan.date || plan.createdAt
    });
  });

  return sortAlerts(alerts);
};

const buildFoodSupplierAlerts = async () => {
  const [foodOrders, foodNeeds] = await Promise.all([
    FoodOrder.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    FoodConsumption.find({
      recommendedOrder: { $gt: 0 }
    })
      .sort({ recommendedOrder: -1, recordDate: -1 })
      .limit(4)
      .lean()
  ]);

  const alerts = new Map();

  foodOrders.forEach((order) => {
    upsertAlert(alerts, {
      id: `supplier-food-order-${order._id}`,
      title: 'طلب علف جديد',
      message: `تم تسجيل طلب ${order.foodType} بكمية ${toRoundedNumber(order.quantity)} كغ من ${order.name}.`,
      severity: order.quantity >= 300 ? 'medium' : 'low',
      category: 'food',
      createdAt: order.createdAt
    });
  });

  foodNeeds.forEach((record) => {
    const recommendedOrder = toRoundedNumber(record.recommendedOrder);
    upsertAlert(alerts, {
      id: `supplier-food-need-${record._id}`,
      title: 'احتياج متوقع للتوريد',
      message: `الدفعة ${record.batchNumber} تتوقع احتياجاً يصل إلى ${recommendedOrder} كغ من علف ${record.feedType}.`,
      severity: recommendedOrder >= 1000 ? 'high' : 'medium',
      category: 'food',
      createdAt: record.updatedAt || record.recordDate || record.createdAt
    });
  });

  return sortAlerts(alerts);
};

const buildFuelSupplierAlerts = async (userId) => {
  if (!userId) {
    return [];
  }

  const threeDaysAgo = new Date(Date.now() - (3 * DAY_IN_MS));

  const [newOrders, upcomingOrders, fuelConsumptions] = await Promise.all([
    FuelOrder.find({
      supplierId: userId,
      status: 'قيد المعالجة',
      createdAt: { $gte: threeDaysAgo }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    FuelOrder.find({
      supplierId: userId,
      deliveryDate: { $lte: new Date(Date.now() + (5 * DAY_IN_MS)) }
    })
      .sort({ deliveryDate: 1 })
      .limit(5)
      .lean(),
    FuelConsumption.find({
      $or: [
        { consumptionRate: { $gte: 20 } },
        { fuelAmount: { $gte: 300 } }
      ]
    })
      .sort({ recordDate: -1 })
      .limit(4)
      .lean()
  ]);

  const alerts = new Map();

  newOrders.forEach((order) => {
    upsertAlert(alerts, {
      id: `supplier-new-fuel-order-${order._id}`,
      title: '⛽ طلب وقود جديد لك',
      message: `وصلك طلب جديد من ${order.ownerName} لمنشأة ${order.facilityName}: ${toRoundedNumber(order.quantity)} لتر من ${order.fuelType}، وتاريخ التسليم المطلوب ${new Date(order.deliveryDate).toLocaleDateString('ar-SY')}.`,
      severity: 'high',
      category: 'fuel',
      createdAt: order.createdAt
    });
  });

  upcomingOrders.forEach((order) => {
    const daysUntilDelivery = Math.ceil((new Date(order.deliveryDate).getTime() - Date.now()) / DAY_IN_MS);
    upsertAlert(alerts, {
      id: `supplier-fuel-order-${order._id}`,
      title: 'طلب وقود يحتاج متابعة',
      message: `المنشأة ${order.facilityName} طلبت ${toRoundedNumber(order.quantity)} لتر من ${order.fuelType} وموعد التسليم ${new Date(order.deliveryDate).toLocaleDateString('ar-SY')}.`,
      severity: daysUntilDelivery <= 1 ? 'high' : 'medium',
      category: 'fuel',
      createdAt: order.createdAt || order.deliveryDate
    });
  });

  fuelConsumptions.forEach((record) => {
    const severity = record.consumptionRate >= 30 || record.fuelAmount >= 500 ? 'high' : 'medium';
    const details = [];
    if (Number.isFinite(record.consumptionRate)) {
      details.push(`معدل الاستهلاك ${toRoundedNumber(record.consumptionRate)} لتر/100كم`);
    }
    if (Number.isFinite(record.fuelAmount)) {
      details.push(`الكمية ${toRoundedNumber(record.fuelAmount)} لتر`);
    }
    upsertAlert(alerts, {
      id: `fuel-consumption-${record._id}`,
      title: 'استهلاك وقود مرتفع',
      message: `المركبة ${record.vehicleNumber} سجلت ${details.join('، ')}.`,
      severity,
      category: 'fuel',
      createdAt: record.updatedAt || record.recordDate || record.createdAt
    });
  });

  return sortAlerts(alerts);
};

exports.getAlerts = async (req, res) => {
  try {
    const role = (req.query.role || '').trim();
    const email = (req.query.email || '').trim().toLowerCase();
    let alerts = [];

    switch (role) {
      case 'admin':
        alerts = await buildAdminAlerts();
        break;
      case 'employee':
        alerts = await buildEmployeeAlerts(email);
        break;
      case 'vet':
        alerts = await buildVetAlerts();
        break;
      case 'food_supplier':
        alerts = await buildFoodSupplierAlerts();
        break;
      case 'fuel_supplier':
        alerts = await buildFuelSupplierAlerts(req.userId);
        break;
      default:
        alerts = [];
        break;
    }

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error loading alerts:', error);
    res.status(500).json({
      success: false,
      message: 'تعذر تحميل التنبيهات المهمة'
    });
  }
};