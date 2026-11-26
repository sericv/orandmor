/**
 * Single source of truth for targeting a specific café in the multi-store Firebase system.
 * To point this menu to another café, update `ACTIVE_CAFE_ID` here only.
 */
export const ACTIVE_CAFE_ID = 'MnmV2EVcMbh8YBIH5hw3';

export interface DeliveryAppConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  logo: string;
  url?: string;
}

export const CAFE_WORKING_HOURS = [
  {
    days: 'السبت إلى الخميس',
    hours: '7:00 صباحًا – 2:00 صباحًا',
  },
  {
    days: 'الجمعة',
    hours: '4:00 مساءً – 2:00 صباحًا',
  },
] as const;

export const CAFE_DELIVERY_APPS: DeliveryAppConfig[] = [
  {
    id: 'hungerstation',
    nameAr: 'هنقرستيشن',
    nameEn: 'HungerStation',
    logo: `${import.meta.env.BASE_URL}images/hungerstation.png`,
    url: '',
  },
  {
    id: 'keeta',
    nameAr: 'كيتا',
    nameEn: 'Keeta',
    logo: `${import.meta.env.BASE_URL}images/keeta.png`,
    url: '',
  },
];

export const CAFE_CONTACT = {
  phone: '0556428777',
  telHref: 'tel:0556428777',
  purpose: 'للاستفسارات والشكاوى والملاحظات',
} as const;

export const MENU_DEFAULTS = {
  cafeName: 'أور آند مور',
  subtitle: 'Coffee & More',
  currency: 'ر.س',
  welcomeHeadline: 'مزاجك يبدأ من هنا',
  welcomeDescription:
    'من أول رشفة قهوة إلى آخر قطعة حلى، تفاصيل صُنعت لتستمتعوا بها.',
  status: 'مفتوح الآن',
  note: 'القائمة للعرض فقط — يسعدنا استقبال طلبك مباشرة عند الكاونتر.',
} as const;
