export type RootStackParamList = {
  Tabs: undefined;
  MenuList: { storeId?: number; groupId?: string } | undefined;
  MenuDetail: { menuId: string; storeId?: number };
  StoreList: undefined;
  StoreMenus: { storeId: number };
  Cart: undefined;
  Login: undefined;
  FranchiseInquiry: undefined;
  OrderDetail: { orderId: string };
};

export type TabParamList = {
  HomeTab: undefined;
  OrdersTab: undefined;
  CartTab: undefined;
  ProfileTab: undefined;
};
