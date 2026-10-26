import React, { useEffect, useState, useRef } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { getFuelInvoices } from '../../api/auth';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '—';
  return Number(amount).toLocaleString('ar-SA', { minimumFractionDigits: 2 });
};

const invoiceNumber = (id) => {
  if (!id) return '—';
  return `INV-${String(id).slice(-8).toUpperCase()}`;
};

const PAYMENT_STATUS_STYLES = {
  'مدفوعة':  'bg-green-100 text-green-800',
  'مستلمة':  'bg-blue-100 text-blue-800',
  'معلقة':   'bg-yellow-100 text-yellow-800',
};

const FuelInvoicesPage = () => {
  const [invoices, setInvoices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [summary, setSummary]     = useState({ count: 0, totalQuantity: 0, totalAmount: 0 });
  const [filterType, setFilterType] = useState('الكل');
  const printRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFuelInvoices();
        if (res.success) {
          setInvoices(res.data);
          setSummary({
            count:         res.count,
            totalQuantity: res.totalQuantity,
            totalAmount:   res.totalAmount,
          });
        }
      } catch (err) {
        setError(err.message || 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fuelTypes = ['الكل', ...new Set(invoices.map(inv => inv.fuelType).filter(Boolean))];
  const filtered  = filterType === 'الكل' ? invoices : invoices.filter(inv => inv.fuelType === filterType);

  const handlePrint = () => window.print();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 overflow-auto" dir="rtl">
          {/* ===== رأس الصفحة ===== */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6 no-print">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                🧾 الفواتير والمالية
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                الفواتير المالية الخاصة بالشحنات التي تم تسليمها وتأكيدها
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition shadow"
            >
              🖨️ طباعة
            </button>
          </div>

          {loading && (
            <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
              جارٍ تحميل البيانات...
            </div>
          )}

          {error && (
            <div className="bg-white rounded-2xl shadow p-6 text-center text-red-500">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* ===== بطاقات الملخص ===== */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 no-print">
                <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">🧾</div>
                  <div>
                    <p className="text-sm text-gray-500">إجمالي الفواتير</p>
                    <p className="text-2xl font-bold text-gray-800">{summary.count}</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">⛽</div>
                  <div>
                    <p className="text-sm text-gray-500">إجمالي الكميات (لتر)</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {summary.totalQuantity.toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">💰</div>
                  <div>
                    <p className="text-sm text-gray-500">إجمالي المبالغ المستلمة</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatCurrency(summary.totalAmount)} <span className="text-sm font-normal text-gray-400">ر.س</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* ===== فلتر نوع الوقود ===== */}
              {invoices.length > 0 && (
                <div className="flex items-center gap-2 mb-4 no-print flex-wrap">
                  <span className="text-sm text-gray-500">تصفية حسب نوع الوقود:</span>
                  {fuelTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                        filterType === type
                          ? 'bg-orange-500 text-white shadow'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}

              {/* ===== جدول الفواتير ===== */}
              <div
                className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden"
                ref={printRef}
              >
                {/* رأس القسم القابل للطباعة */}
                <div className="print-only hidden px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">الفواتير المالية - شحنات الوقود المسلمة</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}
                  </p>
                </div>

                {filtered.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="text-gray-500 font-medium text-lg">لا توجد فواتير مسجلة حتى الآن</p>
                    <p className="text-gray-400 text-sm mt-2">
                      ستظهر الفواتير هنا بعد تسليم الشحنات وتأكيد استلام الدفعات
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-right text-gray-600 font-semibold whitespace-nowrap">#</th>
                          <th className="px-4 py-3 text-right text-gray-600 font-semibold whitespace-nowrap">رقم الفاتورة</th>
                          <th className="px-4 py-3 text-right text-gray-600 font-semibold whitespace-nowrap">تاريخ الطلب</th>
                          <th className="px-4 py-3 text-right text-gray-600 font-semibold whitespace-nowrap">اسم المنشأة</th>
                          <th className="px-4 py-3 text-right text-gray-600 font-semibold whitespace-nowrap">نوع الوقود</th>
                          <th className="px-4 py-3 text-right text-gray-600 font-semibold whitespace-nowrap">الكمية (لتر)</th>
                          <th className="px-4 py-3 text-right text-gray-600 font-semibold whitespace-nowrap">سعر اللتر (ر.س)</th>
                          <th className="px-4 py-3 text-right text-gray-600 font-semibold whitespace-nowrap">الإجمالي (ر.س)</th>
                          <th className="px-4 py-3 text-right text-gray-600 font-semibold whitespace-nowrap">تاريخ استلام المستحقات</th>
                          <th className="px-4 py-3 text-right text-gray-600 font-semibold whitespace-nowrap">الحالة المالية</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((inv, idx) => (
                          <tr
                            key={inv._id}
                            className={`border-b border-gray-100 transition hover:bg-orange-50/40 ${
                              idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                            }`}
                          >
                            <td className="px-4 py-3 text-gray-400 font-mono">{idx + 1}</td>
                            <td className="px-4 py-3 font-mono font-semibold text-orange-600 whitespace-nowrap">
                              {invoiceNumber(inv._id)}
                            </td>
                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDate(inv.createdAt)}</td>
                            <td className="px-4 py-3 text-gray-800 font-medium">{inv.facilityName}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                inv.fuelType === 'ديزل'
                                  ? 'bg-gray-200 text-gray-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {inv.fuelType}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700 font-medium text-left" dir="ltr">
                              {(inv.quantity || 0).toLocaleString('ar-SA')}
                            </td>
                            <td className="px-4 py-3 text-gray-700 text-left" dir="ltr">
                              {inv.pricePerLiter > 0 ? formatCurrency(inv.pricePerLiter) : '—'}
                            </td>
                            <td className="px-4 py-3 font-bold text-green-700 text-left" dir="ltr">
                              {inv.totalPrice > 0 ? formatCurrency(inv.totalPrice) : '—'}
                            </td>
                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                              {formatDate(inv.paymentDate)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                                PAYMENT_STATUS_STYLES[inv.paymentStatus] || 'bg-gray-100 text-gray-600'
                              }`}>
                                {inv.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {/* صف الإجمالي */}
                      <tfoot>
                        <tr className="bg-orange-50 border-t-2 border-orange-200">
                          <td colSpan={5} className="px-4 py-3 font-bold text-gray-700 text-right">
                            الإجمالي
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-800 text-left" dir="ltr">
                            {filtered.reduce((s, i) => s + (i.quantity || 0), 0).toLocaleString('ar-SA')}
                          </td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3 font-bold text-green-700 text-left" dir="ltr">
                            {formatCurrency(filtered.reduce((s, i) => s + (i.totalPrice || 0), 0))}
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      <Footer />

      {/* ===== أنماط الطباعة ===== */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          aside, header, footer { display: none !important; }
          main { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default FuelInvoicesPage;
