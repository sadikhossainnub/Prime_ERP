import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { getSession } from "../services/auth";

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      setAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated === null) return; // Wait for auth check to complete

    const inTabsGroup = segments[0] === "(tabs)";

    if (authenticated && !inTabsGroup) {
      router.replace("/(tabs)/dashboard");
    } else if (!authenticated && inTabsGroup) {
      router.replace("/login");
    }
  }, [authenticated, segments]);

  if (!loaded || authenticated === null) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
