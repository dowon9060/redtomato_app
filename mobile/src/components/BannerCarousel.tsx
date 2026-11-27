import { useEffect, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import type { Banner } from "../types/models";
import { resolveBannerImage } from "../data/images";
import { colors } from "../theme/colors";

const WIDTH = Dimensions.get("window").width - 32;
const STEP = WIDTH + 12;

type Props = { banners: Banner[] };

export function BannerCarousel({ banners }: Props) {
  const [index, setIndex] = useState(0);
  const [scrollX, setScrollX] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % banners.length;
        setScrollX(next * STEP);
        return next;
      });
    }, 3800);
    return () => clearInterval(timer);
  }, [banners.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setIndex(Math.round(x / STEP));
  };

  return (
    <View>
      <ScrollView
        key={`banner-scroll-${scrollX}`}
        horizontal
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={STEP}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentOffset={{ x: scrollX, y: 0 }}
      >
        {banners.map((banner) => (
          <View key={banner.id} style={styles.card}>
            <Image
              source={resolveBannerImage(banner.imageKey)}
              style={styles.image}
              contentFit="cover"
            />
            <View style={styles.overlay}>
              <Text style={styles.title}>{banner.title}</Text>
              <Text style={styles.subtitle}>{banner.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {banners.map((b, i) => (
          <View key={b.id} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: WIDTH,
    height: 200,
    marginRight: 12,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.tomatoSoft,
  },
  image: { width: "100%", height: "100%" },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "flex-end",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  title: { color: colors.white, fontSize: 18, fontWeight: "700" },
  subtitle: { color: colors.white, marginTop: 4, fontSize: 13 },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  dotActive: { backgroundColor: colors.tomato, width: 16 },
});
