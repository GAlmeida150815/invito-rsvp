import React from "react";
import { StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Chip, Icon } from "react-native-paper";

interface CustomChipProps {
  label: string;
  color: string;
  iconSource: string;
  style?: StyleProp<ViewStyle>;
}

export function CustomChip({
  label,
  color,
  iconSource,
  style,
}: CustomChipProps) {
  return (
    <Chip
      mode='outlined'
      icon={({ size }) => (
        <Icon source={iconSource} color={color} size={size} />
      )}
      style={[styles.chip, { borderColor: color }, style]}
      textStyle={{
        fontSize: 11,
        color: color,
        lineHeight: 16,
        marginVertical: 0,
      }}
    >
      {label}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "transparent",
    height: 24,
    alignItems: "center",
  },
});
