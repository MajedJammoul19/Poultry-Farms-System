import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { getAvailabilitySchedule, updateAvailabilitySchedule } from '../../api/auth';

const DAYS = [
  { key: 'saturday',  label: 'السبت' },
  { key: 'sunday',    label: 'الأحد' },
  { key: 'monday',    label: 'الاثنين' },
  { key: 'tuesday',   label: 'الثلاثاء' },
  { key: 'wednesday', label: 'الأربعاء' },
  { key: 'thursday',  label: 'الخميس' },
  { key: 'friday',    label: 'الجمعة' },
];

const DEFAULT_SCHEDULE = {
  saturday:  { enabled: true,  startTime: '08:00', endTime: '17:00' },
  sunday:    { enabled: true,  startTime: '08:00', endTime: '17:00' },
  monday:    { enabled: true,  startTime: '08:00', endTime: '17:00' },
  tuesday:   { enabled: true,  startTime: '08:00', endTime: '17:00' },
  wednesday: { enabled: true,  startTime: '08:00', endTime: '17:00' },
  thursday:  { enabled: true,  startTime: '08:00', endTime: '17:00' },
  friday:    { enabled: false, startTime: '08:00', endTime: '17:00' },
};

const FuelSupplierSettingsPage = () => {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [message, setMessage]   = useState({ type: '', text: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAvailabilitySchedule();
        if (res.success && res.data && Object.keys(res.data).length > 0) {
          setSchedule({ ...DEFAULT_SCHEDULE, ...res.data });
        }
      } catch {
        // keep defaults on error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleDay = (key) => {
    setSchedule(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const changeTime = (key, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await updateAvailabilitySchedule(schedule);
      setMessage({ type: 'success', text: 'تم حفظ المواعيد بنجاح ✅' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'حدث خطأ أثناء الحفظ' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    }
  };

  const enabledCount = DAYS.filter(d => schedule[d.key]?.enabled).length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 overflow-auto" dir="rtl">
          {/* العنوان */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              ⛽ إعدادات التوريد
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              حدد الأيام وساعات العمل التي تكون فيها متاحاً لشحن وتوصيل الوقود للمنشأة
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
              جارٍ تحميل البيانات...
            </div>
          ) : (
            <div className="max-w-2xl">
              {/* بطاقة الجدول */}
              <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
                {/* رأس البطاقة */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-xl">🗓️</span>
                    <span className="font-bold text-lg">مواعيد التوفر الأسبوعية</span>
                  </div>
                  <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {enabledCount} / {DAYS.length} أيام مفعّلة
                  </span>
                </div>

                {/* صف عناوين الأعمدة */}
                <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 text-center">
                  <span className="text-right">اليوم</span>
                  <span>التفعيل</span>
                  <span>من الساعة</span>
                  <span>حتى الساعة</span>
                </div>

                {/* صفوف الأيام */}
                <div className="divide-y divide-gray-100">
                  {DAYS.map(({ key, label }) => {
                    const day = schedule[key] || { enabled: false, startTime: '08:00', endTime: '17:00' };
                    return (
                      <div
                        key={key}
                        className={`grid grid-cols-4 gap-4 items-center px-6 py-4 transition-colors ${
                          day.enabled ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        {/* اسم اليوم */}
                        <span className={`font-semibold text-sm ${day.enabled ? 'text-gray-800' : 'text-gray-400'}`}>
                          {label}
                        </span>

                        {/* Toggle */}
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => toggleDay(key)}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                              day.enabled ? 'bg-orange-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                                day.enabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        {/* وقت البداية */}
                        <div className="flex justify-center">
                          <input
                            type="time"
                            value={day.startTime}
                            onChange={e => changeTime(key, 'startTime', e.target.value)}
                            disabled={!day.enabled}
                            className={`w-full border rounded-lg px-2 py-1.5 text-sm text-center transition-colors ${
                              day.enabled
                                ? 'border-gray-300 text-gray-800 bg-white focus:outline-none focus:border-orange-400'
                                : 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
                            }`}
                          />
                        </div>

                        {/* وقت النهاية */}
                        <div className="flex justify-center">
                          <input
                            type="time"
                            value={day.endTime}
                            onChange={e => changeTime(key, 'endTime', e.target.value)}
                            disabled={!day.enabled}
                            className={`w-full border rounded-lg px-2 py-1.5 text-sm text-center transition-colors ${
                              day.enabled
                                ? 'border-gray-300 text-gray-800 bg-white focus:outline-none focus:border-orange-400'
                                : 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ذيل البطاقة */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-4">
                  {/* رسالة النجاح / الخطأ */}
                  <div className="flex-1">
                    {message.text && (
                      <p className={`text-sm font-medium ${
                        message.type === 'success' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {message.text}
                      </p>
                    )}
                  </div>

                  {/* زر الحفظ */}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
                  >
                    {saving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        جارٍ الحفظ...
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        حفظ المواعيد
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* بطاقة المعلومات */}
              <div className="fuel-info-box mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <span className="text-xl flex-shrink-0">ℹ️</span>
                <p className="text-sm text-amber-800 leading-relaxed">
                  ستظهر مواعيد توفرك فقط لمدير المنشأة عند إنشاء طلب وقود جديد، مما يساعده على اختيار وقت التسليم المناسب.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default FuelSupplierSettingsPage;
