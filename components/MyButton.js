// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Button, TextInput , TouchableOpacity} from 'react-native';
//import { TextInput } from 'react-native-gesture-handler';



const MyButton = ({title, onPress}) => {
    return (
        <TouchableOpacity 
        style={styles.container}
        onPress={onPress}>
            <Text style={styles.title}>{title}</Text>
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
    borderRadius: 30
  },
  title: {
    color: 'white',
    fontSize: 20,
  }

});

export default MyButton;
