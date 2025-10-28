import { Platform } from 'react-native';
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: Platform.OS === 'ios',
          title: 'Community Events'
        }}
      />
      <Stack.Screen
        name="create-event"
        options={{
          presentation: "modal",
          title: "Create Event",
        }}
      />
    </Stack>
  );
}
