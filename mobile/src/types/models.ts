export type PriceRow = { size: string; price: number };

export type MenuOption = {
  id: string;
  name: string;
  price: number;
  isRequired?: boolean;
};

export type Menu = {
  id: string;
  groupId: string;
  groupLabel?: string | null;
  category?: string | null;
  name: string;
  description: string;
  imageKey: string;
  badge?: string | null;
  isAvailable?: boolean;
  liked?: boolean;
  priceRows: PriceRow[];
  options?: MenuOption[];
};

export type MenuGroup = {
  id: string;
  label: string;
  category: string;
};

export type Store = {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  holiday: string;
  lat?: number;
  lng?: number;
  isOpen: boolean;
  liked?: boolean;
};

export type Banner = {
  id: number;
  title: string;
  subtitle: string;
  imageKey: string;
};

export type User = {
  id: string;
  phone: string;
  name: string;
  nickname: string;
  points: number;
};

export type CartItem = {
  key: string;
  menuId: string;
  menuName: string;
  imageKey: string;
  size: string;
  unitPrice: number;
  quantity: number;
  options: MenuOption[];
  storeId: number;
};

export type OrderStatus =
  | "ordered"
  | "accepted"
  | "cooking"
  | "ready"
  | "picked_up"
  | "cancelled";

export type Order = {
  id: string;
  storeId: number;
  storeName?: string | null;
  status: OrderStatus;
  statusLabel: string;
  statusFlow: Array<{
    key: OrderStatus;
    label: string;
    done: boolean;
    current: boolean;
  }>;
  totalPrice: number;
  requestNote: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: number;
    menuId: string;
    menuName: string;
    size: string;
    unitPrice: number;
    quantity: number;
    options: MenuOption[];
  }>;
};
