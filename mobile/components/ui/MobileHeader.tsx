// mobile/components/MobileHeader.tsx

// React & Core
import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Third Party
import { Avatar, Text, IconButton } from "react-native-paper";

// Types
type MobileHeaderProps = {
  userName?: string;
  onLogout: () => void;
};

export function MobileHeader({ userName, onLogout }: MobileHeaderProps) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.mobileHeader}>
        <Avatar.Text
          size={32}
          label={userName?.substring(0, 2).toUpperCase() || "EU"}
        />
        <Text variant='titleMedium' style={{ fontWeight: "bold" }}>
          Invito
        </Text>
        <IconButton icon='logout' size={20} onPress={onLogout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  mobileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
  },
});
