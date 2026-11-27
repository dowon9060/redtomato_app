import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MenuCard } from "./MenuCard";
import { api } from "../api/client";
import seed from "../data/seedCatalog.json";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/colors";
import type { Menu, MenuGroup } from "../types/models";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  storeId?: number;
  initialGroupId?: string;
};

export function MenuListContent({ storeId, initialGroupId = "signature" }: Props) {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const [groups, setGroups] = useState<MenuGroup[]>(seed.groups as MenuGroup[]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [groupId, setGroupId] = useState(initialGroupId);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [g, m] = await Promise.all([
        api<{ groups: MenuGroup[] }>("/menu-groups", { auth: false }),
        api<{ menus: Menu[] }>(
          groupId === "all" ? "/menus" : `/menus?groupId=${groupId}`
        ),
      ]);
      setGroups([{ id: "all", label: "전체", category: "all" }, ...g.groups]);
      setMenus(m.menus);
    } catch {
      const local = (seed.menus as Menu[]).filter(
        (m) => groupId === "all" || m.groupId === groupId
      );
      setGroups([
        { id: "all", label: "전체", category: "all" },
        ...(seed.groups as MenuGroup[]),
      ]);
      setMenus(
        local.map((m) => ({
          ...m,
          options: [
            "signature",
            "best",
            "luxury",
            "special",
            "original",
            "half",
          ].includes(m.groupId)
            ? [
                { id: `${m.id}-opt-0`, name: "치즈 추가", price: 3000 },
                { id: `${m.id}-opt-1`, name: "치즈크러스트 변경", price: 4000 },
                { id: `${m.id}-opt-2`, name: "올리브 추가", price: 1500 },
              ]
            : [],
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggleLike = async (menu: Menu) => {
    if (!user) {
      navigation.navigate("Login");
      return;
    }
    try {
      const data = await api<{ liked: boolean }>("/favorites/toggle", {
        body: { targetType: "menu", targetId: menu.id },
      });
      setMenus((prev) =>
        prev.map((m) => (m.id === menu.id ? { ...m, liked: data.liked } : m))
      );
    } catch {
      // ignore
    }
  };

  const data = useMemo(() => menus, [menus]);

  return (
    <View style={styles.screen}>
      <FlatList
        horizontal
        data={groups}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
        contentContainerStyle={styles.tabsContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setGroupId(item.id)}
            style={[styles.tab, groupId === item.id && styles.tabActive]}
          >
            <Text style={[styles.tabText, groupId === item.id && styles.tabTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        )}
      />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.tomato} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <MenuCard
                menu={item}
                onPress={() =>
                  navigation.navigate("MenuDetail", {
                    menuId: item.id,
                    storeId,
                  })
                }
                onToggleLike={() => toggleLike(item)}
              />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>표시할 메뉴가 없어요.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  tabs: { maxHeight: 56, borderBottomWidth: 1, borderBottomColor: colors.line },
  tabsContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    marginRight: 8,
  },
  tabActive: { backgroundColor: colors.tomato, borderColor: colors.tomato },
  tabText: { color: colors.muted, fontWeight: "600", fontSize: 13 },
  tabTextActive: { color: colors.white },
  list: { padding: 12, paddingBottom: 40 },
  row: { gap: 12 },
  cell: { flex: 1, marginBottom: 12 },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
});
