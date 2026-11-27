import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "ghost";
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = "primary",
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        variant === "ghost" && styles.ghost,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? colors.tomato : colors.white} />
      ) : (
        <Text style={[styles.label, variant === "ghost" && styles.ghostLabel]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.tomato,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  ghost: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tomato,
  },
  disabled: { opacity: 0.5 },
  label: { color: colors.white, fontSize: 16, fontWeight: "700" },
  ghostLabel: { color: colors.tomato },
});
