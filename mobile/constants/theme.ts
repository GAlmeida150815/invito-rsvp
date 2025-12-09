import { MD3LightTheme as DefaultTheme } from "react-native-paper";

export const AppTheme = {
  ...DefaultTheme,
  roundness: 16,
  colors: {
    ...DefaultTheme.colors,
    primary: "#00A3FF",
    onPrimary: "#FFFFFF",
    secondary: "#007AFF",
    background: "#F2F4F7",
    surface: "#FFFFFF",
    surfaceVariant: "#Eef7ff",
    error: "#FF453A",
    text: "#000000",
    outline: "#D1D1D6",
    elevation: {
      level1: "#FFFFFF",
    },
  },
};
