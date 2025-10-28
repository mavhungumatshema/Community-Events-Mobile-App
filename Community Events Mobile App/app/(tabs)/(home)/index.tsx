import React, { useState, useEffect, useCallback } from "react";
import { Stack, Link, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, View, Text, Alert, Platform, RefreshControl, TextInput, ScrollView } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  attendees: number;
  createdBy: string;
}

interface User {
  id: string;
  email: string;
}

const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    name: "React Native Meetup",
    description: "Join us for an exciting discussion about React Native best practices and new features.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: "San Francisco, CA",
    attendees: 45,
    createdBy: "user1",
  },
  {
    id: "2",
    name: "Web Development Workshop",
    description: "Learn modern web development techniques with hands-on coding sessions.",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    location: "New York, NY",
    attendees: 32,
    createdBy: "user2",
  },
  {
    id: "3",
    name: "Mobile App Design Conference",
    description: "Explore the latest trends in mobile app design and user experience.",
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Austin, TX",
    attendees: 78,
    createdBy: "user3",
  },
  {
    id: "4",
    name: "JavaScript Fundamentals",
    description: "Master the fundamentals of JavaScript programming language.",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Seattle, WA",
    attendees: 56,
    createdBy: "user4",
  },
];

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [userRsvps, setUserRsvps] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      const userData = await AsyncStorage.getItem("user");
      const rsvpData = await AsyncStorage.getItem("userRsvps");
      if (userData) {
        setUser(JSON.parse(userData));
      }
      if (rsvpData) {
        setUserRsvps(JSON.parse(rsvpData));
      }
    } catch (error) {
      console.log("Error loading user from storage:", error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleRsvp = async (eventId: string) => {
    if (!user) {
      Alert.alert("Please Login", "You need to be logged in to RSVP for events");
      router.push("/(tabs)/profile");
      return;
    }

    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      let newRsvps = [...userRsvps];
      if (newRsvps.includes(eventId)) {
        newRsvps = newRsvps.filter((id) => id !== eventId);
      } else {
        newRsvps.push(eventId);
      }
      setUserRsvps(newRsvps);
      await AsyncStorage.setItem("userRsvps", JSON.stringify(newRsvps));
      Alert.alert("Success", "Your RSVP has been updated!");
    } catch (error) {
      console.log("Error updating RSVP:", error);
    }
  };

  const isUserRsvped = (eventId: string) => {
    return userRsvps.includes(eventId);
  };

  const renderEventCard = ({ item }: { item: Event }) => {
    const hasRsvped = isUserRsvped(item.id);
    return (
      <GlassView
        style={[
          styles.eventCard,
          Platform.OS !== "ios" && {
            backgroundColor: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          },
        ]}
        glassEffectStyle="regular"
      >
        <View style={styles.eventHeader}>
          <View style={styles.eventTitleContainer}>
            <Text style={[styles.eventTitle, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.eventDate, { color: theme.dark ? "#98989D" : "#666" }]}>
              {new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
          <View
            style={[
              styles.attendeeBadge,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={styles.attendeeText}>{item.attendees}</Text>
          </View>
        </View>

        <Text style={[styles.eventDescription, { color: theme.dark ? "#98989D" : "#666" }]}>
          {item.description}
        </Text>

        <View style={styles.eventFooter}>
          <View style={styles.locationContainer}>
            <IconSymbol
              name="location.fill"
              size={14}
              color={theme.dark ? "#98989D" : "#666"}
            />
            <Text style={[styles.locationText, { color: theme.dark ? "#98989D" : "#666" }]}>
              {item.location}
            </Text>
          </View>
          <Pressable
            style={[
              styles.rsvpButton,
              {
                backgroundColor: hasRsvped ? theme.colors.primary : theme.colors.accent,
              },
            ]}
            onPress={() => handleRsvp(item.id)}
          >
            <Text style={styles.rsvpButtonText}>
              {hasRsvped ? "✓ RSVP'd" : "RSVP"}
            </Text>
          </Pressable>
        </View>
      </GlassView>
    );
  };

  const renderHeaderRight = () => (
    <Pressable
      onPress={() => router.push("/(tabs)/(home)/create-event")}
      style={styles.headerButtonContainer}
    >
      <IconSymbol name="plus" color={theme.colors.primary} size={24} />
    </Pressable>
  );

  return (
    <>
      {Platform.OS === "ios" && (
        <Stack.Screen
          options={{
            title: "Community Events",
            headerRight: renderHeaderRight,
          }}
        />
      )}
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["top"]}
      >
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Upcoming Events
          </Text>
          {Platform.OS !== "ios" && (
            <Pressable
              onPress={() => router.push("/(tabs)/(home)/create-event")}
              style={styles.headerButtonContainer}
            >
              <IconSymbol name="plus" color={theme.colors.primary} size={24} />
            </Pressable>
          )}
        </View>

        {!user && (
          <View style={styles.loginPrompt}>
            <IconSymbol name="person.crop.circle.badge.exclamationmark" size={40} color={theme.colors.primary} />
            <Text style={[styles.loginPromptText, { color: theme.colors.text }]}>
              Sign in to RSVP for events
            </Text>
            <Pressable
              style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push("/(tabs)/profile")}
            >
              <Text style={styles.loginButtonText}>Go to Profile</Text>
            </Pressable>
          </View>
        )}

        <FlatList
          data={events}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            Platform.OS !== "ios" && styles.listContainerWithTabBar,
          ]}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconSymbol name="calendar" size={48} color={theme.colors.grey} />
              <Text style={[styles.emptyText, { color: theme.colors.grey }]}>
                No events available
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerButtonContainer: {
    padding: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listContainerWithTabBar: {
    paddingBottom: 100,
  },
  eventCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
  },
  attendeeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  attendeeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
  },
  rsvpButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  rsvpButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  loginPrompt: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  loginPromptText: {
    fontSize: 16,
    marginVertical: 12,
    textAlign: "center",
  },
  loginButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  loginButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});
