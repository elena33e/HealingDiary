// screens/ProfileScreen.js
import React from 'react';
import { View, StyleSheet, TextInput} from 'react-native';



const MyTextInput = ({...props}) => {
    return (
        <View style={styles.container}>
            <TextInput
             style={styles.input}
             {...props}
            />
            
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 20
  },
 
  input: {
    width: '100%',
    height: 50,
    color: '#FFD0EC',
    borderRadius: 20

  }

});

export default MyTextInput;
