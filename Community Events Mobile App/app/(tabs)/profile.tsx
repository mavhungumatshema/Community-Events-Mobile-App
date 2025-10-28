import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";

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

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRsvps, setUserRsvps] = useState<string[]>([]);

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

  const userRsvpedEvents = MOCK_EVENTS.filter((event) => userRsvps.includes(event.id));

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: email,
      };
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      setEmail("");
      setPassword("");
      Alert.alert("Success", isSignup ? "Account created!" : "Logged in successfully!");
    } catch (error) {
      Alert.alert("Error", "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => console.log("Cancel pressed") },
      {
        text: "Logout",
        onPress: async () => {
          try {
            const AsyncStorage = require("@react-native-async-storage/async-storage").default;
            await AsyncStorage.removeItem("user");
            setUser(null);
            setUserRsvps([]);
          } catch (error) {
            console.log("Error logging out:", error);
          }
        },
      },
    ]);
  };

  if (!user) {
    return (
      <>
        <Stack.Screen options={{ title: "Login / Sign Up" }} />
        <SafeAreaView
          style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
          edges={["top"]}
        >
          <ScrollView
            style={styles.container}
            contentContainerStyle={[
              styles.contentContainer,
              Platform.OS !== "ios" && styles.contentContainerWithTabBar,
            ]}
          >
            <View style={styles.authContainer}>
              <IconSymbol name="person.crop.circle.badge.plus" size={64} color={theme.colors.primary} />
              <Text style={[styles.authTitle, { color: theme.colors.text }]}>
                {isSignup ? "Create Account" : "Welcome Back"}
              </Text>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.colors.grey,
                      backgroundColor: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.grey}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.colors.grey,
                      backgroundColor: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.grey}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <Pressable
                style={[styles.authButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleAuth}
                disabled={loading}
              >
                <Text style={styles.authButtonText}>
                  {loading ? "Loading..." : isSignup ? "Sign Up" : "Login"}
                </Text>
              </Pressable>

              <Pressable onPress={() => setIsSignup(!isSignup)}>
                <Text style={[styles.toggleText, { color: theme.colors.primary }]}>
                  {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                </Text>
              </Pressable>

              <View style={styles.divider} />

              <Text style={[styles.demoText, { color: theme.colors.grey }]}>
                Demo: Use any email and password to test
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Profile" }} />
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
        edges={["top"]}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.contentContainer,
            Platform.OS !== "ios" && styles.contentContainerWithTabBar,
          ]}
        >
          <GlassView
            style={[
              styles.profileHeader,
              Platform.OS !== "ios" && {
                backgroundColor: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
              },
            ]}
            glassEffectStyle="regular"
          >
            <IconSymbol name="person.circle.fill" size={80} color={theme.colors.primary} />
            <Text style={[styles.name, { color: theme.colors.text }]}>{user.email}</Text>
            <Text style={[styles.email, { color: theme.dark ? "#98989D" : "#666" }]}>
              Community Member
            </Text>
          </GlassView>

          <View style={styles.statsContainer}>
            <GlassView
              style={[
                styles.statCard,
                Platform.OS !== "ios" && {
                  backgroundColor: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                },
              ]}
              glassEffectStyle="regular"
            >
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {userRsvpedEvents.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.grey }]}>Events Joined</Text>
            </GlassView>
          </View>

          {userRsvpedEvents.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Your Events
              </Text>
              {userRsvpedEvents.map((event) => (
                <GlassView
                  key={event.id}
                  style={[
                    styles.eventItem,
                    Platform.OS !== "ios" && {
                      backgroundColor: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                    },
                  ]}
                  glassEffectStyle="regular"
                >
                  <View style={styles.eventItemContent}>
                    <Text style={[styles.eventItemTitle, { color: theme.colors.text }]}>
                      {event.name}
                    </Text>
                    <Text style={[styles.eventItemDate, { color: theme.dark ? "#98989D" : "#666" }]}>
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <IconSymbol name="checkmark.circle.fill" size={24} color={theme.colors.accent} />
                </GlassView>
              ))}
            </View>
          )}

          <Pressable
            style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
            onPress={handleLogout}
          >
            <IconSymbol name="arrow.right.circle" size={20} color="white" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>
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
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  authContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
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
  authButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  authButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleText: {
    fontSize: 14,
    marginTop: 16,
    textDecorationLine: "underline",
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    width: "100%",
    marginVertical: 24,
  },
  demoText: {
    fontSize: 12,
    textAlign: "center",
  },
  profileHeader: {
    alignItems: "center",
    borderRadius: 12,
    padding: 32,
    marginBottom: 16,
    gap: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  email: {
    fontSize: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  eventItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventItemContent: {
    flex: 1,
  },
  eventItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  eventItemDate: {
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 24,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
