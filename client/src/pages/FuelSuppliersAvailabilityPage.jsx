import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { getFuelSuppliersAvailability } from '../api/auth';

const DAYS = [
  { key: 'saturday',  label: 'السبت' },
  { key: 'sunday',    label: 'الأحد' },
  { key: 'monday',    label: 'الاثنين' },
  { key: 'tuesday',   label: 'الثلاثاء' },
  { key: 'wednesday', label: 'الأربعاء' },
  { key: 'thursday',  label: 'الخميس' },
  { key: 'friday',    label: 'الجمعة' },
];

const FuelSuppliersAvailabilityPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFuelSuppliersAvailability();
        if (res.success) setSuppliers(res.data);
      } catch (err) {
        setError(err.message || 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 overflow-auto" dir="rtl">
          {/* العنوان */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              ⛽ مواعيد تجار الوقود
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              عرض مواعيد التوفر وأوقات التوصيل المتاحة لكل تاجر وقود مسجل في النظام
            </p>
          </div>

          {loading && (
            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
              جارٍ تحميل البيانات...
            </div>
          )}

          {error && (
            <div className="bg-white rounded-2xl shadow p-6 text-center text-red-500">
              {error}
            </div>
          )}

          {!loading && !error && suppliers.length === 0 && (
            <div className="bg-white rounded-2xl shadow p-10 text-center">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-500 font-medium">لا يوجد تجار وقود مسجلون في النظام حالياً</p>
            </div>
          )}

          {!loading && !error && suppliers.length > 0 && (
            <div className="space-y-6">
              {suppliers.map((supplier) => {
                const schedule = supplier.availabilitySchedule || {};
                const enabledDays = DAYS.filter(d => schedule[d.key]?.enabled);

                return (
                  <div key={supplier._id} className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
                    {/* رأس بطاقة التاجر */}
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                          {(supplier.name || 'ت').charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-bold text-base">{supplier.name}</p>
                          {supplier.companyName && (
                            <p className="text-orange-100 text-xs">{supplier.companyName}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {supplier.phone && (
                          <span className="text-xs text-white bg-white/20 px-3 py-1 rounded-full">
                            📞 {supplier.phone}
                          </span>
                        )}
                        <span className="text-xs text-white bg-white/20 px-3 py-1 rounded-full">
                          {enabledDays.length} أيام متاحة
                        </span>
                      </div>
                    </div>

                    {/* جدول المواعيد */}
                    <div className="p-5">
                      {enabledDays.length === 0 ? (
                        <p className="text-center text-gray-400 py-4 text-sm">
                          لم يحدد هذا التاجر مواعيد توفره بعد
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {DAYS.map(({ key, label }) => {
                            const day = schedule[key];
                            const enabled = day?.enabled;
                            return (
                              <div
                                key={key}
                                className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                                  enabled
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-gray-50 border-gray-100'
                                }`}
                              >
                                <span className={`font-semibold text-sm ${enabled ? 'text-gray-800' : 'text-gray-400'}`}>
                                  {label}
                                </span>
                                {enabled ? (
                                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-lg">
                                    {day.startTime} - {day.endTime}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">غير متاح</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default FuelSuppliersAvailabilityPage;
