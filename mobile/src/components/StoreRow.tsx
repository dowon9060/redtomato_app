import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import type { Store } from "../types/models";
import { resolveStoreImage } from "../data/images";
import { colors } from "../theme/colors";

type Props = {
  store: Store;
  onPress: () => void;
  onToggleLike?: () => void;
};

export function StoreRow({ store, onPress, onToggleLike }: Props) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.photoWrap}>
        <Image
          source={resolveStoreImage(store.id)}
          style={styles.photo}
          contentFit="cover"
        />
      </View>
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.name} numberOfLines={1}>
            {store.name}
          </Text>
          <View style={[styles.badge, store.isOpen ? styles.open : styles.closed]}>
            <Text style={styles.badgeText}>
              {store.isOpen ? "영업중" : "준비중"}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>연락처 {store.phone || "매장 문의"}</Text>
        <Text style={styles.meta}>운영시간 {store.hours}</Text>
        <Text style={styles.address} numberOfLines={2}>
          {store.address}
        </Text>
        {onToggleLike ? (
          <Pressable onPress={onToggleLike} style={styles.like}>
            <Text style={styles.likeText}>
              {store.liked ? "찜 해제" : "지점 찜"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  photoWrap: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.tomatoSoft,
    alignSelf: "center",
  },
  photo: {
    width: 96,
    height: 96,
  },
  body: {
    flex: 1,
    paddingVertical: 2,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  name: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.ink },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  open: { backgroundColor: "#E8F5E9" },
  closed: { backgroundColor: "#FFF3E0" },
  badgeText: { fontSize: 12, fontWeight: "700", color: colors.ink },
  meta: { color: colors.muted, fontSize: 13, marginBottom: 2 },
  address: { color: colors.ink, fontSize: 13, marginTop: 4, lineHeight: 18 },
  like: { marginTop: 8, alignSelf: "flex-start" },
  likeText: { color: colors.tomato, fontWeight: "700", fontSize: 13 },
});
