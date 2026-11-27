const bannerMap: Record<string, number> = {
  "banner1.jpg": require("../../assets/banners/banner1.jpg"),
  "banner2.jpg": require("../../assets/banners/banner2.jpg"),
  "banner3.jpg": require("../../assets/banners/banner3.jpg"),
  "banner4.jpg": require("../../assets/banners/banner4.jpg"),
  "banner5.jpg": require("../../assets/banners/banner5.jpg"),
};

const menuMap: Record<string, number> = {
  "signature/bacon-shrimp.jpg": require("../../assets/menus/signature/bacon-shrimp.jpg"),
  "signature/shrimp-cube-steak.jpg": require("../../assets/menus/signature/shrimp-cube-steak.jpg"),
  "signature/sweet-potato.jpg": require("../../assets/menus/signature/sweet-potato.jpg"),
  "signature/cheddar-fries.jpg": require("../../assets/menus/signature/cheddar-fries.jpg"),
  "signature/hot-chili-shrimp.jpg": require("../../assets/menus/signature/hot-chili-shrimp.jpg"),
  "best/bacon-rich.jpg": require("../../assets/menus/best/bacon-rich.jpg"),
  "best/sweet-rich.jpg": require("../../assets/menus/best/sweet-rich.jpg"),
  "best/steak-bulgalbi.jpg": require("../../assets/menus/best/steak-bulgalbi.jpg"),
  "special/goguma-rich.jpg": require("../../assets/menus/special/goguma-rich.jpg"),
  "special/spicy-bulgogi.jpg": require("../../assets/menus/special/spicy-bulgogi.jpg"),
  "special/bacon-cheddar.jpg": require("../../assets/menus/special/bacon-cheddar.jpg"),
  "special/tomato-special.jpg": require("../../assets/menus/special/tomato-special.jpg"),
  "special/potato.jpg": require("../../assets/menus/special/potato.jpg"),
  "original/bulgogi.jpg": require("../../assets/menus/original/bulgogi.jpg"),
  "original/vegetable.jpg": require("../../assets/menus/original/vegetable.jpg"),
  "original/italian.jpg": require("../../assets/menus/original/italian.jpg"),
  "original/combination.jpg": require("../../assets/menus/original/combination.jpg"),
  "original/pepperoni.jpg": require("../../assets/menus/original/pepperoni.jpg"),
  "half/four-special.jpg": require("../../assets/menus/half/four-special.jpg"),
  "half/four-original.jpg": require("../../assets/menus/half/four-original.jpg"),
  "half/half-half.jpg": require("../../assets/menus/half/half-half.jpg"),
  "set/set-a.jpg": require("../../assets/menus/set/set-a.jpg"),
  "set/set-b.jpg": require("../../assets/menus/set/set-b.jpg"),
  "set/set-c.jpg": require("../../assets/menus/set/set-c.jpg"),
  "set/set-d.jpg": require("../../assets/menus/set/set-d.jpg"),
  "set/set-e.jpg": require("../../assets/menus/set/set-e.jpg"),
  "side/buffalo-stick.jpg": require("../../assets/menus/side/buffalo-stick.jpg"),
  "side/shrimp-ring.jpg": require("../../assets/menus/side/shrimp-ring.jpg"),
  "side/wedge-potato.jpg": require("../../assets/menus/side/wedge-potato.jpg"),
  "side/cheese-spaghetti.jpg": require("../../assets/menus/side/cheese-spaghetti.jpg"),
  "side/cheese-stick.jpg": require("../../assets/menus/side/cheese-stick.jpg"),
  "side/hash-brown.jpg": require("../../assets/menus/side/hash-brown.jpg"),
  "drink/cola.jpg": require("../../assets/menus/drink/cola.jpg"),
  "drink/cider.jpg": require("../../assets/menus/drink/cider.jpg"),
  "drink/ice-cup.jpg": require("../../assets/menus/drink/ice-cup.jpg"),
};

export const logoImage = require("../../assets/brand/logo.jpg");

export function resolveBannerImage(key: string): number {
  return bannerMap[key] ?? bannerMap["banner1.jpg"];
}

export function resolveMenuImage(key?: string | null): number | null {
  if (!key) return null;
  return menuMap[key] ?? null;
}
