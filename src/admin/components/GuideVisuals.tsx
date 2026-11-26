import {
  AlertTriangle,
  BadgeDollarSign,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  FolderKanban,
  ImagePlus,
  LayoutDashboard,
  Minus,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';

function CalloutBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8B5A3C] text-[10px] font-bold text-[#FFFDF9] shadow-xs ring-2 ring-[#FFFDF9]">
      {n}
    </span>
  );
}

export function OverviewVisual() {
  return (
    <div className="rounded-[16px] bg-[#F7F3ED] p-2.5 border border-[#2B1F19]/10">
      {/* Mini Stat Grid */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        {[
          { label: 'المنتجات', val: '169' },
          { label: 'التصنيفات', val: '5' },
          { label: 'الظاهرة', val: '165' },
          { label: 'المخفية', val: '4' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[10px] bg-[#FFFDF9] p-1.5 text-center border border-[#2B1F19]/8"
          >
            <div className="text-[12px] font-bold text-[#2B1F19] tabular-nums">
              {s.val}
            </div>
            <div className="text-[8.5px] text-[#6A584E] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mini Navigation Bar */}
      <div className="relative rounded-[12px] bg-[#FFFDF9] p-1.5 border border-[#2B1F19]/10">
        <div className="grid grid-cols-4 gap-1 text-center">
          {[
            { label: 'الرئيسية', icon: LayoutDashboard, active: true },
            { label: 'المنتجات', icon: Package, active: false },
            { label: 'التصنيفات', icon: FolderKanban, active: false },
            { label: 'الأسعار', icon: BadgeDollarSign, active: false },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={[
                  'flex flex-col items-center gap-0.5 rounded-[8px] py-1 text-[8.5px] font-medium',
                  item.active
                    ? 'bg-[#8B5A3C] text-[#FFFDF9]'
                    : 'text-[#6A584E]',
                ].join(' ')}
              >
                <Icon size={12} strokeWidth={1.8} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
        <div className="absolute -top-2 -left-1.5">
          <CalloutBadge n={1} />
        </div>
      </div>
    </div>
  );
}

export function AddProductVisual() {
  return (
    <div className="rounded-[16px] bg-[#F7F3ED] p-2.5 border border-[#2B1F19]/10 space-y-2">
      {/* Top Action Row */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#2B1F19]">المنتجات</span>
        <div className="relative inline-flex items-center gap-1 rounded-[9px] bg-[#8B5A3C] px-2.5 py-1 text-[10px] font-medium text-[#FFFDF9]">
          <Plus size={11} strokeWidth={2.2} />
          <span>إضافة منتج</span>
          <span className="absolute -top-2 -left-2">
            <CalloutBadge n={1} />
          </span>
        </div>
      </div>

      {/* Mini Add Form Preview */}
      <div className="rounded-[12px] bg-[#FFFDF9] p-2.5 border border-[#2B1F19]/8 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-[#EFE9DF] text-[#8B5A3C]">
            <ImagePlus size={14} strokeWidth={1.7} />
            <span className="absolute -top-1.5 -right-1.5">
              <CalloutBadge n={2} />
            </span>
          </div>
          <div className="flex-1 space-y-1">
            <div className="rounded-[7px] bg-[#F7F3ED] px-2 py-1 text-[9.5px] text-[#2B1F19] border border-[#2B1F19]/8">
              آيس سبانش لاتيه
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="rounded-[7px] bg-[#F7F3ED] px-2 py-0.5 text-[9px] text-[#6A584E] border border-[#2B1F19]/8">
                السعر: 23
              </div>
              <div className="rounded-[7px] bg-[#F7F3ED] px-2 py-0.5 text-[9px] text-[#6A584E] border border-[#2B1F19]/8">
                المشروبات الباردة
              </div>
            </div>
          </div>
        </div>

        {/* Flags */}
        <div className="relative grid grid-cols-2 gap-1 text-[8.5px]">
          {['ظاهر في المنيو', 'منتج جديد', 'منتج شائع', 'الأكثر طلبًا'].map(
            (flag, idx) => (
              <div
                key={flag}
                className={[
                  'flex items-center justify-between rounded-[7px] px-2 py-1 border',
                  idx === 0
                    ? 'bg-[#8B5A3C]/10 border-[#8B5A3C]/30 text-[#2B1F19] font-medium'
                    : 'bg-[#F7F3ED] border-[#2B1F19]/8 text-[#6A584E]',
                ].join(' ')}
              >
                <span>{flag}</span>
                <span
                  className={[
                    'flex h-3 w-3 items-center justify-center rounded-[3px]',
                    idx === 0 ? 'bg-[#8B5A3C] text-white' : 'bg-[#2B1F19]/15',
                  ].join(' ')}
                >
                  {idx === 0 && <Check size={8} strokeWidth={3} />}
                </span>
              </div>
            )
          )}
          <span className="absolute -top-2 -left-1.5">
            <CalloutBadge n={3} />
          </span>
        </div>
      </div>
    </div>
  );
}

export function EditProductVisual() {
  return (
    <div className="rounded-[16px] bg-[#F7F3ED] p-2.5 border border-[#2B1F19]/10 space-y-2">
      {/* Search + Filter */}
      <div className="relative grid grid-cols-12 gap-1.5">
        <div className="col-span-7 flex items-center gap-1 rounded-[9px] bg-[#FFFDF9] px-2 py-1.5 text-[9.5px] text-[#8A786D] border border-[#2B1F19]/10">
          <Search size={11} />
          <span>ابحث باسم المنتج...</span>
        </div>
        <div className="col-span-5 rounded-[9px] bg-[#FFFDF9] px-2 py-1.5 text-[9.5px] text-[#2B1F19] border border-[#2B1F19]/10">
          الحلويات ▾
        </div>
        <span className="absolute -top-2 -right-1.5">
          <CalloutBadge n={1} />
        </span>
      </div>

      {/* Product Row with Edit Button Highlighted */}
      <div className="flex items-center justify-between gap-2 rounded-[12px] bg-[#FFFDF9] p-2 border border-[#2B1F19]/8">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-[9px] bg-[#EFE9DF]" />
          <div>
            <div className="text-[10.5px] font-semibold text-[#2B1F19]">
              كيكة العسل
            </div>
            <div className="text-[9px] text-[#8A786D]">الحلويات · 17 ريال</div>
          </div>
        </div>

        <div className="relative inline-flex items-center gap-1 rounded-[8px] bg-[#F7F3ED] px-2.5 py-1 text-[9.5px] font-semibold text-[#8B5A3C] border border-[#8B5A3C]/35">
          <Pencil size={10} />
          <span>تعديل</span>
          <span className="absolute -top-2 -left-2">
            <CalloutBadge n={2} />
          </span>
        </div>
      </div>
    </div>
  );
}

export function VisibilityVisual() {
  return (
    <div className="rounded-[16px] bg-[#F7F3ED] p-2.5 border border-[#2B1F19]/10 space-y-2">
      {/* Single Product Toggle */}
      <div className="flex items-center justify-between rounded-[12px] bg-[#FFFDF9] px-2.5 py-2 border border-[#2B1F19]/8">
        <span className="text-[10.5px] font-semibold text-[#2B1F19]">
          آيس ماتشا لاتيه
        </span>
        <div className="relative flex items-center gap-1.5">
          <span className="inline-flex h-4.5 w-8 items-center rounded-full bg-[#8B5A3C] px-0.5 justify-end">
            <span className="h-3.5 w-3.5 rounded-full bg-white" />
          </span>
          <span className="text-[9.5px] font-medium text-[#2B1F19]">ظاهر</span>
          <span className="absolute -top-2.5 -left-2">
            <CalloutBadge n={1} />
          </span>
        </div>
      </div>

      {/* Bulk Bar */}
      <div className="relative flex items-center justify-between rounded-[12px] bg-[#2B1F19] px-2.5 py-2 text-[#FDF9F3]">
        <span className="text-[9.5px] font-semibold text-[#E5C19B]">
          3 منتجات محددة
        </span>
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center gap-1 rounded-[7px] bg-white/15 px-2 py-0.5 text-[9px]">
            <Eye size={10} />
            إظهار
          </span>
          <span className="inline-flex items-center gap-1 rounded-[7px] bg-white/15 px-2 py-0.5 text-[9px]">
            <EyeOff size={10} />
            إخفاء
          </span>
        </div>
        <span className="absolute -top-2 -right-1.5">
          <CalloutBadge n={2} />
        </span>
      </div>
    </div>
  );
}

export function DeleteVisual() {
  return (
    <div className="rounded-[16px] bg-[#F7F3ED] p-2.5 border border-[#2B1F19]/10 space-y-2">
      {/* Confirm Dialog Mini */}
      <div className="rounded-[12px] bg-[#FFFDF9] p-2.5 border border-[#9E3232]/25 space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A63A3A]/12 text-[#8E2A2A]">
            <AlertTriangle size={12} />
          </span>
          <div>
            <div className="text-[10.5px] font-semibold text-[#2B1F19]">
              تأكيد حذف المنتجات المحددة
            </div>
            <div className="text-[8.5px] text-[#6A584E]">
              عند حذف أكثر من 5 منتجات، يُطلب كتابة عبارة التأكيد
            </div>
          </div>
        </div>

        <div className="relative rounded-[8px] bg-[#F7F3ED] px-2.5 py-1.5 text-[9.5px] text-[#8E2A2A] font-medium border border-[#9E3232]/30">
          تأكيد الحذف
          <span className="absolute -top-2 -left-1.5">
            <CalloutBadge n={2} />
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex flex-1 items-center justify-center gap-1 rounded-[8px] bg-[#9E3232] py-1 text-[9.5px] font-medium text-white">
            <Trash2 size={10} />
            <span>تأكيد الحذف</span>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-[8px] bg-[#EFE9DF] py-1 text-[9.5px] font-medium text-[#2B1F19]">
            إلغاء
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoriesVisual() {
  return (
    <div className="rounded-[16px] bg-[#F7F3ED] p-2.5 border border-[#2B1F19]/10 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#2B1F19]">التصنيفات</span>
        <span className="relative inline-flex items-center gap-1 rounded-[9px] bg-[#8B5A3C] px-2.5 py-1 text-[9.5px] font-medium text-white">
          <Plus size={10} />
          إضافة تصنيف
          <span className="absolute -top-2 -left-2">
            <CalloutBadge n={1} />
          </span>
        </span>
      </div>

      <div className="relative rounded-[12px] bg-[#FFFDF9] p-2.5 border border-[#2B1F19]/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#EFE9DF] text-[#8B5A3C]">
            <FolderKanban size={14} />
          </span>
          <div>
            <div className="text-[10.5px] font-semibold text-[#2B1F19]">
              الحلويات
            </div>
            <div className="text-[8.5px] text-[#8A786D]">
              42 منتج · الترتيب: 2
            </div>
          </div>
        </div>
        <span className="rounded-[7px] bg-[#F7F3ED] px-2 py-1 text-[9px] font-medium text-[#2B1F19] border border-[#2B1F19]/10">
          تعديل
        </span>
        <span className="absolute -bottom-2 -left-1.5">
          <CalloutBadge n={2} />
        </span>
      </div>
    </div>
  );
}

export function BulkPriceVisual() {
  return (
    <div className="rounded-[16px] bg-[#F7F3ED] p-2.5 border border-[#2B1F19]/10 space-y-2">
      <div className="relative grid grid-cols-2 gap-1.5">
        <div className="flex items-center justify-center gap-1 rounded-[9px] bg-[#8B5A3C] py-1.5 text-[9.5px] font-medium text-white">
          <Plus size={11} />
          زيادة الأسعار
        </div>
        <div className="flex items-center justify-center gap-1 rounded-[9px] bg-[#FFFDF9] py-1.5 text-[9.5px] font-medium text-[#2B1F19] border border-[#2B1F19]/10">
          <Minus size={11} />
          تخفيض الأسعار
        </div>
        <span className="absolute -top-2 -right-1.5">
          <CalloutBadge n={1} />
        </span>
      </div>

      {/* Preview Table Mini */}
      <div className="relative rounded-[11px] bg-[#FFFDF9] px-2.5 py-2 border border-[#2B1F19]/8 space-y-1 text-[9.5px]">
        <div className="flex items-center justify-between">
          <span className="text-[#2B1F19] font-medium">كيكة العسل</span>
          <span className="tabular-nums">
            <span className="text-[#8A786D] line-through ml-1.5">17</span>
            <span className="font-bold text-[#8B5A3C]">← 19 ريال</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#2B1F19] font-medium">قهوة أمريكية</span>
          <span className="tabular-nums">
            <span className="text-[#8A786D] line-through ml-1.5">12</span>
            <span className="font-bold text-[#8B5A3C]">← 14 ريال</span>
          </span>
        </div>
        <span className="absolute -top-2 -left-1.5">
          <CalloutBadge n={2} />
        </span>
      </div>

      <div className="rounded-[9px] bg-[#8B5A3C] py-1.5 text-center text-[10px] font-semibold text-white">
        تأكيد تطبيق الأسعار
      </div>
    </div>
  );
}

export function TipsVisual() {
  return (
    <div className="rounded-[16px] bg-[#F7F3ED] p-2.5 border border-[#2B1F19]/10">
      <div className="flex items-center justify-between rounded-[12px] bg-[#FFFDF9] px-3 py-2.5 border border-[#8B5A3C]/25">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8B5A3C]/12 text-[#8B5A3C]">
            <ExternalLink size={13} />
          </span>
          <div>
            <div className="text-[10.5px] font-semibold text-[#2B1F19]">
              عرض المنيو العام
            </div>
            <div className="text-[8.5px] text-[#6A584E]">
              افتح المنيو للتأكد من التغييرات بعد كل تعديل
            </div>
          </div>
        </div>
        <span className="rounded-full bg-[#3F6A47]/12 px-2 py-0.5 text-[9px] font-semibold text-[#3F6A47]">
          مباشر
        </span>
      </div>
    </div>
  );
}
