import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { LoginScreen } from "./LoginScreen";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/colors";

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) {
    return <LoginScreen embedded />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.label}>닉네임</Text>
        <Text style={styles.value}>{user.nickname}</Text>
        <Text style={styles.label}>이름</Text>
        <Text style={styles.value}>{user.name}</Text>
        <Text style={styles.label}>연락처</Text>
        <Text style={styles.value}>{user.phone}</Text>
        <Text style={styles.label}>포인트</Text>
        <Text style={styles.points}>{user.points.toLocaleString("ko-KR")}P</Text>
      </View>
      <PrimaryButton
        label="로그아웃"
        variant="ghost"
        onPress={async () => {
          await logout();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, padding: 16, gap: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  label: { color: colors.muted, fontSize: 12, marginTop: 12 },
  value: { color: colors.ink, fontSize: 17, fontWeight: "700", marginTop: 4 },
  points: {
    color: colors.tomato,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 6,
  },
});
