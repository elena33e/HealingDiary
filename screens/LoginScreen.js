import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import MyTextInput from '../components/MyTextInput';
import MyButton from '../components/MyButton';
import { auth } from '../firebaseConfig';
import {signInWithEmailAndPassword } from '@firebase/auth';
import { ThemeContext } from '../utilities/ThemeContext';
import { terminate } from 'firebase/firestore';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { theme } = useContext(ThemeContext);

  const loginWithEmailAndPassword = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((res) => {
        console.log(res);
        Alert.alert('Logged in!');
        //navigation.navigate('Profile');
      })
      .catch(err => {
        console.log(err);
        Alert.alert("Error logging in: " + err.nativeErrorMessage);
      });
  };

  return (
    <View style = {[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Login</Text>
      <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground }]}>

        <MyTextInput
          value={email}
          onChangeText={text => setEmail(text)}
          placeholder='Enter e-mail'
          style={[styles.input, {background: theme.inputBackground}]}
        />

        <MyTextInput
          value={password}
          onChangeText={text => setPassword(text)}
          placeholder='Enter password'
          secureTextEntry
          style={styles.input}
        />

        <MyButton title='Login' onPress={loginWithEmailAndPassword} style={styles.button} />
        
        <View style={styles.signupContainer}>
          <Text style={[styles.textDontHave, {color: theme.textDontHave}]}>Don’t have an account yet? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={[styles.signUpText, {color: theme.textSignUp}]}>Sign Up!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',  // Set the background to white
    padding: 20,
    justifyContent: 'center',
  },
  inputContainer: {
    width: '100%',
    height: '80%',
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#474F7A',  // Match the color scheme
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#D6BBFC',
    backgroundColor: '#E8DFFC',
    borderRadius: 25,
    padding: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#6A30DA',
    marginBottom: 20,
  },
  signupContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignSelf: 'center',
    marginRight: 10,
    marginBottom: 15,
  },
  
  signUpText: { 
    fontWeight: 'bold',
  },
  button: {
    width: '80%',
    padding: 15,
    paddingHorizontal: 20,
    backgroundColor: "#8A65DF",
    borderRadius: 25,
  },
});

export default LoginScreen;