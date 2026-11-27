import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/colors";

type Props = {
  embedded?: boolean;
};

export function LoginScreen({ embedded = false }: Props) {
  const navigation = useNavigation();
  const login = useAuthStore((s) => s.login);
  const [name, setName] = useState("홍길동");
  const [nickname, setNickname] = useState("토마토러버");
  const [phone, setPhone] = useState("01012345678");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      await login({ name, nickname, phone });
      if (!embedded && navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert(
        "로그인 실패",
        e instanceof Error ? e.message : "다시 시도해 주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>포장 주문 로그인</Text>
      <Text style={styles.desc}>이름, 닉네임, 연락처로 바로 시작할 수 있어요.</Text>
      <TextInput
        style={styles.input}
        placeholder="이름"
        value={name}
        onChangeText={setName}
        placeholderTextColor={colors.muted}
      />
      <TextInput
        style={styles.input}
        placeholder="닉네임"
        value={nickname}
        onChangeText={setNickname}
        placeholderTextColor={colors.muted}
      />
      <TextInput
        style={styles.input}
        placeholder="연락처"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholderTextColor={colors.muted}
      />
      <PrimaryButton label="로그인" onPress={onSubmit} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: "800", color: colors.ink, marginTop: 12 },
  desc: { color: colors.muted, marginBottom: 8 },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.ink,
  },
});
