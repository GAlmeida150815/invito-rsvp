// mobile/components/MobileHeader.tsx

// React & Core
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";

// Third Party
import {
  Surface,
  Avatar,
  Text,
  Divider,
  IconButton,
  Button,
  useTheme,
  Badge,
} from "react-native-paper";

// Project imports
import { Tab } from "@/types/ui.types";

// Types
type WebSidebarProps = {
  userName?: string;
  userEmail?: string;
  tabs: Tab[];
  activeTab: number;
  onTabPress: (index: number) => void;
  onLogout: () => void;
};

export function WebSidebar({
  userName,
  userEmail,
  tabs,
  activeTab,
  onTabPress,
  onLogout,
}: WebSidebarProps) {
  const theme = useTheme();

  return (
    <Surface style={styles.webSidebar} elevation={2}>
      <View style={{ padding: 20, alignItems: "center" }}>
        <Avatar.Text
          size={64}
          label={userName?.substring(0, 2).toUpperCase() || "EU"}
        />
        <Text
          variant='titleMedium'
          style={{ marginTop: 10, fontWeight: "bold" }}
        >
          {userName}
        </Text>
        <Text variant='bodySmall'>{userEmail}</Text>
      </View>
      <Divider />
      <View style={{ padding: 5, alignItems: "center" }}>
        <Text
          variant='headlineSmall'
          style={{ fontWeight: "bold", color: theme.colors.primary }}
        >
          Invito
        </Text>
      </View>
      <Divider />
      <View style={{ marginTop: 10 }}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabPress(index)}
            style={[
              styles.webSidebarItem,
              activeTab === index && styles.webSidebarItemActive,
            ]}
          >
            <View style={{ position: "relative" }}>
              <IconButton
                icon={tab.icon}
                iconColor={activeTab === index ? theme.colors.primary : "gray"}
              />
              {(tab.badge ?? 0) > 0 && (
                <Badge
                  size={18}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    backgroundColor: theme.colors.error,
                  }}
                >
                  {tab.badge && tab.badge > 99 ? "99+" : tab.badge}
                </Badge>
              )}
            </View>
            <Text
              style={{
                color: activeTab === index ? theme.colors.primary : "gray",
                fontWeight: activeTab === index ? "bold" : "normal",
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <Button icon='logout' onPress={onLogout} style={{ margin: 20 }}>
        Sair
      </Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  webSidebar: {
    width: 250,
    height: "100%",
    backgroundColor: "white",
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  webSidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  webSidebarItemActive: {
    backgroundColor: "#f0f9ff",
    borderRightWidth: 3,
    borderRightColor: "#00A3FF",
  },
});
