export type Env = {
  DB: D1Database;
  APP_NAME: string;
  JWT_SECRET: string;
};

export type OrderStatus =
  | "ordered"
  | "accepted"
  | "cooking"
  | "ready"
  | "picked_up"
  | "cancelled";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  ordered: "주문 완료",
  accepted: "접수 완료",
  cooking: "조리중",
  ready: "조리 완료",
  picked_up: "픽업완료",
  cancelled: "취소",
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "ordered",
  "accepted",
  "cooking",
  "ready",
  "picked_up",
];
