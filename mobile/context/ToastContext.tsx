// mobile/context/ToastContext.tsx
// React & Core
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  View,
  StyleSheet,
  Platform,
  Animated,
  useWindowDimensions,
  TouchableOpacity,
  LayoutAnimation,
} from "react-native";

// Third Party
import { Text, Surface, IconButton, Portal } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

/*
 * Types
 */
type ToastType = "success" | "error" | "info";

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

type ToastContextData = {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
};

/*
 * Context Creation
 */
const ToastContext = createContext<ToastContextData>({} as ToastContextData);

/*
 * Helper Component: Toast Item
 */
const ToastItem = ({
  data,
  onDismiss,
  isWeb,
}: {
  data: ToastData;
  onDismiss: (id: string) => void;
  isWeb: boolean;
}) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  const getColors = () => {
    switch (data.type) {
      case "success":
        return {
          bg: "#FFFFFF",
          border: "#4CAF50",
          icon: "check-circle",
          iconColor: "#4CAF50",
        };
      case "error":
        return {
          bg: "#FFFFFF",
          border: "#F44336",
          icon: "alert-circle",
          iconColor: "#F44336",
        };
      default:
        return {
          bg: "#FFFFFF",
          border: "#2196F3",
          icon: "information",
          iconColor: "#2196F3",
        };
    }
  };
  const colors = getColors();

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: data.duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) handleExit();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExit = () => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      onDismiss(data.id);
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        marginBottom: 10,
        width: "100%",
        alignItems: isWeb ? "flex-end" : "center",
      }}
    >
      <Surface
        style={[styles.toastSurface, { borderLeftColor: colors.border }]}
        elevation={4}
      >
        <Animated.View
          style={{
            height: 3,
            backgroundColor: colors.border,
            width: progressWidth,
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
        <View style={styles.contentRow}>
          <IconButton
            icon={colors.icon}
            iconColor={colors.iconColor}
            size={20}
            style={{ margin: 0 }}
          />
          <Text
            variant='bodyMedium'
            style={{ flex: 1, marginLeft: 8, color: "#333" }}
          >
            {data.message}
          </Text>
          <TouchableOpacity onPress={handleExit}>
            <IconButton
              icon='close'
              size={16}
              iconColor='#999'
              style={{ margin: 0 }}
            />
          </TouchableOpacity>
        </View>
      </Surface>
    </Animated.View>
  );
};

/*
 * Provider Component
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const isWebOrTablet = width > 768 || Platform.OS === "web";

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 4000) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      const id = Date.now().toString() + Math.random().toString();
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  const hideToast = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const visibleToasts = isWebOrTablet ? toasts : [...toasts].reverse();

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Portal>
        <SafeAreaView
          style={[
            styles.container,
            isWebOrTablet ? styles.containerWeb : styles.containerMobile,
            { pointerEvents: "box-none" },
          ]}
        >
          {visibleToasts.map((toast) => (
            <ToastItem
              key={toast.id}
              data={toast}
              onDismiss={hideToast}
              isWeb={isWebOrTablet}
            />
          ))}
        </SafeAreaView>
      </Portal>
    </ToastContext.Provider>
  );
}

/*
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 9999,
    padding: 20,
    // REMOVI left: 0 e right: 0 daqui para serem específicos por plataforma
  },
  containerMobile: {
    top: 0,
    left: 0, // Mobile precisa de largura total para centrar
    right: 0,
    justifyContent: "flex-start",
  },
  containerWeb: {
    bottom: 0,
    right: 0,
    alignItems: "flex-end",
    maxWidth: 420,
  },
  toastSurface: {
    borderRadius: 8,
    backgroundColor: "white",
    width: "100%",
    maxWidth: 400,
    overflow: "hidden",
    borderLeftWidth: 4,
    minHeight: 50,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
    paddingTop: 15,
  },
});

/*
 * Hook Export
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
