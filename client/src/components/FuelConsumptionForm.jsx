import React, { useState } from "react";
import axios from "axios";

const FuelConsumptionForm = () => {
  const [formData, setFormData] = useState({
    recordDate: new Date().toISOString().split('T')[0],
    vehicleType: "شاحنة",
    vehicleNumber: "",
    driverName: "",
    fuelType: "ديزل",
    fuelAmount: "",
    fuelCost: "",
    startOdometer: "",
    endOdometer: "",
    operatingHours: "",
    purpose: "نقل منتجات",
    refuelingStation: "",
    invoiceNumber: "",
    loadWeight: "",
    roadCondition: "جيد",
    weatherCondition: "مشمس",
    maintenanceNotes: "",
    notes: "",
    status: "مسجل"
  });

  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePredict = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/fuel-consumption/predict/future?days=30&vehicleType=${formData.vehicleType}`
      );
      if (response.data.success) {
        setPredictions(response.data.data);
        setMessage({
          type: "success",
          text: "تم حساب التوقعات المستقبلية بنجاح!"
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
      setMessage({
        type: "error",
        text: "حدث خطأ أثناء جلب التوقعات"
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(
        "http://localhost:5000/api/fuel-consumption",
        formData
      );
      
      if (response.data.success) {
        setMessage({
          type: "success",
          text: "تم تسجيل استهلاك الوقود بنجاح!"
        });
        
        // إعادة تعيين النموذج
        setFormData({
          recordDate: new Date().toISOString().split('T')[0],
          vehicleType: "شاحنة",
          vehicleNumber: "",
          driverName: "",
          fuelType: "ديزل",
          fuelAmount: "",
          fuelCost: "",
          startOdometer: "",
          endOdometer: "",
          operatingHours: "",
          purpose: "نقل منتجات",
          refuelingStation: "",
          invoiceNumber: "",
          loadWeight: "",
          roadCondition: "جيد",
          weatherCondition: "مشمس",
          maintenanceNotes: "",
          notes: "",
          status: "مسجل"
        });
        
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "حدث خطأ أثناء التسجيل"
      });
    } finally {
      setLoading(false);
    }
  };

  const vehicleTypes = ["شاحنة", "حافلة", "سيارة", "جرار", "مولد كهربائي", "آلة زراعية", "أخرى"];
  const fuelTypes = ["بنزين 95", "بنزين 98", "ديزل", "كاز", "غاز"];
  const purposes = ["نقل منتجات", "توزيع", "صيانة", "تشغيل", "نقل موظفين", "أخرى"];
  const roadConditions = ["ممتاز", "جيد", "متوسط", "سيئ", "وعر"];
  const weatherConditions = ["مشمس", "غائم", "ممطر", "عاصف", "ضبابي"];

  return (
    <div className="container mx-auto p-6">
      {/* رسائل التنبيه */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg text-right ${
          message.type === "success" 
            ? "bg-green-100 text-green-700 border border-green-400"
            : "bg-red-100 text-red-700 border border-red-400"
        }`}>
          {message.text}
        </div>
      )}

      {/* الهيدر */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-white text-right">
          ⛽ تسجيل استهلاك الوقود
        </h1>
        <p className="text-blue-100 text-right mt-2">
          سجل استهلاك الوقود للمركبات والمعدات لتحديد الكفاءة والتكاليف
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* النموذج */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
            {/* معلومات أساسية */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">معلومات أساسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-right mb-2">تاريخ التسجيل *</label>
                  <input
                    type="date"
                    name="recordDate"
                    value={formData.recordDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-right"
                    required
                  />
                </div>
                <div>
                  <label className="block text-right mb-2">نوع المركبة *</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-right"
                    required
                  >
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-right mb-2">رقم المركبة *</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-right uppercase"
                    placeholder="مثال: 1234-أ"
                    required
                  />
                </div>
                <div>
                  <label className="block text-right mb-2">اسم السائق *</label>
                  <input
                    type="text"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-right"
                    required
                  />
                </div>
              </div>
            </div>

            {/* كمية الوقود والتكلفة */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">كمية الوقود والتكلفة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-right mb-2">نوع الوقود *</label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-right"
                    required
                  >
                    {fuelTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-right mb-2">الكمية (لتر) *</label>
                  <input
                    type="number"
                    name="fuelAmount"
                    value={formData.fuelAmount}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-right"
                    required
                  />
                </div>
                <div>
                  <label className="block text-right mb-2">سعر اللتر (ريال) *</label>
                  <input
                    type="number"
                    name="fuelCost"
                    value={formData.fuelCost}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full p-2 border rounded-lg text-right"
                    required
                  />
                </div>
              </div>
            </div>

            {/* قراءات العداد */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">قراءات العداد</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-right mb-2">قراءة بداية العداد (كم)</label>
                  <input
                    type="number"
                    name="startOdometer"
                    value={formData.startOdometer}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-right"
                  />
                </div>
                <div>
                  <label className="block text-right mb-2">قراءة نهاية العداد (كم)</label>
                  <input
                    type="number"
                    name="endOdometer"
                    value={formData.endOdometer}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-right"
                  />
                </div>
                <div>
                  <label className="block text-right mb-2">ساعات التشغيل (للمولدات)</label>
                  <input
                    type="number"
                    name="operatingHours"
                    value={formData.operatingHours}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-right"
                  />
                </div>
              </div>
            </div>

            {/* معلومات إضافية */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">معلومات إضافية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-right mb-2">الغرض من الاستخدام *</label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-right"
                    required
                  >
                    {purposes.map(purpose => (
                      <option key={purpose} value={purpose}>{purpose}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-right mb-2">محطة التزويد</label>
                  <input
                    type="text"
                    name="refuelingStation"
                    value={formData.refuelingStation}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-right"
                  />
                </div>
                <div>
                  <label className="block text-right mb-2">رقم الفاتورة</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-right"
                  />
                </div>
                <div>
                  <label className="block text-right mb-2">وزن الحمولة (كجم)</label>
                  <input
                    type="number"
                    name="loadWeight"
                    value={formData.loadWeight}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-right"
                  />
                </div>
                <div>
                  <label className="block text-right mb-2">حالة الطريق</label>
                  <select
                    name="roadCondition"
                    value={formData.roadCondition}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-right"
                  >
                    {roadConditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-right mb-2">حالة الطقس</label>
                  <select
                    name="weatherCondition"
                    value={formData.weatherCondition}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-right"
                  >
                    {weatherConditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ملاحظات */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">ملاحظات</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-right mb-2">ملاحظات الصيانة</label>
                  <textarea
                    name="maintenanceNotes"
                    value={formData.maintenanceNotes}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full p-2 border rounded-lg text-right"
                    placeholder="أي ملاحظات تتعلق بالصيانة..."
                  />
                </div>
                <div>
                  <label className="block text-right mb-2">ملاحظات عامة</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full p-2 border rounded-lg text-right"
                    placeholder="أي ملاحظات إضافية..."
                  />
                </div>
              </div>
            </div>

            {/* أزرار */}
            <div className="flex gap-3 justify-end border-t pt-6">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    recordDate: new Date().toISOString().split('T')[0],
                    vehicleType: "شاحنة",
                    vehicleNumber: "",
                    driverName: "",
                    fuelType: "ديزل",
                    fuelAmount: "",
                    fuelCost: "",
                    startOdometer: "",
                    endOdometer: "",
                    operatingHours: "",
                    purpose: "نقل منتجات",
                    refuelingStation: "",
                    invoiceNumber: "",
                    loadWeight: "",
                    roadCondition: "جيد",
                    weatherCondition: "مشمس",
                    maintenanceNotes: "",
                    notes: "",
                    status: "مسجل"
                  });
                  setPredictions(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
              >
                مسح البيانات
              </button>
              <button
                type="button"
                onClick={handlePredict}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition"
              >
                🔮 تنبؤ الاستهلاك
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
              >
                {loading ? "جاري التسجيل..." : "تسجيل الاستهلاك"}
              </button>
            </div>
          </form>
        </div>

        {/* لوحة التنبؤات */}
        <div className="lg:col-span-1">
          {predictions && (
            <div className="bg-gradient-to-br from-blue-500 to-cyan-700 rounded-lg p-6 text-white sticky top-6">
              <h3 className="text-xl font-bold text-center mb-4">🔮 توقعات استهلاك الوقود</h3>
              <div className="space-y-3">
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-sm opacity-90">المدة: {predictions.period}</div>
                  <div className="text-sm opacity-90">نوع المركبة: {predictions.vehicleType === "الكل" ? "جميع المركبات" : predictions.vehicleType}</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-sm opacity-90">الاستهلاك اليومي المتوقع</div>
                  <div className="text-2xl font-bold">{predictions.predictions.daily} لتر</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-sm opacity-90">الاستهلاك الأسبوعي المتوقع</div>
                  <div className="text-2xl font-bold">{predictions.predictions.weekly} لتر</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-sm opacity-90">الاستهلاك الشهري المتوقع</div>
                  <div className="text-2xl font-bold">{predictions.predictions.monthly} لتر</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-sm opacity-90">التكلفة الشهرية المتوقعة</div>
                  <div className="text-2xl font-bold">{predictions.predictions.estimatedCost.toLocaleString()} ريال</div>
                </div>
              </div>
              <div className="mt-4 text-center text-sm opacity-75">
                بناءً على بيانات الـ 30 يوم الماضية
              </div>
            </div>
          )}

          {/* نصائح سريعة */}
          <div className="bg-yellow-50 rounded-lg p-4 mt-4 border border-yellow-200">
            <h4 className="font-bold text-right text-yellow-800 mb-2">💡 نصائح لتوفير الوقود</h4>
            <ul className="text-right text-sm text-yellow-700 space-y-1">
              <li>• حافظ على ضغط الإطارات المناسب</li>
              <li>• قم بالصيانة الدورية للمركبات</li>
              <li>• تجنب التحميل الزائد</li>
              <li>• خطط للطرق المثلى للرحلات</li>
              <li>• استخدم مثبت السرعة على الطرق السريعة</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuelConsumptionForm;