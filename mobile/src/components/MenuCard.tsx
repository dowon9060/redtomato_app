import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import type { Menu } from "../types/models";
import { resolveMenuImage } from "../data/images";
import { formatPriceRows } from "../utils/format";
import { colors } from "../theme/colors";

type Props = {
  menu: Menu;
  onPress: () => void;
  onToggleLike?: () => void;
};

export function MenuCard({ menu, onPress, onToggleLike }: Props) {
  const image = resolveMenuImage(menu.imageKey);
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        {image ? (
          <Image source={image} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>이미지 준비중</Text>
          </View>
        )}
        {onToggleLike ? (
          <Pressable style={styles.like} onPress={onToggleLike} hitSlop={8}>
            <Text style={styles.likeText}>{menu.liked ? "찜됨" : "찜"}</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {menu.name}
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {menu.description || "빨간토마토피자 메뉴예요."}
        </Text>
        <Text style={styles.price}>{formatPriceRows(menu.priceRows)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
  },
  imageWrap: { position: "relative" },
  image: { width: "100%", height: 120, backgroundColor: colors.tomatoSoft },
  placeholder: { alignItems: "center", justifyContent: "center" },
  placeholderText: { color: colors.muted, fontSize: 12 },
  like: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  likeText: { color: colors.tomato, fontSize: 12, fontWeight: "700" },
  body: { padding: 12, gap: 4 },
  name: { fontSize: 15, fontWeight: "700", color: colors.ink },
  desc: { fontSize: 12, color: colors.muted, lineHeight: 17 },
  price: { marginTop: 4, fontSize: 13, fontWeight: "700", color: colors.tomatoDark },
});
