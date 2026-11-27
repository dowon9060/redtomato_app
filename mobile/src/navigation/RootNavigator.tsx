import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/HomeScreen";
import { MenuListScreen } from "../screens/MenuListScreen";
import { MenuDetailScreen } from "../screens/MenuDetailScreen";
import { StoreListScreen } from "../screens/StoreListScreen";
import { StoreMenusScreen } from "../screens/StoreMenusScreen";
import { OrdersScreen } from "../screens/OrdersScreen";
import { OrderDetailScreen } from "../screens/OrderDetailScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { CartScreen } from "../screens/CartScreen";
import { FranchiseInquiryScreen } from "../screens/FranchiseInquiryScreen";
import { useCartStore } from "../store/cartStore";
import { colors } from "../theme/colors";
import type { RootStackParamList, TabParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  const cartCount = useCartStore((s) => s.totalCount());

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.cream },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: "800", color: colors.ink },
        tabBarActiveTintColor: colors.tomato,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.line,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconSize = size ?? 22;
          if (route.name === "HomeTab") {
            return (
              <Text style={{ fontSize: iconSize, color }}>
                {focused ? "🏠" : "🏡"}
              </Text>
            );
          }
          if (route.name === "OrdersTab") {
            return <Text style={{ fontSize: iconSize }}>📋</Text>;
          }
          if (route.name === "CartTab") {
            return <Text style={{ fontSize: iconSize }}>🛒</Text>;
          }
          return <Text style={{ fontSize: iconSize }}>👤</Text>;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: "홈",
          headerTitle: "빨간토마토피자",
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{ title: "내주문", headerTitle: "내 주문" }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          title: "장바구니",
          headerTitle: "장바구니",
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.tomato,
            fontSize: 11,
            minWidth: 18,
            height: 18,
            lineHeight: 16,
          },
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: "프로필", headerTitle: "프로필" }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.cream },
          headerShadowVisible: false,
          headerTintColor: colors.tomato,
          headerTitleStyle: { color: colors.ink, fontWeight: "800" },
          contentStyle: { backgroundColor: colors.cream },
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MenuList"
          component={MenuListScreen}
          options={{ title: "메뉴보기" }}
        />
        <Stack.Screen
          name="MenuDetail"
          component={MenuDetailScreen}
          options={{ title: "메뉴 상세" }}
        />
        <Stack.Screen
          name="StoreList"
          component={StoreListScreen}
          options={{ title: "지점보기" }}
        />
        <Stack.Screen
          name="StoreMenus"
          component={StoreMenusScreen}
          options={{ title: "지점 메뉴" }}
        />
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: "장바구니" }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "로그인" }} />
        <Stack.Screen
          name="FranchiseInquiry"
          component={FranchiseInquiryScreen}
          options={{ title: "입점 문의" }}
        />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{ title: "주문 상세" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
