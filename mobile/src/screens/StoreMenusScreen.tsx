import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MenuListContent } from "../components/MenuListContent";
import { api } from "../api/client";
import seed from "../data/seedCatalog.json";
import { useAppStore } from "../store/appStore";
import { colors } from "../theme/colors";
import type { Store } from "../types/models";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, "StoreMenus">;

export function StoreMenusScreen() {
  const route = useRoute<R>();
  const navigation = useNavigation<Nav>();
  const setSelectedStore = useAppStore((s) => s.setSelectedStore);
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api<{ store: Store }>(`/stores/${route.params.storeId}`);
        setStore(data.store);
        setSelectedStore(data.store);
        navigation.setOptions({ title: data.store.name });
      } catch {
        const local = (seed.stores as Store[]).find(
          (s) => s.id === route.params.storeId
        );
        if (local) {
          setStore(local);
          setSelectedStore(local);
          navigation.setOptions({ title: local.name });
        }
      }
    })();
  }, [route.params.storeId, navigation, setSelectedStore]);

  return (
    <View style={styles.screen}>
      {store ? (
        <View style={styles.banner}>
          <Text style={styles.meta}>
            {store.isOpen ? "영업중" : "준비중"} · {store.hours}
          </Text>
          <Text style={styles.address}>{store.address}</Text>
        </View>
      ) : null}
      <MenuListContent storeId={route.params.storeId} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  meta: { color: colors.tomato, fontWeight: "700", fontSize: 13 },
  address: { color: colors.muted, marginTop: 4, fontSize: 13 },
});
