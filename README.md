# Community-Events-Mobile-App

Simple React Native app (Expo) to browse, create, and RSVP for community events. Includes email/password + Google sign-in via Firebase.

### Features
- Email/password authentication (Firebase)
- Google social sign-in (Firebase)
- Event list (mock data)
- Create event (name, description, date)
- RSVP to events and view your registered events on a dashboard
- Persistent session with AsyncStorage
- Navigation using React Navigation

### Quick setup (local)
1. Install Expo CLI: `npm install -g expo-cli`
2. Clone repo and `cd` into it
3. `npm install`
4. Create a Firebase project and enable Email/Password and Google sign-in. Add your `firebaseConfig` to `src/config/firebase.js`.
5. `expo start`

### Libraries used
- expo, react-native
- firebase
- @react-navigation/native, @react-navigation/stack
- @react-native-async-storage/async-storage
- expo-google-app-auth or Firebase's Google auth flow via `expo-auth-session`
