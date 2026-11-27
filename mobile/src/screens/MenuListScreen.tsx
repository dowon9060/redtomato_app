import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { MenuListContent } from "../components/MenuListContent";
import type { RootStackParamList } from "../navigation/types";

type R = RouteProp<RootStackParamList, "MenuList">;

export function MenuListScreen() {
  const route = useRoute<R>();
  return (
    <MenuListContent
      storeId={route.params?.storeId}
      initialGroupId={route.params?.groupId ?? "signature"}
    />
  );
}
