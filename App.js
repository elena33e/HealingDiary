import 'react-native-gesture-handler';
import React, { useEffect } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import CategoriesScreen from './screens/CategoriesScreen';
import FavoriteNotesScreen from './screens/FavoriteNotesScreen';
import AddCategoryScreen from './screens/AddCategoryScreen';
import AddNoteScreen from './screens/AddNoteScreen';
import NotesScreen from './screens/NotesScreen';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import SubcategoriesScreen from './screens/SubcategoriesScreen';
import NoteDetailsScreen from './screens/NoteDetailsScreen';
import EditNoteScreen from './screens/EditNoteScreen';
import { getAuth, onAuthStateChanged } from '@firebase/auth';
import { app } from './firebaseConfig';
import NetInfo from "@react-native-community/netinfo";
import { ToastAndroid } from 'react-native'; 

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function CategoriesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="My categories" component={CategoriesScreen} />
      <Stack.Screen name="AddCategory" component={AddCategoryScreen} />
      <Stack.Screen name="SubcategoriesScreen" component={SubcategoriesScreen} />
      <Stack.Screen name="AddCategoryScreen" component={AddCategoryScreen} />
      <Stack.Screen name="AddNoteScreen" component={AddNoteScreen} />
      <Stack.Screen name="NoteDetailsScreen" component={NoteDetailsScreen} />
      <Stack.Screen name="EditNoteScreen" component={EditNoteScreen} />
    </Stack.Navigator>
  );
}

function NotesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="My Notes" component={NotesScreen} />
      <Stack.Screen name="NoteDetailsScreen" component={NoteDetailsScreen} />
      <Stack.Screen name="EditNoteScreen" component={EditNoteScreen} />
      <Stack.Screen name="AddNoteScreen" component={AddNoteScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function MainApp() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          switch (route.name) {
            case 'Categories':
              iconName = 'category';
              break;
            case 'Notes':
              iconName = 'library-books';
              break;
            case 'Favorites':
              iconName = 'favorite';
              break;
            case 'Profile':
              iconName = 'person';
              break;
          }
          // Change icon color based on whether it's focused
          return <MaterialIcons name={iconName} color={focused ? '#E4D0FF' : '#474F7A'} size={size} />;
        },
        tabBarLabelStyle: {
          display: 'none', // Hides the labels
        },
        tabBarItemStyle: {
          width: 60, // Set width to a fixed value
          height: 50, // Set height to the same fixed value
          borderRadius: 100, // Make borderRadius half of width/height to achieve perfect round shape
          marginHorizontal: 25, // Space between tabs
          backgroundColor: '#FFD0EC89', // Tab item background color
          justifyContent: 'center', // Center icon vertically
          alignItems: 'center', // Center icon horizontally
        },
        tabBarStyle: {
          backgroundColor: 'white', // Background color of the tab bar
          borderTopWidth: 0, // Removes top border of tab bar
          height: 70, // Height of the tab bar
          paddingBottom: 10,
          paddingTop: 10 // Padding to add space at the bottom
        },
      })}
    >
      <Tab.Screen name="Categories" component={CategoriesStack} />
      <Tab.Screen name="Notes" component={NotesStack} />
      <Tab.Screen name="Favorites" component={FavoriteNotesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}




export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const auth = getAuth(app);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      
      if (state.isConnected) {
        ToastAndroid.show('You are online', ToastAndroid.SHORT); // Or handle online state
      } else {
        ToastAndroid.show('You are offline', ToastAndroid.SHORT); // Or handle offline state
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainApp /> : <AuthStack />}
    </NavigationContainer>
  );
}
