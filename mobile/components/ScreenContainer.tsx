// mobile/components/ScreenContainer.tsx
// React & Core
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";

// Third Party
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  withScroll?: boolean;
};

export function ScreenContainer({ children, withScroll = true }: Props) {
  const theme = useTheme();

  const Content = <View style={styles.responsiveContainer}>{children}</View>;

  return (
    <SafeAreaView
      style={[styles.background, { backgroundColor: theme.colors.background }]}
      edges={["top", "left", "right"]}
    >
      {withScroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          {Content}
        </ScrollView>
      ) : (
        <View style={styles.fullHeight}>{Content}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  fullHeight: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 40,
  },
  responsiveContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    paddingHorizontal: 20,
  },
});
