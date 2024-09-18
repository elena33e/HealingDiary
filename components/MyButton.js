import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

const MyButton = ({ title, onPress, isLoading = false }) => {
    return (
        <TouchableOpacity 
            style={[styles.container, isLoading && styles.disabledButton]} // Apply disabled style when loading
            onPress={isLoading ? null : onPress} // Disable onPress when loading
            disabled={isLoading} // Disable button when loading
        >
            {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" /> // Show spinner when loading
            ) : (
                <Text style={styles.title}>{title}</Text> // Show title when not loading
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
    backgroundColor: '#474F7A',
    borderRadius: 30,
  },
  disabledButton: {
    backgroundColor: '#AAA', // Change button color when disabled
  },
  title: {
    color: 'white',
    fontSize: 20,
  },
});

export default MyButton;
