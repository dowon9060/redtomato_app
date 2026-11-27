import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  NotoSansKR_400Regular,
  NotoSansKR_700Bold,
} from "@expo-google-fonts/noto-sans-kr";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useAuthStore } from "./src/store/authStore";
import { colors } from "./src/theme/colors";

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const loading = useAuthStore((s) => s.loading);
  const [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_700Bold,
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!fontsLoaded || loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.cream,
        }}
      >
        <ActivityIndicator color={colors.tomato} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <RootNavigator />
    </GestureHandlerRootView>
  );
}
