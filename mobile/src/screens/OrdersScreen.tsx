import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { formatWon } from "../utils/format";
import { colors } from "../theme/colors";
import type { Order } from "../types/models";
import type { RootStackParamList } from "../navigation/types";
import { PrimaryButton } from "../components/PrimaryButton";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function OrdersScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api<{ orders: Order[] }>("/orders");
      setOrders(data.orders);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>로그인이 필요해요</Text>
        <Text style={styles.emptyDesc}>내 주문 현황을 보려면 로그인해 주세요.</Text>
        <PrimaryButton label="로그인하기" onPress={() => navigation.navigate("Login")} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.tomato} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={orders}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>아직 포장 주문이 없어요</Text>
          <Text style={styles.emptyDesc}>메뉴를 담고 가까운 매장에서 픽업해 보세요.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
        >
          <View style={styles.top}>
            <Text style={styles.store}>{item.storeName}</Text>
            <Text style={styles.status}>{item.statusLabel}</Text>
          </View>
          <Text style={styles.items} numberOfLines={1}>
            {item.items.map((i) => i.menuName).join(", ")}
          </Text>
          <View style={styles.flow}>
            {item.statusFlow.map((step) => (
              <View key={step.key} style={styles.step}>
                <View
                  style={[
                    styles.dot,
                    step.done && styles.dotDone,
                    step.current && styles.dotCurrent,
                  ]}
                />
                <Text
                  style={[
                    styles.stepLabel,
                    step.current && styles.stepLabelCurrent,
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.price}>{formatWon(item.totalPrice)}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 16, paddingBottom: 40, flexGrow: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: colors.ink },
  emptyDesc: { color: colors.muted, textAlign: "center", marginBottom: 8 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 12,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  store: { flex: 1, fontWeight: "800", color: colors.ink, fontSize: 16 },
  status: { color: colors.tomato, fontWeight: "700" },
  items: { color: colors.muted, fontSize: 13 },
  flow: {
    flexDirection: "row",
    marginTop: 14,
    marginBottom: 10,
    justifyContent: "space-between",
  },
  step: { alignItems: "center", width: "19%" },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.line,
    marginBottom: 4,
  },
  dotDone: { backgroundColor: colors.tomatoSoft },
  dotCurrent: { backgroundColor: colors.tomato },
  stepLabel: { fontSize: 9, color: colors.muted, textAlign: "center" },
  stepLabelCurrent: { color: colors.tomato, fontWeight: "700" },
  price: { fontWeight: "800", color: colors.ink },
});
