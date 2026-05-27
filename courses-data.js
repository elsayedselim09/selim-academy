/**
 * ════════════════════════════════════════════
 *   أكاديمية سليم — بيانات الكورسات
 *   courses-data.js
 *   لإضافة كورس جديد: أضف object في المصفوفة المناسبة
 *   لإضافة فئة جديدة: أضف object في CATEGORIES
 * ════════════════════════════════════════════
 */

window.SELIM_COURSES = {

  /* ══════════════════════════════════════
     الفئات — الترتيب هنا = الترتيب على الصفحة
  ══════════════════════════════════════ */
  CATEGORIES: [
    { id: 'school',    label: '🎓 التعليم المدرسي',          color: '#1A56DB', status: 'active'  },
    { id: 'languages', label: '🌍 اللغات',                   color: '#0E9F6E', status: 'active'  },
    { id: 'skills',    label: '💼 المهارات والعمل',           color: '#7C3AED', status: 'active'  },
    { id: 'crafts',    label: '🧵 الحرف والمهن',             color: '#D97706', status: 'active'  },
    { id: 'special',   label: '♿ ذوو الاحتياجات الخاصة',    color: '#059669', status: 'active'  },
    { id: 'family',    label: '👩‍👧 الأسرة والأطفال',          color: '#EC4899', status: 'active'  },
    { id: 'quran',     label: '🕌 القرآن والدراسات الإسلامية', color: '#B45309', status: 'active'  },
    { id: 'health',    label: '🩺 الصحة والجمال',            color: '#EF4444', status: 'coming'  },
    { id: 'finance',   label: '💰 المال والأعمال',            color: '#F59E0B', status: 'coming'  },
    { id: 'personal',  label: '🎤 التطوير الشخصي',           color: '#6366F1', status: 'coming'  },
  ],

  /* ══════════════════════════════════════
     الكورسات
     كل كورس:
       id        — معرف فريد (لا تكرر)
       category  — id الفئة
       icon      — إيموجي أو رابط صورة
       title     — اسم الكورس
       instructor — اسم المدرس
       level     — مستوى: 'مبتدئ' | 'متوسط' | 'متقدم' | 'جميع المستويات'
       duration  — المدة: '8 أسابيع'
       sessions  — عدد الحصص: '24 حصة'
       price     — السعر: '299 ر.س' | 'مجاني'
       badge     — شارة اختيارية: 'جديد' | 'الأكثر طلباً' | 'قريباً' | ''
       desc      — وصف قصير (جملة أو جملتين)
       waMsg     — رسالة واتساب عند الاشتراك
  ══════════════════════════════════════ */
  COURSES: [

    /* ─── 🎓 التعليم المدرسي ─── */
    {
      id: 'school-primary-math',
      category: 'school',
      icon: '🔢',
      title: 'رياضيات المرحلة الابتدائية',
      instructor: 'م. السيد سليم',
      level: 'مبتدئ',
      duration: '10 أسابيع',
      sessions: '30 حصة',
      price: '20 ر.س / حصة',
      badge: 'الأكثر طلباً',
      desc: 'أسس الرياضيات من الصفر بأسلوب ممتع يناسب الأطفال — جمع وطرح وضرب وقسمة وحل مسائل.',
      waMsg: 'أريد الاشتراك في كورس: رياضيات المرحلة الابتدائية'
    },
    {
      id: 'school-mid-science',
      category: 'school',
      icon: '🔬',
      title: 'علوم المرحلة المتوسطة',
      instructor: 'م. السيد سليم',
      level: 'متوسط',
      duration: '12 أسبوع',
      sessions: '36 حصة',
      price: '20 ر.س / حصة',
      badge: '',
      desc: 'شرح شامل لمناهج العلوم المتوسطة — أحياء وكيمياء وفيزياء بأسلوب تفاعلي.',
      waMsg: 'أريد الاشتراك في كورس: علوم المرحلة المتوسطة'
    },
    {
      id: 'school-high-physics',
      category: 'school',
      icon: '⚛️',
      title: 'فيزياء الثانوية العامة',
      instructor: 'م. السيد سليم',
      level: 'متقدم',
      duration: '16 أسبوع',
      sessions: '48 حصة',
      price: '20 ر.س / حصة',
      badge: 'الأكثر طلباً',
      desc: 'استعداد كامل لامتحانات الفيزياء — شرح القوانين وحل مسائل وأوراق عمل ومراجعات.',
      waMsg: 'أريد الاشتراك في كورس: فيزياء الثانوية العامة'
    },
    {
      id: 'school-high-chem',
      category: 'school',
      icon: '🧪',
      title: 'كيمياء الثانوية العامة',
      instructor: 'م. السيد سليم',
      level: 'متقدم',
      duration: '16 أسبوع',
      sessions: '48 حصة',
      price: '20 ر.س / حصة',
      badge: '',
      desc: 'الكيمياء بطريقة مبسطة — معادلات ومفاهيم وتدريبات على نمط الامتحانات الحقيقية.',
      waMsg: 'أريد الاشتراك في كورس: كيمياء الثانوية العامة'
    },
    {
      id: 'school-foundation-read',
      category: 'school',
      icon: '📖',
      title: 'تأسيس القراءة والكتابة',
      instructor: 'م. السيد سليم',
      level: 'مبتدئ',
      duration: '8 أسابيع',
      sessions: '24 حصة',
      price: '20 ر.س / حصة',
      badge: 'جديد',
      desc: 'برنامج متكامل لتأسيس مهارات القراءة والكتابة العربية للأطفال من سن 4 إلى 8 سنوات.',
      waMsg: 'أريد الاشتراك في كورس: تأسيس القراءة والكتابة'
    },
    {
      id: 'school-high-math',
      category: 'school',
      icon: '📐',
      title: 'رياضيات الثانوية العامة',
      instructor: 'م. السيد سليم',
      level: 'متقدم',
      duration: '16 أسبوع',
      sessions: '48 حصة',
      price: '20 ر.س / حصة',
      badge: '',
      desc: 'رياضيات الثانوية من الألف للياء — جبر وهندسة وتفاضل وتكامل مع تدريبات مكثفة.',
      waMsg: 'أريد الاشتراك في كورس: رياضيات الثانوية العامة'
    },

    /* ─── 🌍 اللغات ─── */
    {
      id: 'lang-english-conv',
      category: 'languages',
      icon: '🇬🇧',
      title: 'المحادثة الإنجليزية',
      instructor: 'قريباً',
      level: 'جميع المستويات',
      duration: '10 أسابيع',
      sessions: '20 حصة',
      price: 'قريباً',
      badge: 'جديد',
      desc: 'تحدث الإنجليزية بثقة — جلسات محادثة تفاعلية تبني الطلاقة والثقة بالنفس.',
      waMsg: 'أريد الاشتراك في كورس: المحادثة الإنجليزية'
    },
    {
      id: 'lang-english-grammar',
      category: 'languages',
      icon: '📝',
      title: 'قواعد اللغة الإنجليزية',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: '8 أسابيع',
      sessions: '24 حصة',
      price: 'قريباً',
      badge: '',
      desc: 'Grammar من الصفر — تعلم القواعد بطريقة منطقية وتطبيقها في الكتابة والكلام.',
      waMsg: 'أريد الاشتراك في كورس: قواعد اللغة الإنجليزية'
    },
    {
      id: 'lang-french',
      category: 'languages',
      icon: '🇫🇷',
      title: 'اللغة الفرنسية للمبتدئين',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: '12 أسبوع',
      sessions: '24 حصة',
      price: 'قريباً',
      badge: 'قريباً',
      desc: 'ابدأ رحلتك مع الفرنسية — أساسيات النطق والمفردات والجمل اليومية.',
      waMsg: 'أريد الاشتراك في كورس: اللغة الفرنسية للمبتدئين'
    },
    {
      id: 'lang-german',
      category: 'languages',
      icon: '🇩🇪',
      title: 'اللغة الألمانية للمبتدئين',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: '12 أسبوع',
      sessions: '24 حصة',
      price: 'قريباً',
      badge: 'قريباً',
      desc: 'تعلم الألمانية من الصفر — النطق الصحيح والمفردات الأساسية والتراكيب اليومية.',
      waMsg: 'أريد الاشتراك في كورس: اللغة الألمانية للمبتدئين'
    },
    {
      id: 'lang-arabic-foreign',
      category: 'languages',
      icon: '🌙',
      title: 'العربية للناطقين بغيرها',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: '16 أسبوع',
      sessions: '32 حصة',
      price: 'قريباً',
      badge: 'قريباً',
      desc: 'تعلم العربية لغير الناطقين بها — نطق وكتابة وقراءة وتواصل يومي.',
      waMsg: 'أريد الاشتراك في كورس: العربية للناطقين بغيرها'
    },

    /* ─── 💼 المهارات والعمل ─── */
    {
      id: 'skills-coding-beginner',
      category: 'skills',
      icon: '💻',
      title: 'البرمجة للمبتدئين',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: '10 أسابيع',
      sessions: '30 حصة',
      price: 'قريباً',
      badge: 'قريباً',
      desc: 'ادخل عالم البرمجة من الصفر — Python وأساسيات التفكير البرمجي بطريقة عملية.',
      waMsg: 'أريد الاشتراك في كورس: البرمجة للمبتدئين'
    },
    {
      id: 'skills-webdev',
      category: 'skills',
      icon: '🌐',
      title: 'تطوير المواقع',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: '14 أسبوع',
      sessions: '42 حصة',
      price: 'قريباً',
      badge: 'قريباً',
      desc: 'من الصفر لموقع حقيقي — HTML وCSS وJavaScript وبناء مشاريع عملية.',
      waMsg: 'أريد الاشتراك في كورس: تطوير المواقع'
    },
    {
      id: 'skills-graphic',
      category: 'skills',
      icon: '🎨',
      title: 'التصميم الجرافيكي',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: '8 أسابيع',
      sessions: '24 حصة',
      price: 'قريباً',
      badge: 'قريباً',
      desc: 'تعلم Canva وAdobe بطريقة احترافية — تصميم للسوشيال ميديا والشركات.',
      waMsg: 'أريد الاشتراك في كورس: التصميم الجرافيكي'
    },
    {
      id: 'skills-marketing',
      category: 'skills',
      icon: '📱',
      title: 'التسويق الإلكتروني',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: '8 أسابيع',
      sessions: '24 حصة',
      price: 'قريباً',
      badge: 'قريباً',
      desc: 'إدارة السوشيال ميديا والإعلانات المدفوعة وبناء هوية رقمية لأي مشروع.',
      waMsg: 'أريد الاشتراك في كورس: التسويق الإلكتروني'
    },
    {
      id: 'skills-freelance',
      category: 'skills',
      icon: '🚀',
      title: 'العمل الحر Freelancing',
      instructor: 'قريباً',
      level: 'متوسط',
      duration: '6 أسابيع',
      sessions: '18 حصة',
      price: 'قريباً',
      badge: 'قريباً',
      desc: 'ابدأ حياتك المهنية المستقلة — منصات العمل الحر والتسعير وإدارة العملاء.',
      waMsg: 'أريد الاشتراك في كورس: العمل الحر Freelancing'
    },

    /* ─── 🧵 الحرف والمهن ─── */
    {
      id: 'crafts-sewing',
      category: 'crafts',
      icon: '🧵',
      title: 'الخياطة الأونلاين',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: '10 أسابيع',
      sessions: '30 حصة',
      price: 'قريباً',
      badge: 'جديد',
      desc: 'تعلمي الخياطة من بيتك — قياسات وأنماط وخياطة ملابس حقيقية خطوة بخطوة.',
      waMsg: 'أريد الاشتراك في كورس: الخياطة الأونلاين'
    },
    {
      id: 'crafts-crochet',
      category: 'crafts',
      icon: '🪡',
      title: 'الكروشيه والتريكو',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: '6 أسابيع',
      sessions: '18 حصة',
      price: 'قريباً',
      badge: '',
      desc: 'ابدأي من الغرزة الأولى — كروشيه وتريكو لصنع ملابس وإكسسوارات يدوية.',
      waMsg: 'أريد الاشتراك في كورس: الكروشيه والتريكو'
    },
    {
      id: 'crafts-cooking',
      category: 'crafts',
      icon: '🍳',
      title: 'الطبخ والحلويات',
      instructor: 'قريباً',
      level: 'جميع المستويات',
      duration: '8 أسابيع',
      sessions: '24 حصة',
      price: 'قريباً',
      badge: 'قريباً',
      desc: 'وصفات عملية وأسرار المطبخ — من الأكلات اليومية لأشهى الحلويات الشرقية.',
      waMsg: 'أريد الاشتراك في كورس: الطبخ والحلويات'
    },
    {
      id: 'crafts-embroidery',
      category: 'crafts',
      icon: '🌸',
      title: 'التطريز اليدوي',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: '6 أسابيع',
      sessions: '18 حصة',
      price: 'قريباً',
      badge: '',
      desc: 'فن التطريز من الأساسيات — غرز متنوعة ومشاريع جميلة يمكن بيعها.',
      waMsg: 'أريد الاشتراك في كورس: التطريز اليدوي'
    },

    /* ─── ♿ ذوو الاحتياجات الخاصة ─── */
    {
      id: 'special-blind',
      category: 'special',
      icon: '👁️',
      title: 'تعليم المكفوفين أونلاين',
      instructor: 'قريباً',
      level: 'جميع المستويات',
      duration: 'مستمر',
      sessions: 'حسب الحاجة',
      price: 'قريباً',
      badge: 'جديد',
      desc: 'برنامج متخصص لتعليم ذوي الإعاقة البصرية — محتوى صوتي وتقنيات مساعدة.',
      waMsg: 'أريد الاشتراك في كورس: تعليم المكفوفين أونلاين'
    },
    {
      id: 'special-sign',
      category: 'special',
      icon: '🤟',
      title: 'لغة الإشارة',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: '10 أسابيع',
      sessions: '20 حصة',
      price: 'قريباً',
      badge: 'جديد',
      desc: 'تعلم التواصل مع الصم وضعاف السمع — لغة الإشارة العربية خطوة بخطوة.',
      waMsg: 'أريد الاشتراك في كورس: لغة الإشارة'
    },
    {
      id: 'special-speech',
      category: 'special',
      icon: '🗣️',
      title: 'التخاطب والنطق',
      instructor: 'قريباً',
      level: 'جميع المستويات',
      duration: 'مستمر',
      sessions: 'حسب الحاجة',
      price: 'قريباً',
      badge: '',
      desc: 'جلسات متخصصة لعلاج صعوبات النطق والكلام للأطفال والكبار.',
      waMsg: 'أريد الاشتراك في كورس: التخاطب والنطق'
    },
    {
      id: 'special-skills',
      category: 'special',
      icon: '🌟',
      title: 'تنمية مهارات ذوي الاحتياجات',
      instructor: 'قريباً',
      level: 'جميع المستويات',
      duration: 'مستمر',
      sessions: 'حسب الحاجة',
      price: 'قريباً',
      badge: '',
      desc: 'برامج مخصصة لتنمية المهارات الحياتية والأكاديمية لذوي الاحتياجات الخاصة.',
      waMsg: 'أريد الاشتراك في كورس: تنمية مهارات ذوي الاحتياجات'
    },

    /* ─── 👩‍👧 الأسرة والأطفال ─── */
    {
      id: 'family-quran-kids',
      category: 'family',
      icon: '📿',
      title: 'تعليم القرآن للأطفال',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: 'مستمر',
      sessions: 'حصص أسبوعية',
      price: 'قريباً',
      badge: 'قريباً',
      desc: 'حفظ وتجويد القرآن الكريم للأطفال بأسلوب ممتع ومحبب.',
      waMsg: 'أريد الاشتراك في كورس: تعليم القرآن للأطفال'
    },
    {
      id: 'family-drawing',
      category: 'family',
      icon: '🎨',
      title: 'الرسم والفنون للأطفال',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: '8 أسابيع',
      sessions: '16 حصة',
      price: 'قريباً',
      badge: '',
      desc: 'اكتشف موهبة طفلك — رسم وتلوين وفنون إبداعية مناسبة لجميع الأعمار.',
      waMsg: 'أريد الاشتراك في كورس: الرسم والفنون للأطفال'
    },
    {
      id: 'family-parenting',
      category: 'family',
      icon: '👨‍👩‍👦',
      title: 'التربية الإيجابية',
      instructor: 'قريباً',
      level: 'جميع المستويات',
      duration: '6 أسابيع',
      sessions: '12 حصة',
      price: 'قريباً',
      badge: 'جديد',
      desc: 'دليل الوالدين العصري — كيف تتعامل مع أطفالك وتبني علاقة صحية ومتينة.',
      waMsg: 'أريد الاشتراك في كورس: التربية الإيجابية'
    },
    {
      id: 'family-robotics',
      category: 'family',
      icon: '🤖',
      title: 'الروبوتات للأطفال',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: '10 أسابيع',
      sessions: '20 حصة',
      price: 'قريباً',
      badge: 'قريباً',
      desc: 'عالم الروبوتات للأطفال — تفكير منطقي وبرمجة أساسية بطريقة ممتعة.',
      waMsg: 'أريد الاشتراك في كورس: الروبوتات للأطفال'
    },

    /* ─── 🕌 القرآن والدراسات الإسلامية ─── */
    {
      id: 'quran-hifz',
      category: 'quran',
      icon: '📖',
      title: 'تحفيظ القرآن الكريم',
      instructor: 'قريباً',
      level: 'جميع المستويات',
      duration: 'مستمر',
      sessions: 'حصص أسبوعية',
      price: 'قريباً',
      badge: 'قريباً',
      desc: 'حفظ القرآن الكريم مع متابعة فردية ومستمرة — للكبار والصغار.',
      waMsg: 'أريد الاشتراك في كورس: تحفيظ القرآن الكريم'
    },
    {
      id: 'quran-tajweed',
      category: 'quran',
      icon: '🔤',
      title: 'أحكام التجويد',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: '8 أسابيع',
      sessions: '24 حصة',
      price: 'قريباً',
      badge: '',
      desc: 'تعلم أحكام التجويد من الصفر — مخارج الحروف وصفاتها وقواعد التلاوة الصحيحة.',
      waMsg: 'أريد الاشتراك في كورس: أحكام التجويد'
    },
    {
      id: 'quran-nooraniyya',
      category: 'quran',
      icon: '✨',
      title: 'القاعدة النورانية',
      instructor: 'قريباً',
      level: 'مبتدئ',
      duration: '6 أسابيع',
      sessions: '18 حصة',
      price: 'قريباً',
      badge: 'جديد',
      desc: 'طريقة القاعدة النورانية لتعليم القرآن — نطق صحيح وأساس قوي للحفظ.',
      waMsg: 'أريد الاشتراك في كورس: القاعدة النورانية'
    },
    {
      id: 'quran-tafseer',
      category: 'quran',
      icon: '💡',
      title: 'التفسير المبسط',
      instructor: 'قريباً',
      level: 'متوسط',
      duration: 'مستمر',
      sessions: 'حصص أسبوعية',
      price: 'قريباً',
      badge: '',
      desc: 'فهم معاني القرآن — تفسير مبسط للآيات وربطها بالحياة اليومية.',
      waMsg: 'أريد الاشتراك في كورس: التفسير المبسط'
    },
    {
      id: 'quran-seerah',
      category: 'quran',
      icon: '🌙',
      title: 'السيرة النبوية',
      instructor: 'قريباً',
      level: 'جميع المستويات',
      duration: '10 أسابيع',
      sessions: '20 حصة',
      price: 'قريباً',
      badge: '',
      desc: 'رحلة في حياة النبي ﷺ — سيرة شاملة وممتعة تربط الماضي بالحاضر.',
      waMsg: 'أريد الاشتراك في كورس: السيرة النبوية'
    },

  ]
};
