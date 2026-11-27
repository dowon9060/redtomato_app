import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { api } from "../api/client";
import { colors } from "../theme/colors";

export function FranchiseInquiryScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const data = await api<{ message: string }>("/franchise/inquiries", {
        body: { name, phone, region, message },
        auth: false,
      });
      Alert.alert("접수 완료", data.message);
      setName("");
      setPhone("");
      setRegion("");
      setMessage("");
    } catch (e) {
      Alert.alert(
        "접수 실패",
        e instanceof Error ? e.message : "다시 시도해 주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>입점 문의하기</Text>
      <Text style={styles.desc}>
        성함과 연락처를 남겨 주시면 담당자가 안내드려요. 상담 전화 1899-0964
      </Text>
      <TextInput
        style={styles.input}
        placeholder="이름"
        value={name}
        onChangeText={setName}
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
      <TextInput
        style={styles.input}
        placeholder="희망 지역"
        value={region}
        onChangeText={setRegion}
        placeholderTextColor={colors.muted}
      />
      <TextInput
        style={[styles.input, styles.area]}
        placeholder="문의 내용"
        value={message}
        onChangeText={setMessage}
        multiline
        placeholderTextColor={colors.muted}
      />
      <PrimaryButton label="문의 보내기" onPress={submit} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: "800", color: colors.ink },
  desc: { color: colors.muted, lineHeight: 20, marginBottom: 4 },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: colors.ink,
  },
  area: { minHeight: 120, textAlignVertical: "top" },
});
