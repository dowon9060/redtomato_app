export function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function formatPriceRows(
  rows: Array<{ size: string; price: number }>
) {
  if (!rows.length) return "가격 문의";
  return rows
    .map((r) => (r.size ? `${r.size} ${formatWon(r.price)}` : formatWon(r.price)))
    .join(" · ");
}
