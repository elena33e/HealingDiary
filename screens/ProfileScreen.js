import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { getAuth, onAuthStateChanged } from '@firebase/auth';
import { app, auth } from '../firebaseConfig';
import MyButton from '../components/MyButton';

const ProfileScreen = () => {
  const [user, setUser] = useState(null); // Use `null` instead of an empty string
  //const auth = getAuth(app);

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
    <View style={styles.authContainer}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.emailText}>Hello, user!</Text>
      <Text style={styles.emailText}>{user.email}</Text>
      <MyButton title="Logout" color="#e74c3c" onPress={() => auth.signOut()} />
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
