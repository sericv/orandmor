import { useRef, useState, type ReactNode } from 'react';
import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  LayoutGrid,
  Loader2,
} from 'lucide-react';
import { MENU_DEFAULTS } from '../../config/cafeConfig';
import {
  AddProductVisual,
  BulkPriceVisual,
  CategoriesVisual,
  DeleteVisual,
  EditProductVisual,
  OverviewVisual,
  TipsVisual,
  VisibilityVisual,
} from './GuideVisuals';

interface GuideSlide {
  id: string;
  sectionNumber?: string;
  title: string;
  subtitle?: string;
  visual?: ReactNode;
  steps?: string[];
  note?: string;
  isCover?: boolean;
}

const GUIDE_SLIDES: GuideSlide[] = [
  {
    id: 'cover',
    isCover: true,
    title: 'دليل استخدام لوحة التحكم',
    subtitle: 'مرجع مبسط وعملي لإدارة قائمة المنيو الإلكتروني بسهولة من الجوال أو الكمبيوتر.',
  },
  {
    id: 'overview',
    sectionNumber: '01',
    title: 'التعرف على لوحة التحكم',
    subtitle: 'التنقل السريع بين أقسام الإدارة من القائمة الجانبية أو الشريط السفلي.',
    visual: <OverviewVisual />,
    steps: [
      'الرئيسية: تعرض إحصائيات سريعة (إجمالي المنتجات، التصنيفات، الظاهرة، والمخفية) مع أحدث المنتجات المضافة.',
      'المنتجات: لإضافة وتعديل وحذف المنتجات، والبحث عنها، والتحكم بظهورها.',
      'التصنيفات: لإنشاء أقسام المنيو وتغيير ترتيبها وإخفائها أو إظهارها.',
      'تعديل الأسعار: لزيادة أو تخفيض أسعار جميع منتجات المقهى دفعة واحدة.',
      'عرض المنيو العام وتسجيل الخروج: متوفرة أسفل القائمة الجانبية.',
    ],
  },
  {
    id: 'add-product',
    sectionNumber: '02',
    title: 'إضافة منتج جديد',
    subtitle: 'خطوات إضافة صنف جديد ليظهر مباشرة في المنيو الإلكتروني.',
    visual: <AddProductVisual />,
    steps: [
      'ادخل إلى قسم «المنتجات» ثم اضغط على زر «إضافة منتج» أعلى الصفحة.',
      'اضغط «اختيار صورة» لرفع صورة واضحة للمنتج (تُضغط وتُجهّز تلقائيًا).',
      'أدخل «اسم المنتج»، ثم «السعر (ريال سعودي)»، واختر «التصنيف» المناسب.',
      'أضف «الوصف» و«السعرات الحرارية» عند توفرها (حقول اختيارية).',
      'حدّد الخيارات المناسبة: «ظاهر في المنيو»، «منتج جديد»، «منتج شائع»، أو «الأكثر طلبًا»، ثم اضغط «إضافة المنتج».',
    ],
  },
  {
    id: 'edit-product',
    sectionNumber: '03',
    title: 'تعديل منتج',
    subtitle: 'تحديث بيانات أي منتج موجود بسهولة وسرعة.',
    visual: <EditProductVisual />,
    steps: [
      'من قسم «المنتجات»، استخدم خانة «ابحث باسم المنتج» أو قائمة «جميع التصنيفات» للوصول السريع للمنتج.',
      'اضغط على زر «تعديل» بجانب المنتج المطلوب.',
      'عدّل الاسم أو السعر أو التصنيف أو الوصف أو السعرات الحرارية حسب الحاجة.',
      'لتغيير الصورة اضغط «تغيير الصورة»، وإذا لم تختر صورة جديدة فستبقى الصورة القديمة محفوظة تلقائيًا.',
      'اضغط على زر «حفظ التعديلات» لتحديث المنيو فورًا.',
    ],
  },
  {
    id: 'visibility',
    sectionNumber: '04',
    title: 'إظهار وإخفاء المنتجات',
    subtitle: 'إيقاف عرض منتج مؤقتًا عند نفاد الكمية دون حذف بياناته.',
    visual: <VisibilityVisual />,
    steps: [
      'لإخفاء أو إظهار منتج واحد: اضغط على مفتاح التبديل (ظاهر / مخفي) بجانب المنتج مباشرة.',
      'لإخفاء أو إظهار عدة منتجات معًا: ضع علامة صح في مربع التحديد بجانب المنتجات المطلوبة (أو اضغط «تحديد الكل»).',
      'من الشريط البني الذي يظهر بالأعلى، اضغط على «إخفاء» أو «إظهار».',
      'المنتجات المخفية لا تظهر للعملاء في المنيو العام، ويمكن إعادة إظهارها في أي وقت.',
    ],
  },
  {
    id: 'delete-product',
    sectionNumber: '05',
    title: 'حذف المنتجات',
    subtitle: 'حذف منتج واحد أو مجموعة منتجات نهائيًا مع حماية من الحذف بالخطأ.',
    visual: <DeleteVisual />,
    steps: [
      'لحذف منتج واحد: اضغط على أيقونة سلة المهملات الحمراء بجانب المنتج، ثم اضغط «حذف المنتج» للتأكيد.',
      'لحذف عدة منتجات دفعة واحدة: حدّد المنتجات المطلوبة ثم اضغط «حذف» من شريط الإجراءات الجماعية.',
      'عند تحديد أكثر من 5 منتجات، سيطلب النظام كتابة عبارة «تأكيد الحذف» قبل تفعيل زر الحذف.',
    ],
    note: 'تنبيه مهم: حذف المنتج إجراء نهائي ولا يمكن التراجع عنه؛ إذا أردت إخفاءه مؤقتًا استخدم خيار «إخفاء» بدل الحذف.',
  },
  {
    id: 'categories',
    sectionNumber: '06',
    title: 'إدارة التصنيفات',
    subtitle: 'تنظيم أقسام المنيو وترتيب ظهورها للعملاء.',
    visual: <CategoriesVisual />,
    steps: [
      'ادخل إلى قسم «التصنيفات» واضغط «إضافة تصنيف» لإنشاء قسم جديد يظهر تلقائيًا في المنيو.',
      'اضغط «تعديل» على أي تصنيف لتغيير اسمه، أو صورته الاختيارية، أو رقم «ترتيب الظهور».',
      'استخدم مفتاح (ظاهر / مخفي) للتحكم في ظهور التصنيف بالكامل داخل المنيو.',
      'لحذف تصنيف اضغط أيقونة الحذف؛ وإذا كان مرتبطًا بمنتجات سيُنبّهك النظام لنقلها أو حذفها أولًا.',
    ],
  },
  {
    id: 'bulk-prices',
    sectionNumber: '07',
    title: 'تعديل الأسعار دفعة واحدة',
    subtitle: 'زيادة أو تخفيض أسعار جميع منتجات المقهى بمبلغ ثابت بالريال.',
    visual: <BulkPriceVisual />,
    steps: [
      'ادخل إلى قسم «تعديل الأسعار» من القائمة الجانبية.',
      'اختر العملية المطلوبة: «زيادة الأسعار (+)» أو «تخفيض الأسعار (-)».',
      'أدخل مبلغ التعديل الثابت بالريال السعودي (مثال: 2 ريال)، ثم اضغط «معاينة الأسعار قبل التطبيق».',
      'راجع السعر القديم والجديد لكل منتج (يمنع النظام أي سعر من النزول أقل من الصفر).',
      'بعد التأكد من المعاينة، اضغط على زر «تأكيد تطبيق الأسعار».',
    ],
    note: 'ملاحظة: يُطبّق التعديل على جميع منتجات المقهى الحالي فقط دون تغيير الأسماء أو الصور.',
  },
  {
    id: 'tips',
    sectionNumber: '08',
    title: 'نصائح مهمة لإدارة المنيو',
    subtitle: 'خطوات بسيطة تضمن ظهور المنيو بأفضل صورة دائمًا لعملائك.',
    visual: <TipsVisual />,
    steps: [
      'راجع السعر ورقم السعرات الحرارية جيدًا قبل الضغط على زر الحفظ.',
      'استخدم صورًا واضحة ومشرقة للمنتجات حتى تظهر بأناقة داخل بطاقات المنيو.',
      'تأكد من اختيار التصنيف الصحيح عند إضافة أي منتج جديد.',
      'استخدم «إخفاء» عند نفاد الصنف مؤقتًا بدل حذفه لتسهيل إعادته لاحقًا.',
      'افتح «عرض المنيو العام» بعد كل تعديل مهم للتأكد من ظهور التغييرات كما تريد.',
    ],
  },
];

function GuideSlideCard({
  slide,
  pageIndex,
  totalPages,
  cafeName,
}: {
  slide: GuideSlide;
  pageIndex: number;
  totalPages: number;
  cafeName: string;
}) {
  if (slide.isCover) {
    return (
      <div
        dir="rtl"
        className="relative flex h-[640px] w-[360px] flex-col justify-between overflow-hidden rounded-[26px] bg-[#F7F3ED] p-6 text-[#2B1F19] border border-[#2B1F19]/10 shadow-sm"
      >
        {/* Subtle decorative top accent bar */}
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-[#EFE9DF] px-3 py-1 text-[11px] font-semibold text-[#8B5A3C]">
            دليل الموظفين والإدارة
          </span>
          <span className="font-latin text-[11px] font-medium text-[#8A786D]">
            {MENU_DEFAULTS.subtitle}
          </span>
        </div>

        {/* Center Cover Content */}
        <div className="flex flex-col items-center text-center my-auto py-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[22px] bg-[#FFFDF9] p-2.5 border border-[#2B1F19]/10 shadow-xs">
            <img
              src={`${import.meta.env.BASE_URL}images/or-and-mor-logo.jpg`}
              alt={cafeName}
              width={72}
              height={72}
              className="h-full w-full object-contain mix-blend-multiply"
            />
          </div>

          <p className="mt-4 text-[13px] font-semibold text-[#8B5A3C]">
            {cafeName}
          </p>

          <h2 className="mt-1.5 text-[24px] font-bold leading-snug text-[#2B1F19]">
            {slide.title}
          </h2>

          <p className="mt-2.5 max-w-[28ch] text-[13px] leading-[1.7] text-[#6A584E]">
            {slide.subtitle}
          </p>

          {/* Compact Table of Contents */}
          <div className="mt-6 w-full rounded-[18px] bg-[#FFFDF9] p-3.5 text-right border border-[#2B1F19]/8">
            <p className="mb-2 text-[11.5px] font-semibold text-[#8B5A3C]">
              محتويات الدليل
            </p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] font-medium text-[#2B1F19]">
              <span>١. التعرف على اللوحة</span>
              <span>٥. حذف المنتجات</span>
              <span>٢. إضافة منتج جديد</span>
              <span>٦. إدارة التصنيفات</span>
              <span>٣. تعديل منتج</span>
              <span>٧. تعديل الأسعار</span>
              <span>٤. الإظهار والإخفاء</span>
              <span>٨. نصائح مهمة</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#2B1F19]/10 pt-3 text-[10.5px] text-[#8A786D]">
          <span>مخصص للقراءة على الجوال</span>
          <span className="tabular-nums">
            صفحة {pageIndex + 1} من {totalPages}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="relative flex h-[640px] w-[360px] flex-col justify-between overflow-hidden rounded-[26px] bg-[#F7F3ED] p-5 text-[#2B1F19] border border-[#2B1F19]/10 shadow-sm"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#2B1F19]/8 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 min-w-[26px] items-center justify-center rounded-full bg-[#8B5A3C] px-1.5 text-[11px] font-bold text-[#FFFDF9] tabular-nums">
            {slide.sectionNumber}
          </span>
          <span className="text-[11px] font-medium text-[#6A584E]">
            {cafeName}
          </span>
        </div>
        <span className="font-latin text-[10px] font-medium text-[#8A786D]">
          {MENU_DEFAULTS.subtitle}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-3 flex flex-col justify-start">
        <h2 className="text-[19px] font-bold leading-snug text-[#2B1F19]">
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="mt-1 text-[11.5px] leading-relaxed text-[#6A584E]">
            {slide.subtitle}
          </p>
        )}

        {/* Authentic UI Visual */}
        {slide.visual && <div className="mt-3">{slide.visual}</div>}

        {/* Numbered Steps */}
        {slide.steps && (
          <ol className="mt-3.5 space-y-2">
            {slide.steps.map((step, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-[11.5px] leading-[1.55] text-[#2B1F19]"
              >
                <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#EFE9DF] text-[10px] font-bold text-[#8B5A3C] tabular-nums">
                  {idx + 1}
                </span>
                <span className="flex-1">{step}</span>
              </li>
            ))}
          </ol>
        )}

        {/* Optional Note */}
        {slide.note && (
          <div className="mt-3 rounded-[12px] bg-[#8B5A3C]/10 px-3 py-2 text-[10.5px] font-medium leading-relaxed text-[#6E4329] border border-[#8B5A3C]/20">
            {slide.note}
          </div>
        )}
      </div>

      {/* Page Footer */}
      <div className="flex items-center justify-between border-t border-[#2B1F19]/8 pt-2.5 text-[10px] text-[#8A786D]">
        <span>دليل استخدام لوحة التحكم</span>
        <span className="tabular-nums font-medium">
          {pageIndex + 1} / {totalPages}
        </span>
      </div>
    </div>
  );
}

interface AdminGuidePageProps {
  cafeName: string;
}

export function AdminGuidePage({ cafeName }: AdminGuidePageProps) {
  const [previewMode, setPreviewMode] = useState<'single' | 'all'>('single');
  const [currentPage, setCurrentPage] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleDownloadPdf = async () => {
    if (exporting) return;
    setExporting(true);
    setExportError(null);
    setExportProgress('جاري تجهيز الخطوط والصفحات...');

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const [{ toPng }, { jsPDF }] = await Promise.all([
        import('html-to-image'),
        import('jspdf'),
      ]);

      // Mobile-first 9:16 portrait PDF (108mm × 192mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [108, 192],
        compress: true,
      });

      for (let i = 0; i < GUIDE_SLIDES.length; i++) {
        setExportProgress(
          `جاري تجهيز الصفحة ${i + 1} من ${GUIDE_SLIDES.length}...`
        );
        const node = exportRefs.current[i];
        if (!node) continue;

        const dataUrl = await toPng(node, {
          pixelRatio: 2.2,
          cacheBust: true,
          backgroundColor: '#F7F3ED',
          width: 360,
          height: 640,
        });

        if (i > 0) {
          pdf.addPage([108, 192], 'portrait');
        }
        pdf.addImage(dataUrl, 'PNG', 0, 0, 108, 192, undefined, 'FAST');
      }

      pdf.save('Coffee-and-More-Admin-Guide.pdf');
    } catch {
      setExportError('تعذر إنشاء ملف PDF. يرجى المحاولة مرة أخرى.');
    } finally {
      setExporting(false);
      setExportProgress(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header + Download CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="hidden lg:block text-[22px] font-semibold text-[var(--text-primary)]">
            دليل الاستخدام
          </h1>
          <p className="text-[13.5px] text-[var(--text-secondary)]">
            دليل عملي مبسط لإدارة المنيو ({GUIDE_SLIDES.length} صفحات بمقاس جوال
            9:16 جاهزة للمشاركة)
          </p>
        </div>

        <button
          type="button"
          disabled={exporting}
          onClick={handleDownloadPdf}
          className="pressable inline-flex min-h-[46px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[var(--accent)] px-5 text-[15px] font-medium text-[#FFFDF9] shadow-[var(--shadow-chip-active)] disabled:opacity-65 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <>
              <Loader2
                size={17}
                strokeWidth={2}
                className="animate-spin"
                aria-hidden="true"
              />
              <span>{exportProgress ?? 'جاري تجهيز PDF...'}</span>
            </>
          ) : (
            <>
              <Download size={17} strokeWidth={1.9} aria-hidden="true" />
              <span>تحميل دليل الاستخدام PDF</span>
            </>
          )}
        </button>
      </div>

      {exportError && (
        <div
          role="alert"
          className="rounded-[14px] bg-[#A63A3A]/[0.08] px-4 py-3 text-[13px] font-medium text-[#8E2A2A] border border-[#A63A3A]/20"
        >
          {exportError}
        </div>
      )}

      {/* Preview Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-[var(--bg-surface)] px-4 py-3 border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--text-primary)]">
          <BookOpenText
            size={17}
            strokeWidth={1.75}
            className="text-[var(--accent)]"
            aria-hidden="true"
          />
          <span>معاينة الدليل قبل التحميل</span>
        </div>

        <div className="inline-flex items-center gap-1 rounded-[12px] bg-[var(--bg-subtle)]/80 p-1 border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setPreviewMode('single')}
            className={[
              'pressable inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-[9px] px-3 text-[12.5px] font-medium',
              previewMode === 'single'
                ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-2xs'
                : 'text-[var(--text-muted)]',
            ].join(' ')}
          >
            <Eye size={14} strokeWidth={1.75} aria-hidden="true" />
            <span>صفحة بصفحة</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewMode('all')}
            className={[
              'pressable inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-[9px] px-3 text-[12.5px] font-medium',
              previewMode === 'all'
                ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-2xs'
                : 'text-[var(--text-muted)]',
            ].join(' ')}
          >
            <LayoutGrid size={14} strokeWidth={1.75} aria-hidden="true" />
            <span>جميع الصفحات</span>
          </button>
        </div>
      </div>

      {/* Live Preview Area */}
      {previewMode === 'single' ? (
        <div className="flex flex-col items-center space-y-4">
          {/* Interactive Page Navigation */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              aria-label="الصفحة السابقة"
              className="pressable flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} strokeWidth={1.8} />
            </button>

            <span className="min-w-[110px] text-center text-[13.5px] font-semibold tabular-nums text-[var(--text-primary)]">
              صفحة {currentPage + 1} من {GUIDE_SLIDES.length}
            </span>

            <button
              type="button"
              disabled={currentPage === GUIDE_SLIDES.length - 1}
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(GUIDE_SLIDES.length - 1, p + 1)
                )
              }
              aria-label="الصفحة التالية"
              className="pressable flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} strokeWidth={1.8} />
            </button>
          </div>

          {/* Centered 9:16 Mobile Slide Preview */}
          <div className="flex justify-center max-w-full overflow-x-auto pb-2">
            <GuideSlideCard
              slide={GUIDE_SLIDES[currentPage]}
              pageIndex={currentPage}
              totalPages={GUIDE_SLIDES.length}
              cafeName={cafeName}
            />
          </div>

          {/* Page Indicator Dots */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {GUIDE_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                aria-label={`الانتقال إلى الصفحة ${idx + 1}`}
                onClick={() => setCurrentPage(idx)}
                className={[
                  'h-2.5 cursor-pointer rounded-full transition-all',
                  idx === currentPage
                    ? 'w-6 bg-[var(--accent)]'
                    : 'w-2.5 bg-[#2B1F19]/20 hover:bg-[#2B1F19]/35',
                ].join(' ')}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-start justify-center gap-5">
          {GUIDE_SLIDES.map((slide, idx) => (
            <GuideSlideCard
              key={slide.id}
              slide={slide}
              pageIndex={idx}
              totalPages={GUIDE_SLIDES.length}
              cafeName={cafeName}
            />
          ))}
        </div>
      )}

      {/* Off-screen Fixed-Size 9:16 Export Stage (Guarantees exact 360x640px PDF rendering on every device) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: '-10000px',
          width: '360px',
          pointerEvents: 'none',
          opacity: 1,
        }}
      >
        {GUIDE_SLIDES.map((slide, idx) => (
          <div
            key={`export-${slide.id}`}
            ref={(el) => {
              exportRefs.current[idx] = el;
            }}
            style={{ width: 360, height: 640 }}
          >
            <GuideSlideCard
              slide={slide}
              pageIndex={idx}
              totalPages={GUIDE_SLIDES.length}
              cafeName={cafeName}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
