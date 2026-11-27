import { useCallback, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeHeader } from "../components/HomeHeader";
import { BannerCarousel } from "../components/BannerCarousel";
import { api } from "../api/client";
import seed from "../data/seedCatalog.json";
import { useAuthStore } from "../store/authStore";
import { useAppStore } from "../store/appStore";
import { colors } from "../theme/colors";
import type { Banner } from "../types/models";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const address = useAppStore((s) => s.addressLabel);
  const [banners, setBanners] = useState<Banner[]>(seed.banners as Banner[]);

  const load = useCallback(async () => {
    try {
      const data = await api<{ banners: Banner[] }>("/banners", { auth: false });
      if (data.banners?.length) setBanners(data.banners);
    } catch {
      setBanners(seed.banners as Banner[]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.screen}>
      <HomeHeader address={address} nickname={user?.nickname} />

      <View style={styles.section}>
        <BannerCarousel banners={banners.slice(0, 5)} />
      </View>

      <View style={styles.cardsArea}>
        <View style={styles.mainCards}>
          <Pressable
            style={[styles.mainCard, styles.menuCard]}
            onPress={() => navigation.navigate("MenuList", {})}
          >
            <Text style={styles.mainEyebrow}>포장 주문</Text>
            <View>
              <Text style={styles.mainTitle}>메뉴보기</Text>
              <Text style={styles.mainDesc}>
                시그니처부터 사이드까지{"\n"}한눈에 고르세요
              </Text>
            </View>
          </Pressable>
          <Pressable
            style={[styles.mainCard, styles.storeCard]}
            onPress={() => navigation.navigate("StoreList")}
          >
            <Text style={styles.mainEyebrow}>가까운 매장</Text>
            <View>
              <Text style={styles.mainTitle}>지점보기</Text>
              <Text style={styles.mainDesc}>
                영업시간과 연락처를{"\n"}확인하고 주문해요
              </Text>
            </View>
          </Pressable>
        </View>
        <View style={styles.cardsSpacer} />
      </View>

      <Pressable
        style={styles.inquiryCard}
        onPress={() => navigation.navigate("FranchiseInquiry")}
      >
        <View style={styles.inquiryText}>
          <Text style={styles.inquiryEyebrow}>파트너십</Text>
          <Text style={styles.inquiryTitle}>입점 문의하기</Text>
          <Text style={styles.inquiryDesc}>
            빨간토마토피자와 함께할 예비 점주님을 기다려요.
          </Text>
        </View>
        <Text style={styles.inquiryCta}>문의하기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingBottom: 8,
  },
  section: { paddingHorizontal: 16 },
  cardsArea: {
    flex: 1,
    marginTop: 16,
    marginBottom: 16,
  },
  mainCards: {
    flex: 4,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
  },
  cardsSpacer: {
    flex: 1,
  },
  mainCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    justifyContent: "space-between",
  },
  menuCard: {
    backgroundColor: colors.tomato,
  },
  storeCard: {
    backgroundColor: colors.ink,
  },
  mainEyebrow: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "600",
  },
  mainTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "800",
  },
  mainDesc: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
  inquiryCard: {
    marginHorizontal: 16,
    marginBottom: 4,
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  inquiryText: { flex: 1 },
  inquiryEyebrow: { color: colors.muted, fontSize: 12 },
  inquiryTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },
  inquiryDesc: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  inquiryCta: {
    color: colors.tomato,
    fontWeight: "800",
    fontSize: 14,
  },
});
