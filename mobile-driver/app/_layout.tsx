import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { TamaguiProvider, PortalProvider } from 'tamagui';
import config from '../tamagui.config';
import { AuthProvider } from '../context/auth';
import { ThemeProvider as CustomThemeProvider, useThemeMode } from './theme/ThemeContext';

function AppContent() {
  const { isDarkMode } = useThemeMode();
  const theme = isDarkMode ? 'dark' : 'light';

  return (
    <TamaguiProvider config={config} defaultTheme={theme}>
      <PortalProvider>
        <AuthProvider>
          <NavigationThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)/login" />
              <Stack.Screen name="vehicles/new" options={{ headerShown: true }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
          </NavigationThemeProvider>
        </AuthProvider>
      </PortalProvider>
    </TamaguiProvider>
  );
}

export default function RootLayout() {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
}
