
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './../firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CategoryCard = ({ category, image, itemKey, onPress, onDelete, theme }) => {
    
    // Function to delete the category
    const deleteItem = async () => {
        try {
            const categoryRef = doc(db, 'Categories', itemKey);
            await deleteDoc(categoryRef);
            console.log('Category deleted!');
            onDelete(itemKey);
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    // Confirm delete with user
    const confirmDelete = () => {
        Alert.alert(
            'Delete Category',
            'Are you sure you want to delete this category?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK', onPress: deleteItem },
            ],
            { cancelable: false }
        );
    };

    // Determine shadow styles based on theme
    const shadowStyles = theme.mode === 'dark'
        ? {
            shadowColor: '#FFF',  // Light shadow color for dark theme
            shadowOpacity: 0.1,   // Lower opacity for subtle shadow in dark mode
            shadowOffset: { width: 0, height: 2 },  // Slight shadow offset for depth
            shadowRadius: 4,      // Adjust radius for smoothness
            elevation: 5,         // Keep elevation balanced in dark mode
        }
        : {
            shadowColor: '#000',  // Dark shadow color for light theme
            shadowOpacity: 0.2,   // More noticeable shadow in light mode
            shadowOffset: { width: 0, height: 2 },  // Balanced offset for elevation
            shadowRadius: 5,      // Smooth radius for shadow effect
            elevation: 6,
        };

    // Dynamic background color based on the theme
    const cardBackgroundColor = theme.cardBackground || (theme.mode === 'dark' ? '#333' : '#fff');

    return (
        <View style={[styles.cardContainer, shadowStyles, { backgroundColor: cardBackgroundColor }]}>
            <TouchableOpacity style={styles.card} onPress={() => onPress(itemKey)}>
                <Image source={image} style={styles.image} />
                <Text style={[styles.label, { color: theme.text }]}>{category}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.deleteButton, {color: theme.text}]} onPress={confirmDelete}>
                <Icon name="delete" size={20} color="#999" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        margin: 8,
        borderRadius: 15,       // Ensure the container also has rounded corners
        overflow: 'hidden',     // Prevent shadow overflow from card container
    },
    card: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,       // Ensure the card itself has rounded corners
        padding: 10,
        width: 170,
        height: 200,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'transparent',
        borderRadius: 20,
        padding: 5,
    },
});

export default CategoryCard;
