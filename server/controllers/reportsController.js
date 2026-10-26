const FuelOrder        = require('../models/FuelOrder');
const FoodOrder        = require('../models/FoodOrder');
const MedicalExamination = require('../models/MedicalExamination');
const SanitationReport = require('../models/sanitationReportModel');
const PackingOperation = require('../models/PackingOperation');
const FuelConsumption  = require('../models/FuelConsumption');
const FoodConsumption  = require('../models/FoodConsumption');

const getDateRange = (period) => {
  const now = new Date();
  let start, end;

  if (period === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  } else if (period === 'week') {
    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    end   = now;
  } else if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }
  return { start, end };
};

exports.getQuickReport = async (req, res) => {
  try {
    const { period } = req.query;

    /* ===== تقرير الإنتاج — بدون فلتر تاريخ ===== */
    if (period === 'production') {
      const [packingOps, fuelCons, foodCons] = await Promise.all([
        PackingOperation.find().sort({ createdAt: -1 }),
        FuelConsumption.find().sort({ createdAt: -1 }),
        FoodConsumption.find().sort({ createdAt: -1 }),
      ]);

      const packingByStatus = packingOps.reduce((acc, op) => {
        acc[op.status || 'غير محدد'] = (acc[op.status || 'غير محدد'] || 0) + 1;
        return acc;
      }, {});

      const packingByProduct = packingOps.reduce((acc, op) => {
        acc[op.productType || 'غير محدد'] = (acc[op.productType || 'غير محدد'] || 0) + 1;
        return acc;
      }, {});

      return res.json({
        success: true,
        period: 'production',
        data: {
          packingOps: {
            count:         packingOps.length,
            totalQuantity: packingOps.reduce((s, o) => s + (o.totalQuantity || 0), 0),
            totalWeight:   packingOps.reduce((s, o) => s + (o.totalWeight   || 0), 0),
            gradeA:        packingOps.reduce((s, o) => s + (o.gradeA        || 0), 0),
            rejected:      packingOps.reduce((s, o) => s + (o.rejected      || 0), 0),
            packagesCount: packingOps.reduce((s, o) => s + (o.packagesCount || 0), 0),
            byStatus:      packingByStatus,
            byProduct:     packingByProduct,
          },
          fuelConsumption: {
            count:      fuelCons.length,
            totalFuel:  fuelCons.reduce((s, o) => s + (o.fuelAmount  || 0), 0),
            totalCost:  fuelCons.reduce((s, o) => s + (o.totalCost   || 0), 0),
            totalKm:    fuelCons.reduce((s, o) => s + (o.distanceTraveled || 0), 0),
          },
          foodConsumption: {
            count:        foodCons.length,
            totalDaily:   foodCons.reduce((s, o) => s + (o.dailyConsumption   || 0), 0),
            totalMonthly: foodCons.reduce((s, o) => s + (o.monthlyConsumption || 0), 0),
            totalCost:    foodCons.reduce((s, o) => s + (o.feedCost           || 0), 0),
          },
        },
      });
    }

    /* ===== تقارير اليوم / الأسبوع / الشهر ===== */
    const { start, end } = getDateRange(period);
    const dateFilter = { createdAt: { $gte: start, $lte: end } };

    const [fuelOrders, foodOrders, medExams, sanitReports] = await Promise.all([
      FuelOrder.find(dateFilter),
      FoodOrder.find(dateFilter),
      MedicalExamination.find(dateFilter),
      SanitationReport.find(dateFilter),
    ]);

    const healthBreakdown = medExams.reduce((acc, e) => {
      const k = e.healthStatus || 'غير محدد';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

    const fuelStatusBreakdown = fuelOrders.reduce((acc, o) => {
      const k = o.status || 'قيد المعالجة';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      period,
      startDate: start,
      endDate:   end,
      data: {
        fuelOrders: {
          count:         fuelOrders.length,
          totalQuantity: fuelOrders.reduce((s, o) => s + (o.quantity || 0), 0),
          delivered:     fuelOrders.filter(o => o.status === 'تم التسليم').length,
          pending:       fuelOrders.filter(o => o.status === 'قيد المعالجة').length,
          byStatus:      fuelStatusBreakdown,
        },
        foodOrders: {
          count:         foodOrders.length,
          totalQuantity: foodOrders.reduce((s, o) => s + (o.quantity || 0), 0),
        },
        medicalExams: {
          count:        medExams.length,
          totalChickens: medExams.reduce((s, e) => s + (e.chickenCount || 0), 0),
          totalMortality: medExams.reduce((s, e) => s + (e.dailyMortalityCount || 0), 0),
          byStatus:     healthBreakdown,
        },
        sanitationReports: {
          count:     sanitReports.length,
          avgRating: sanitReports.length
            ? (sanitReports.reduce((s, r) => s + (r.cleanlinessRating || 0), 0) / sanitReports.length).toFixed(1)
            : 0,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
