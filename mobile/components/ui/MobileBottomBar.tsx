// mobile/components/MobileBottomBar.tsx

// React & Core
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";

// Third Party
import { Surface, IconButton, useTheme, Badge } from "react-native-paper";

// Project imports
import { Tab } from "@/types/ui.types";

// Types
type MobileBottomBarProps = {
  tabs: Tab[];
  activeTab: number;
  onTabPress: (index: number) => void;
};

export function MobileBottomBar({
  tabs,
  activeTab,
  onTabPress,
}: MobileBottomBarProps) {
  const theme = useTheme();

  return (
    <Surface style={styles.bottomBar} elevation={4}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onTabPress(index)}
          style={styles.bottomBarItem}
        >
          <View style={{ position: "relative" }}>
            <IconButton
              icon={tab.icon}
              iconColor={activeTab === index ? theme.colors.primary : "gray"}
              size={24}
              style={{ margin: 0 }}
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
          {/* Indicador de Tab Ativa */}
          {activeTab === index && (
            <View
              style={[
                styles.activeIndicator,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          )}
        </TouchableOpacity>
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    justifyContent: "space-around",
    alignItems: "center",
  },
  bottomBarItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: "absolute",
    bottom: 5,
  },
});
