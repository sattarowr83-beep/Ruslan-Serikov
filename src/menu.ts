import raw from '../menu.json';

export type MenuItem = {
  id: string;
  title: string;
  price: number;
  photo: string | null;
  illustration: 'shawarma' | 'burger';
  badge?: string;
};

export const menu = raw as unknown as {
  brand: {name: string; logo: string | null; address: string | null};
  colors: {
    background: string;
    backgroundDeep: string;
    text: string;
    accent: string;
    onAccent: string;
  };
  currency: string;
  hook: string[];
  cta: string;
  items: MenuItem[];
};

export const C = menu.colors;

// 1990 -> «1 990 ₸» (неразрывные пробелы, чтобы цена не переносилась)
export const formatPrice = (n: number) =>
  String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ' + menu.currency;

export const allText = () =>
  [
    ...menu.hook,
    menu.cta,
    menu.brand.name,
    menu.brand.address ?? '',
    ...menu.items.map((i) => `${i.title} ${i.badge ?? ''} ${formatPrice(i.price)}`),
    'МЕНЮ 0123456789',
  ].join(' ');
