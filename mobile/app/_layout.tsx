// mobile/app/_layout.tsx

// React & Core
import React, { useEffect } from "react";
import { View, ActivityIndicator, Platform } from "react-native";

// Third Party
import { Stack, useRouter, useSegments } from "expo-router";
import Head from "expo-router/head";
import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";

// Project Imports
import { AppTheme } from "@/constants/theme";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ModalProvider } from "@/context/ModalContext";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "admin";
    const isHome = segments.length === 0;

    if (user && isHome) {
      router.replace("/(admin)/dashboard");
    } else if (!user && inAuthGroup) {
      router.replace("/");
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: AppTheme.colors.background,
        }}
      >
        <ActivityIndicator size='large' color={AppTheme.colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "web") {
      if (typeof document !== "undefined") {
        const style = document.createElement("style");
        style.textContent = `
          * {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          *::-webkit-scrollbar {
            display: none;
          }
        `;
        document.head.appendChild(style);

        return () => {
          document.head.removeChild(style);
        };
      }
    }
  }, []);

  return (
    <PaperProvider theme={AppTheme}>
      <Head>
        <title>Invito - Eventos</title>
      </Head>
      <ToastProvider>
        <ModalProvider>
          <AuthProvider>
            <StatusBar style='dark' />
            <AuthGuard>
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: AppTheme.colors.surface },
                  headerTintColor: AppTheme.colors.primary,
                  headerTitleStyle: { fontWeight: "bold" },
                  headerShadowVisible: false,
                  contentStyle: { backgroundColor: AppTheme.colors.background },
                }}
              >
                <Stack.Screen name='index' options={{ headerShown: false }} />
                <Stack.Screen
                  name='(admin)/dashboard'
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name='guest/[code]'
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name='(admin)/event/[id]'
                  options={{ headerShown: false }}
                />
              </Stack>
            </AuthGuard>
          </AuthProvider>
        </ModalProvider>
      </ToastProvider>
    </PaperProvider>
  );
}
