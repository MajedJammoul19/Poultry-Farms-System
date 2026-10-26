import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Save, X, Loader2 } from 'lucide-react';
import useAuth from '../hooks/use-auth';
import { getSystemSettings, updateSystemSettings } from '../api/auth';

const DEFAULT_SECTIONS = [
  {
    icon: '🏡',
    title: 'معلومات المزرعة',
    color: 'from-green-500 to-emerald-600',
    items: [
      { label: 'الاسم',   value: 'مزرعة الدواجن السعيدة' },
      { label: 'الموقع',  value: 'دمشق , الجمهورية العربية السورية' },
      { label: 'المساحة', value: '5000 متر مربع' },
    ],
  },
  {
    icon: '🐔',
    title: 'الحظائر وأنواع الدواجن',
    color: 'from-amber-500 to-orange-500',
    items: [
      { label: 'حظيرة 1', value: 'دجاج بياض' },
      { label: 'حظيرة 2', value: 'دجاج لاحم' },
    ],
  },
  {
    icon: '🌾',
    title: 'أنواع الأعلاف المستخدمة',
    color: 'from-yellow-500 to-amber-500',
    items: [
      { label: 'النوع الأول',  value: 'علف بروتين عالي' },
      { label: 'النوع الثاني', value: 'علف نمو' },
    ],
  },
  {
    icon: '🍽️',
    title: 'جداول التغذية',
    color: 'from-teal-500 to-cyan-600',
    items: [
      { label: 'عدد الوجبات',    value: 'ثلاث مرات يومياً' },
      { label: 'الكمية لكل طائر', value: '150 غرام يومياً' },
    ],
  },
  {
    icon: '💉',
    title: 'التطعيمات والعلاجات',
    color: 'from-blue-500 to-indigo-600',
    items: [
      { label: 'الدورية', value: 'كل 6 أشهر' },
      { label: 'الأسلوب', value: 'تطعيم دوري واهتمام بالنظافة' },
    ],
  },
  {
    icon: '🦠',
    title: 'الأمراض الشائعة',
    color: 'from-red-500 to-rose-600',
    items: [
      { label: 'المرض الشائع', value: 'إنفلونزا الطيور' },
      { label: 'العلاج',       value: 'التطعيم والاهتمام بالنظافة' },
    ],
  },
  {
    icon: '🥚',
    title: 'معايير الإنتاج',
    color: 'from-purple-500 to-violet-600',
    items: [
      { label: 'البيض المتوقع يومياً', value: '200 بيضة' },
      { label: 'آلية التتبع',          value: 'نظام إدارة لكل حظيرة' },
    ],
  },
  {
    icon: '🌡️',
    title: 'البيئة والتهوية',
    color: 'from-sky-500 to-blue-500',
    items: [
      { label: 'درجة الحرارة', value: '25 درجة مئوية' },
      { label: 'الرطوبة',      value: '60%' },
      { label: 'الإضاءة',      value: '12 ساعة يومياً' },
      { label: 'التهوية',      value: 'تهوية طبيعية مستمرة' },
    ],
  },
];

function SystemManegement() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_SECTIONS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getSystemSettings();
        if (res.success && Array.isArray(res.data) && res.data.length) {
          setSections(res.data);
        }
      } catch (err) {
        toast.error(err.message || 'تعذر تحميل إعدادات النظام');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startEdit = () => {
    setDraft(sections.map(section => ({
      ...section,
      items: section.items.map(item => ({ ...item })),
    })));
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
  };

  const changeItemValue = (sectionIdx, itemIdx, value) => {
    setDraft(prev => prev.map((section, sIdx) => {
      if (sIdx !== sectionIdx) return section;
      return {
        ...section,
        items: section.items.map((item, iIdx) =>
          iIdx === itemIdx ? { ...item, value } : item
        ),
      };
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateSystemSettings(draft);
      if (res.success) {
        setSections(res.data);
        setEditMode(false);
        toast.success('تم حفظ إعدادات النظام بنجاح');
      }
    } catch (err) {
      toast.error(err.message || 'تعذر حفظ إعدادات النظام');
    } finally {
      setSaving(false);
    }
  };

  const displayed = editMode ? draft : sections;

  return (
    <div className="max-w-5xl mx-auto" dir="rtl">

      {/* رأس الصفحة */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            ⚙️ إعدادات النظام
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            معلومات عامة عن المزرعة وإعداداتها التشغيلية
            {loading && ' — جارٍ التحميل...'}
          </p>
        </div>

        {isAdmin && !loading && (
          editMode ? (
            <div className="flex items-center gap-2">
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <X size={16} />
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold shadow hover:from-green-600 hover:to-emerald-700 transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          ) : (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-green-300 text-green-700 text-sm font-semibold shadow-sm hover:bg-green-50 transition-colors"
            >
              <Pencil size={16} />
              تعديل المعلومات
            </button>
          )
        )}
      </div>

      {/* شبكة البطاقات */}
      <div className="space-y-6">
        {displayed.map((section, sectionIdx) => (
          <div
            key={section.title}
            className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden"
          >
            {/* رأس البطاقة */}
            <div className={`bg-gradient-to-l ${section.color} px-6 py-4 flex items-center gap-3`}>
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
                {section.icon}
              </div>
              <h2 className="text-white font-bold text-base">{section.title}</h2>
            </div>

            {/* صفوف المعلومات */}
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.items.map((item, itemIdx) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-2 rounded-xl px-4 py-3 border bg-gray-50 border-gray-100"
                  >
                    <span className="text-xs text-gray-500 whitespace-nowrap">{item.label}</span>
                    {editMode ? (
                      <input
                        value={item.value}
                        onChange={(e) => changeItemValue(sectionIdx, itemIdx, e.target.value)}
                        className="flex-1 min-w-0 text-left font-semibold text-sm text-gray-800 bg-white border border-green-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                    ) : (
                      <span className="font-semibold text-sm text-gray-800">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemManegement;
