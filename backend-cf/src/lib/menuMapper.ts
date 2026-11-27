type MenuRow = {
  id: string;
  group_id: string;
  name: string;
  description: string;
  image_key: string;
  badge: string | null;
  sort_order: number;
  is_available: number;
  group_label?: string;
  category?: string;
};

type PriceRow = { menu_id: string; size: string; price: number };
type OptionRow = {
  id: string;
  menu_id: string;
  name: string;
  price: number;
  is_required: number;
  sort_order: number;
};

export function mapMenu(
  menu: MenuRow,
  prices: PriceRow[],
  options: OptionRow[],
  liked = false
) {
  return {
    id: menu.id,
    groupId: menu.group_id,
    groupLabel: menu.group_label ?? null,
    category: menu.category ?? null,
    name: menu.name,
    description: menu.description,
    imageKey: menu.image_key,
    badge: menu.badge,
    isAvailable: Boolean(menu.is_available),
    liked,
    priceRows: prices
      .filter((p) => p.menu_id === menu.id)
      .map((p) => ({ size: p.size, price: p.price })),
    options: options
      .filter((o) => o.menu_id === menu.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((o) => ({
        id: o.id,
        name: o.name,
        price: o.price,
        isRequired: Boolean(o.is_required),
      })),
  };
}
