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
import { MenuCard } from "../components/MenuCard";
import { StoreRow } from "../components/StoreRow";
import { PrimaryButton } from "../components/PrimaryButton";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/colors";
import type { Menu, Store } from "../types/models";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Tab = "store" | "menu";

export function FavoritesScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<Tab>("menu");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setMenus([]);
      setStores([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api<{ menus?: Menu[]; stores?: Store[] }>("/favorites");
      setMenus(data.menus ?? []);
      setStores(data.stores ?? []);
    } catch {
      setMenus([]);
      setStores([]);
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
        <Text style={styles.emptyTitle}>찜한 항목을 보려면 로그인해 주세요</Text>
        <PrimaryButton label="로그인하기" onPress={() => navigation.navigate("Login")} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.tabs}>
        {(["store", "menu"] as Tab[]).map((key) => (
          <Pressable
            key={key}
            style={[styles.tab, tab === key && styles.tabActive]}
            onPress={() => setTab(key)}
          >
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>
              {key === "store" ? "지점" : "메뉴"}
            </Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.tomato} />
      ) : tab === "menu" ? (
        <FlatList
          data={menus}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>찜한 메뉴가 없어요.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <MenuCard
                menu={item}
                onPress={() =>
                  navigation.navigate("MenuDetail", { menuId: item.id })
                }
              />
            </View>
          )}
        />
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>찜한 지점이 없어요.</Text>
          }
          renderItem={({ item }) => (
            <StoreRow
              store={item}
              onPress={() =>
                navigation.navigate("StoreMenus", { storeId: item.id })
              }
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
    backgroundColor: colors.cream,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.ink, marginBottom: 8 },
  tabs: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: colors.tomato },
  tabText: { color: colors.muted, fontWeight: "700" },
  tabTextActive: { color: colors.white },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  cell: { flex: 1, marginBottom: 12 },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
});
