import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StoreRow } from "../components/StoreRow";
import { api } from "../api/client";
import seed from "../data/seedCatalog.json";
import { useAuthStore } from "../store/authStore";
import { useAppStore } from "../store/appStore";
import { colors } from "../theme/colors";
import type { Store } from "../types/models";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function StoreListScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const setSelectedStore = useAppStore((s) => s.setSelectedStore);
  const setAddressLabel = useAppStore((s) => s.setAddressLabel);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ stores: Store[] }>("/stores");
      setStores(data.stores);
    } catch {
      setStores(
        (seed.stores as Store[]).map((s) => ({
          ...s,
          isOpen: s.isOpen ?? true,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggleLike = async (store: Store) => {
    if (!user) {
      navigation.navigate("Login");
      return;
    }
    const data = await api<{ liked: boolean }>("/favorites/toggle", {
      body: { targetType: "store", targetId: String(store.id) },
    });
    setStores((prev) =>
      prev.map((s) => (s.id === store.id ? { ...s, liked: data.liked } : s))
    );
  };

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
      data={stores}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <StoreRow
          store={item}
          onToggleLike={() => toggleLike(item)}
          onPress={() => {
            setSelectedStore(item);
            setAddressLabel(item.address.split(" ").slice(0, 2).join(" "));
            navigation.navigate("StoreMenus", { storeId: item.id });
          }}
        />
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>표시할 지점이 없어요.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
});
