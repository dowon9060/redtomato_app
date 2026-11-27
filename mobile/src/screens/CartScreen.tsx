import { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PrimaryButton } from "../components/PrimaryButton";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { formatWon } from "../utils/format";
import { colors } from "../theme/colors";
import type { Order } from "../types/models";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CartScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const items = useCartStore((s) => s.items);
  const storeId = useCartStore((s) => s.storeId);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!user) {
      navigation.navigate("Login");
      return;
    }
    if (!storeId || items.length === 0) {
      Alert.alert("장바구니", "담은 메뉴가 없어요.");
      return;
    }
    setLoading(true);
    try {
      const data = await api<{ order: Order; earnedPoints: number }>("/orders", {
        body: {
          storeId,
          requestNote: note,
          items: items.map((item) => ({
            menuId: item.menuId,
            menuName: item.menuName,
            size: item.size,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            options: item.options,
          })),
        },
      });
      clear();
      await refreshMe().catch(() => undefined);
      Alert.alert(
        "주문 완료",
        data.earnedPoints
          ? `포장 주문이 접수됐어요. ${data.earnedPoints}P가 적립됐어요.`
          : "포장 주문이 접수됐어요.",
        [
          {
            text: "주문 확인",
            onPress: () =>
              navigation.replace("OrderDetail", { orderId: data.order.id }),
          },
        ]
      );
    } catch (e) {
      Alert.alert(
        "주문 실패",
        e instanceof Error ? e.message : "다시 시도해 주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>장바구니가 비어 있어요.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {item.menuName}
                {item.size ? ` (${item.size})` : ""}
              </Text>
              {item.options.length ? (
                <Text style={styles.opts}>
                  {item.options.map((o) => o.name).join(", ")}
                </Text>
              ) : null}
              <Text style={styles.meta}>
                {item.quantity}개 ·{" "}
                {formatWon(
                  (item.unitPrice +
                    item.options.reduce((s, o) => s + o.price, 0)) *
                    item.quantity
                )}
              </Text>
            </View>
            <PrimaryButton
              label="삭제"
              variant="ghost"
              onPress={() => removeItem(item.key)}
            />
          </View>
        )}
        ListFooterComponent={
          items.length ? (
            <TextInput
              style={styles.note}
              placeholder="요청사항을 남겨 주세요 (선택)"
              placeholderTextColor={colors.muted}
              value={note}
              onChangeText={setNote}
              multiline
            />
          ) : (
            <View />
          )
        }
      />
      <View style={styles.footer}>
        <Text style={styles.total}>합계 {formatWon(totalPrice())}</Text>
        <PrimaryButton
          label="포장 주문하기"
          onPress={submit}
          loading={loading}
          disabled={!items.length}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  list: { padding: 16, paddingBottom: 140 },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  name: { fontWeight: "700", color: colors.ink, fontSize: 15 },
  opts: { color: colors.muted, fontSize: 12, marginTop: 4 },
  meta: { marginTop: 6, color: colors.tomatoDark, fontWeight: "700" },
  note: {
    marginTop: 8,
    minHeight: 80,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    textAlignVertical: "top",
    color: colors.ink,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: 10,
  },
  total: { fontSize: 18, fontWeight: "800", color: colors.ink },
});
