import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { History, RefreshCw, TrendingUp, Package, Tag } from 'lucide-react';
import useAuth from '../hooks/use-auth';

const PRODUCT_EMOJI = {
  'دجاج حي':    '🐔',
  'بيض مائدة':  '🥚',
  'بيض تفقيس':  '🐣',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
};

const STAT_CARDS = (records) => {
  if (!records.length) return [];
  const prices   = records.map((r) => r.pricePerKg);
  const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  return [
    { label: 'إجمالي العروض',    value: records.length,  icon: <History   className="w-5 h-5" />, color: 'from-orange-500 to-amber-500' },
    { label: 'متوسط السعر',       value: `${avgPrice} ر.س`, icon: <TrendingUp className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { label: 'أعلى سعر',          value: `${maxPrice} ر.س`, icon: <Tag        className="w-5 h-5" />, color: 'from-blue-500 to-indigo-500' },
    { label: 'أدنى سعر',          value: `${minPrice} ر.س`, icon: <Package    className="w-5 h-5" />, color: 'from-purple-500 to-violet-500' },
  ];
};

const PriceHistory = () => {
  const { user } = useAuth();
  const supplierId = user?._id || user?.id || null;

  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState('');

  const fetchHistory = useCallback(async () => {
    if (!supplierId) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(
        `http://localhost:5000/api/prices/supplier/${supplierId}`
      );
      setRecords(res.data?.data ?? []);
    } catch {
      setError('تعذّر جلب السجل التاريخي. تأكد من تشغيل الخادم وحاول مجدداً.');
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filtered = filter
    ? records.filter((r) => r.product === filter)
    : records;

  const stats = STAT_CARDS(records);

  return (
    <div className="max-w-6xl mx-auto" dir="rtl">

      {/* ===== رأس الصفحة ===== */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl flex-shrink-0">
            📊
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">
              سجل عروض الأسعار
            </h1>
            <p className="text-orange-100 text-sm mt-0.5">
              {user?.companyName || user?.name || 'تاجر مواد غذائية'} — عرض للقراءة فقط
            </p>
          </div>
        </div>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition font-medium text-sm disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* ===== بطاقات الإحصائيات ===== */}
      {records.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow border border-gray-100 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white flex-shrink-0`}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 truncate">{s.label}</p>
                <p className="text-lg font-bold text-gray-800 leading-tight">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== الجدول التاريخي ===== */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">

        {/* رأس البطاقة + فلتر */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-800">السجل التاريخي الكامل</h2>
            {records.length > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                {records.length} عرض
              </span>
            )}
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="">جميع المنتجات</option>
            <option value="دجاج حي">🐔 دجاج حي</option>
            <option value="بيض مائدة">🥚 بيض مائدة</option>
            <option value="بيض تفقيس">🐣 بيض تفقيس</option>
          </select>
        </div>

        {/* المحتوى */}
        {loading ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="text-4xl animate-bounce">📦</div>
            <p className="text-gray-500 text-sm">جارٍ تحميل السجل التاريخي...</p>
          </div>

        ) : error ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <div className="text-4xl">⚠️</div>
            <p className="text-red-500 text-sm text-center px-6">{error}</p>
            <button
              onClick={fetchHistory}
              className="text-sm text-orange-600 hover:underline font-medium"
            >
              إعادة المحاولة
            </button>
          </div>

        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="text-5xl">🗂️</div>
            <p className="text-gray-500 text-sm">
              {filter ? 'لا توجد عروض لهذا المنتج' : 'لم تُسجَّل أي عروض أسعار بعد'}
            </p>
            <p className="text-gray-400 text-xs">
              أضف عروضاً من صفحة «عروض الأسعار» وستظهر هنا
            </p>
          </div>

        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-orange-50 border-b border-orange-100">
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-orange-700 uppercase">#</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-orange-700 uppercase">المنتج</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-orange-700 uppercase">النوع/السلالة</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-orange-700 uppercase">المواصفات</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-orange-700 uppercase">السعر</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-orange-700 uppercase">الحد الأدنى</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-orange-700 uppercase">تاريخ العرض</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-orange-700 uppercase">تاريخ الإنشاء</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-orange-700 uppercase">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((offer, idx) => (
                  <tr
                    key={offer._id}
                    className={`hover:bg-orange-50/40 transition-colors ${!offer.available ? 'opacity-60' : ''}`}
                  >
                    <td className="px-5 py-4 text-sm text-gray-400 font-mono">{idx + 1}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                        {PRODUCT_EMOJI[offer.product] ?? '📦'} {offer.product}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{offer.type}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{offer.weight}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700">
                        {offer.pricePerKg} <span className="font-normal text-xs">ر.س</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {offer.minOrder} {offer.product?.includes('بيض') ? 'كرتون' : 'كجم'}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{offer.date || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{formatDate(offer.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        offer.available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {offer.available ? '● متوفر' : '○ غير متوفر'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* تذييل */}
        {filtered.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
            <span>البيانات مرتّبة من الأحدث إلى الأقدم</span>
            <span>يُعرض {filtered.length} من {records.length} عرض</span>
          </div>
        )}
      </div>

      {/* تنبيه */}
      <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
        <span className="text-xl flex-shrink-0">💡</span>
        <p>
          هذه الصفحة للعرض فقط — لإضافة عروض جديدة أو تعديل الحالية انتقل إلى صفحة
          <strong> «عروض الأسعار» </strong>
          من القائمة الجانبية.
        </p>
      </div>

    </div>
  );
};

export default PriceHistory;
