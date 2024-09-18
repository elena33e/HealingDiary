import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const NoteCard = ({ title, text, itemKey, onPress, onDelete, onFavorite, isFavorite }) => {
    const deleteItem = () => {
        Alert.alert(
            "Delete Note",
            "Are you sure you want to delete this note?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: () => {
                        onDelete(itemKey);  // Call the passed onDelete function with the note ID
                    },
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <TouchableOpacity onPress={() => onPress(itemKey)} style={styles.cardContainer}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.title}>{title}</Text>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.favoriteButton} onPress={() => onFavorite(itemKey)}>
                            <Icon name={isFavorite ? "favorite" : "favorite-border"} 
                                  size={20} 
                                  color={isFavorite ? "#81689D" : "#999"} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={deleteItem}>
                            <Icon name="delete" size={20} color="#999" />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text
                    style={styles.text}
                    numberOfLines={3}  // Limit text to 3 lines
                    ellipsizeMode="tail"
                >
                    {text}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        marginVertical: 10,
        marginHorizontal: 10,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2544',
        flex: 1,
    },
    text: {
        fontSize: 14,
        color: '#333',
        marginTop: 5,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    favoriteButton: {
        padding: 5,
    },
    deleteButton: {
        padding: 5,
        marginLeft: 10,
    },
});

export default NoteCard;
