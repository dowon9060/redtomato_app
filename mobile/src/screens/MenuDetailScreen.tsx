import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { api } from "../api/client";
import seed from "../data/seedCatalog.json";
import { resolveMenuImage } from "../data/images";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useAppStore } from "../store/appStore";
import { formatWon } from "../utils/format";
import { colors } from "../theme/colors";
import type { Menu, MenuOption } from "../types/models";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, "MenuDetail">;

export function MenuDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const selectedStore = useAppStore((s) => s.selectedStore);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [size, setSize] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api<{ menu: Menu }>(`/menus/${route.params.menuId}`);
        setMenu(data.menu);
        setSize(data.menu.priceRows[0]?.size ?? "");
      } catch {
        const local = (seed.menus as Menu[]).find((m) => m.id === route.params.menuId);
        if (local) {
          const enriched = {
            ...local,
            options: ["signature", "best", "luxury", "special", "original", "half"].includes(
              local.groupId
            )
              ? [
                  { id: `${local.id}-opt-0`, name: "치즈 추가", price: 3000 },
                  { id: `${local.id}-opt-1`, name: "치즈크러스트 변경", price: 4000 },
                  { id: `${local.id}-opt-2`, name: "올리브 추가", price: 1500 },
                ]
              : [],
          };
          setMenu(enriched);
          setSize(enriched.priceRows[0]?.size ?? "");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params.menuId]);

  const unitPrice = useMemo(() => {
    if (!menu) return 0;
    const row =
      menu.priceRows.find((p) => p.size === size) ?? menu.priceRows[0];
    return row?.price ?? 0;
  }, [menu, size]);

  const total = useMemo(() => {
    const opt = selectedOptions.reduce((s, o) => s + o.price, 0);
    return (unitPrice + opt) * qty;
  }, [unitPrice, selectedOptions, qty]);

  const toggleOption = (option: MenuOption) => {
    setSelectedOptions((prev) => {
      const exists = prev.some((o) => o.id === option.id);
      return exists ? prev.filter((o) => o.id !== option.id) : [...prev, option];
    });
  };

  const toggleLike = async () => {
    if (!menu) return;
    if (!user) {
      navigation.navigate("Login");
      return;
    }
    const data = await api<{ liked: boolean }>("/favorites/toggle", {
      body: { targetType: "menu", targetId: menu.id },
    });
    setMenu({ ...menu, liked: data.liked });
  };

  const addToCart = () => {
    if (!menu) return;
    const storeId =
      route.params.storeId ?? selectedStore?.id ?? 10;
    addItem({
      menuId: menu.id,
      menuName: menu.name,
      imageKey: menu.imageKey,
      size,
      unitPrice,
      quantity: qty,
      options: selectedOptions,
      storeId,
    });
    Alert.alert("장바구니", "메뉴를 장바구니에 담았어요.", [
      { text: "계속 담기", style: "cancel" },
      { text: "장바구니", onPress: () => navigation.navigate("Cart") },
    ]);
  };

  if (loading || !menu) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.tomato} />
      </View>
    );
  }

  const image = resolveMenuImage(menu.imageKey);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {image ? (
          <Image source={image} style={styles.hero} contentFit="cover" />
        ) : (
          <View style={[styles.hero, styles.placeholder]}>
            <Text style={{ color: colors.muted }}>이미지 준비중</Text>
          </View>
        )}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{menu.name}</Text>
            <Pressable onPress={toggleLike} style={styles.likeBtn}>
              <Text style={styles.likeText}>{menu.liked ? "찜됨" : "찜"}</Text>
            </Pressable>
          </View>
          <Text style={styles.desc}>
            {menu.description || "빨간토마토피자 메뉴예요."}
          </Text>
          <Text style={styles.price}>{formatWon(unitPrice)}</Text>

          {menu.priceRows.length > 1 ? (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>사이즈</Text>
              <View style={styles.chips}>
                {menu.priceRows.map((row) => (
                  <Pressable
                    key={`${row.size}-${row.price}`}
                    onPress={() => setSize(row.size)}
                    style={[styles.chip, size === row.size && styles.chipActive]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        size === row.size && styles.chipTextActive,
                      ]}
                    >
                      {row.size || "기본"} · {formatWon(row.price)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {(menu.options?.length ?? 0) > 0 ? (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>추가 옵션 (선택)</Text>
              {menu.options!.map((option) => {
                const active = selectedOptions.some((o) => o.id === option.id);
                return (
                  <Pressable
                    key={option.id}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => toggleOption(option)}
                  >
                    <Text style={styles.optionName}>{option.name}</Text>
                    <Text style={styles.optionPrice}>+{formatWon(option.price)}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <View style={styles.qtyRow}>
            <Text style={styles.blockTitle}>수량</Text>
            <View style={styles.qtyControls}>
              <Pressable
                style={styles.qtyBtn}
                onPress={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </Pressable>
              <Text style={styles.qtyValue}>{qty}</Text>
              <Pressable style={styles.qtyBtn} onPress={() => setQty((q) => q + 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>합계</Text>
          <Text style={styles.footerPrice}>{formatWon(total)}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <PrimaryButton label="장바구니 넣기" onPress={addToCart} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { width: "100%", height: 260, backgroundColor: colors.tomatoSoft },
  placeholder: { alignItems: "center", justifyContent: "center" },
  body: { padding: 16 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  name: { flex: 1, fontSize: 22, fontWeight: "800", color: colors.ink },
  likeBtn: {
    borderWidth: 1,
    borderColor: colors.tomato,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  likeText: { color: colors.tomato, fontWeight: "700" },
  desc: { marginTop: 10, color: colors.muted, lineHeight: 20 },
  price: { marginTop: 12, fontSize: 20, fontWeight: "800", color: colors.tomatoDark },
  block: { marginTop: 24 },
  blockTitle: { fontSize: 15, fontWeight: "700", color: colors.ink, marginBottom: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.tomato, borderColor: colors.tomato },
  chipText: { color: colors.ink, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: colors.white },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 8,
  },
  optionActive: { borderColor: colors.tomato, backgroundColor: colors.tomatoSoft },
  optionName: { color: colors.ink, fontWeight: "600" },
  optionPrice: { color: colors.tomatoDark, fontWeight: "700" },
  qtyRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { fontSize: 18, fontWeight: "700", color: colors.ink },
  qtyValue: { minWidth: 24, textAlign: "center", fontWeight: "700", fontSize: 16 },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  footerLabel: { color: colors.muted, fontSize: 12 },
  footerPrice: { color: colors.ink, fontSize: 18, fontWeight: "800" },
});
