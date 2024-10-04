import React, { createContext, useState, useEffect } from 'react';
import { Appearance, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

// Define your themes
const lightTheme = {
  background: 'white',
  text: '#333',
  buttonBackground: '#474F7A',
  buttonText: 'white',
  loadingColor: '#FFF',
  disabledButton: '#AAA',
  placeholder: '#242944',
  titleInputBackground: 'white',
  inputBackground: '#b9bfda',
  cardBackground: 'white',
  icon: '#81689D',
  favoriteIcon: "#81689D",
  textDontHave: '#6A30DA',
  textSignUp: '#8A65DF',
  accentColor: '#007AFF',
  toolbarBackground: '#c5cae0'
  
};

const darkTheme = {
  background: '#242a45',
  text: 'white',
  buttonBackground: '#888',
  buttonText: 'white',
  disabledButton: '#555',
  loadingColor: '#FFF',
  placeholder: '#FFF',
  titleInputBackground: '#b9bfda',
  inputBackground: '#b9bfda',
  cardBackground: '#414c7c',
  icon: 'white',
  favoriteIcon: "white",
  textDontHave: 'white',
  textSignUp: 'white',  
  accentColor: '#BB86FC',
  toolbarBackground: '#414c7c'
};

// Create ThemeContext
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);

  // Toggle between light and dark theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === lightTheme ? darkTheme : lightTheme));
  };

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    });
    return () => subscription.remove();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <View style={{ backgroundColor: theme.background, flex: 1 }}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeContext };
