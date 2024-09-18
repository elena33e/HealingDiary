// components/CategoryCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import {doc, deleteDoc } from 'firebase/firestore';
import {db} from './../firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';


const CategoryCard = ({ category, image, itemKey, onPress, onDelete }) => {

    // Function to delete the category
    const deleteItem = async () => {
        try {
            // Create a reference to the document
            const categoryRef = doc(db, 'Categories', itemKey);
            await deleteDoc(categoryRef);
            console.log('Category deleted!');
            onDelete(itemKey); // Call the onDelete function to remove the category from the state
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
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'OK',
                    onPress: deleteItem,
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.card} onPress={() => onPress(itemKey)}>
                <Image source={image} style={styles.image} />
                <Text style={styles.label}>{category}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
                <Icon name="delete" size={20} color="#999" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        margin: 8,
        position: 'relative',  // Ensure the delete button can be positioned relative to the card
    },
    card: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        width: 170,
        height: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
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
        color: '#333',
    },
    deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        padding: 5,
    },
});

export default CategoryCard;
