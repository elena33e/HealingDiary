import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { onAuthStateChanged } from '@firebase/auth';
import { auth } from '../firebaseConfig';
import MyButton from '../components/MyButton';
import { ThemeContext } from '../utilities/ThemeContext';

const ProfileScreen = () => {
  const [user, setUser] = useState(null); // Use `null` instead of an empty string
  
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log('User UID:', currentUser.uid); // You can use this UID to fetch notes for this user
      } else {
        setUser(null);
      }
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  

  if (user === null) {
    // Optionally render a loading indicator while checking auth state
    return <View style={styles.authContainer}><Text>Loading...</Text></View>;
  }

  return (
    <View style={[styles.authContainer, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
      <Text style={[styles.emailText, { color: theme.text }]}>Hello, user!</Text>
      <Text style={[styles.emailText, { color: theme.text }]}>{user.email}</Text>
      <MyButton 
         title="Logout" 
         color="#e74c3c" 
         onPress={() => auth.signOut()} />
    </View>
  );
};

const styles = StyleSheet.create({
  authContainer: {
        width: "100%",
        padding: 30,
        borderRadius: 5,
        flex: 1,
        justifyContent: 'center',
        backgroundColor: "white"
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    marginBottom: 150
  },
  emailText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ProfileScreen;
