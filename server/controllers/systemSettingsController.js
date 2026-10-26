const SystemSettings = require('../models/SystemSettings');

// القيم الافتراضية تُستخدم فقط لتهيئة المستند عند أول استدعاء إن لم توجد بيانات محفوظة بعد
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

exports.getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({ sections: DEFAULT_SECTIONS });
    }
    res.json({ success: true, data: settings.sections, updatedAt: settings.updatedAt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'تعديل إعدادات النظام متاح لأدمن النظام فقط'
      });
    }

    const { sections } = req.body;
    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ success: false, message: 'بيانات الإعدادات غير صالحة' });
    }

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }
    settings.sections = sections;
    settings.updatedBy = req.userId;
    settings.updatedAt = Date.now();
    await settings.save();

    res.json({ success: true, data: settings.sections, updatedAt: settings.updatedAt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
