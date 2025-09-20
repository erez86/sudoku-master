import { Stack } from 'expo-router';
import { useFonts, Quicksand_400Regular, Quicksand_500Medium, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { TouchableOpacity } from "react-native";
import { Icon } from "@/components/UI/Icon";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const CustomBackButton = () => (
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
          <Icon library="ionicons" name="chevron-back" color="#fff" size={24} />
      </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3498db',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontFamily: 'Quicksand_600SemiBold',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Sudoku Master',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="game/index"
        options={{
          title: 'Game',
          headerLeft: () => <CustomBackButton />,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="rules/index"
        options={{
          title: 'Rules & Tips',
          headerLeft: () => <CustomBackButton />,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          headerLeft: () => <CustomBackButton />,
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
