
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  attendees: number;
  createdBy: string;
}

export default function CreateEventScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventName.trim() || !description.trim() || !location.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      
      // Get existing events
      const eventsData = await AsyncStorage.getItem("userCreatedEvents");
      const existingEvents: Event[] = eventsData ? JSON.parse(eventsData) : [];
      
      // Get current user
      const userData = await AsyncStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      if (!user) {
        Alert.alert("Error", "You must be logged in to create an event");
        router.back();
        return;
      }

      // Create new event
      const newEvent: Event = {
        id: Math.random().toString(36).substr(2, 9),
        name: eventName,
        description: description,
        date: date.toISOString(),
        location: location,
        attendees: 1,
        createdBy: user.id,
      };

      // Save event
      const updatedEvents = [...existingEvents, newEvent];
      await AsyncStorage.setItem("userCreatedEvents", JSON.stringify(updatedEvents));

      Alert.alert("Success", "Event created successfully!");
      router.back();
    } catch (error) {
      console.log("Error creating event:", error);
      Alert.alert("Error", "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Create Event",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <IconSymbol name="chevron.left" size={24} color={theme.colors.primary} />
            </Pressable>
          ),
        }}
      />
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
        edges={["top"]}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <IconSymbol name="calendar.badge.plus" size={48} color={theme.colors.primary} />
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Create New Event
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.dark ? "#98989D" : "#666" }]}>
              Share your event with the community
            </Text>
          </View>

          <GlassView
            style={[
              styles.formContainer,
              Platform.OS !== "ios" && {
                backgroundColor: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
              },
            ]}
            glassEffectStyle="regular"
          >
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Event Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: theme.colors.grey,
                    backgroundColor: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    color: theme.colors.text,
                  },
                ]}
                placeholder="Enter event name"
                placeholderTextColor={theme.colors.grey}
                value={eventName}
                onChangeText={setEventName}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Description *</Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    borderColor: theme.colors.grey,
                    backgroundColor: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    color: theme.colors.text,
                  },
                ]}
                placeholder="Describe your event"
                placeholderTextColor={theme.colors.grey}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Location *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: theme.colors.grey,
                    backgroundColor: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    color: theme.colors.text,
                  },
                ]}
                placeholder="Enter event location"
                placeholderTextColor={theme.colors.grey}
                value={location}
                onChangeText={setLocation}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Date & Time *</Text>
              <Pressable
                style={[
                  styles.dateButton,
                  {
                    borderColor: theme.colors.grey,
                    backgroundColor: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
                disabled={loading}
              >
                <IconSymbol name="calendar" size={20} color={theme.colors.primary} />
                <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
                  {date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Pressable>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
              />
            )}

            {Platform.OS === "ios" && showDatePicker && (
              <Pressable
                style={[styles.datePickerDone, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerDoneText}>Done</Text>
              </Pressable>
            )}
          </GlassView>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[
                styles.cancelButton,
                {
                  backgroundColor: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                },
              ]}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.createButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: loading ? 0.6 : 1,
                },
              ]}
              onPress={handleCreateEvent}
              disabled={loading}
            >
              <IconSymbol name="plus.circle.fill" size={20} color="white" />
              <Text style={styles.createButtonText}>
                {loading ? "Creating..." : "Create Event"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  formContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 100,
    fontSize: 16,
    textAlignVertical: "top",
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    flex: 1,
  },
  datePickerDone: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  datePickerDoneText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  headerButton: {
    padding: 8,
  },
});
