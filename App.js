import 'react-native-gesture-handler';
import React, { useEffect, useContext, useState } from "react";
import { View, StyleSheet, SafeAreaView } from 'react-native';
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
import { ThemeProvider, ThemeContext } from './utilities/ThemeContext'; 

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
          return <MaterialIcons name={iconName} color={focused ? '#E4D0FF' : '#474F7A'} size={size} />;
        },
        tabBarLabelStyle: {
          display: 'none',
        },
        tabBarItemStyle: {
          width: 60,
          height: 50,
          borderRadius: 100,
          marginHorizontal: 25,
          backgroundColor: '#FFD0EC89',
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
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

const ToggleThemeButton = () => {
  const { toggleTheme, theme } = useContext(ThemeContext);

  // Use the background color to decide the icon
  const iconName = theme.background === '#1F1F1F' ? 'nights-stay' : 'wb-sunny';

  return (
    <View style={styles.toggleButtonContainer}>
      <MaterialIcons name={iconName} size={24} color="white" onPress={toggleTheme} />
    </View>
  );
};


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth(app);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);

      if (state.isConnected) {
        ToastAndroid.show('You are online', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('You are offline', ToastAndroid.SHORT);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <ThemeProvider>
      <ThemeContext.Consumer>
        {({ theme }) => (
          <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <NavigationContainer>
              <ToggleThemeButton />
              {isAuthenticated ? <MainApp /> : <AuthStack />}
            </NavigationContainer>
          </SafeAreaView>
        )}
      </ThemeContext.Consumer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  toggleButtonContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#474F7A',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
    zIndex: 10
  },
  container: {
    flex: 1,
  },
});
