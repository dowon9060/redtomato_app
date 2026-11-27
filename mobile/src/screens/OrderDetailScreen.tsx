import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { api } from "../api/client";
import { formatWon } from "../utils/format";
import { colors } from "../theme/colors";
import type { Order } from "../types/models";
import type { RootStackParamList } from "../navigation/types";

type R = RouteProp<RootStackParamList, "OrderDetail">;

export function OrderDetailScreen() {
  const route = useRoute<R>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    (async () => {
      const data = await api<{ order: Order }>(`/orders/${route.params.orderId}`);
      setOrder(data.order);
    })().catch(() => setOrder(null));
  }, [route.params.orderId]);

  if (!order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.tomato} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.store}>{order.storeName}</Text>
      <Text style={styles.status}>{order.statusLabel}</Text>
      <View style={styles.flow}>
        {order.statusFlow.map((step) => (
          <View key={step.key} style={styles.stepRow}>
            <View
              style={[
                styles.dot,
                step.done && styles.dotDone,
                step.current && styles.dotCurrent,
              ]}
            />
            <Text style={[styles.stepLabel, step.current && styles.current]}>
              {step.label}
            </Text>
          </View>
        ))}
      </View>
      {order.items.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.itemName}>
            {item.menuName}
            {item.size ? ` (${item.size})` : ""} × {item.quantity}
          </Text>
          <Text style={styles.itemPrice}>
            {formatWon(
              (item.unitPrice +
                item.options.reduce((s, o) => s + o.price, 0)) *
                item.quantity
            )}
          </Text>
        </View>
      ))}
      <Text style={styles.total}>합계 {formatWon(order.totalPrice)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  store: { fontSize: 20, fontWeight: "800", color: colors.ink },
  status: { marginTop: 6, color: colors.tomato, fontWeight: "700", fontSize: 16 },
  flow: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
  },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.line },
  dotDone: { backgroundColor: "#EF9A9A" },
  dotCurrent: { backgroundColor: colors.tomato },
  stepLabel: { color: colors.muted, fontSize: 14 },
  current: { color: colors.ink, fontWeight: "700" },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemName: { color: colors.ink, flex: 1, paddingRight: 8 },
  itemPrice: { fontWeight: "700", color: colors.ink },
  total: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "800",
    color: colors.tomatoDark,
  },
});
