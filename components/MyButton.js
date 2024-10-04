import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemeContext } from '../utilities/ThemeContext';

const MyButton = ({ title, onPress, isLoading = false }) => {

  const { theme } = useContext(ThemeContext);

    return (
       <TouchableOpacity 
            style={[
                styles.container, 
                { backgroundColor: isLoading ? theme.disabledButton : theme.buttonBackground } // Use theme colors
            ]}
            onPress={isLoading ? null : onPress} // Disable onPress when loading
            disabled={isLoading} // Disable button when loading
        >
            {isLoading ? (
                <ActivityIndicator size="small" color={theme.loadingColor} /> // Use theme color for spinner
            ) : (
                <Text style={[styles.title, { color: theme.buttonText }]}>{title}</Text> // Use theme color for text
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
 
  title: {
    fontSize: 20,
  },
});

export default MyButton;
