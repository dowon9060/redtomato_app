import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  address: string;
  nickname?: string | null;
};

export function HomeHeader({ address, nickname }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <Text style={styles.label}>현재 위치</Text>
        <Text style={styles.address} numberOfLines={1}>
          {address}
        </Text>
      </View>
      {nickname ? (
        <View style={styles.right}>
          <Text style={styles.nickname} numberOfLines={1}>
            {nickname}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  left: { flex: 1, paddingRight: 12 },
  right: { alignItems: "flex-end", maxWidth: "40%" },
  label: { color: colors.muted, fontSize: 12, marginBottom: 2 },
  address: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  nickname: { color: colors.tomato, fontSize: 15, fontWeight: "700" },
});
