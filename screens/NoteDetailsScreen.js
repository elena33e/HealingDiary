import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';

const NoteDetailsScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { note: initialNote } = route.params; // Get note passed from previous screen

    const [note, setNote] = useState(initialNote);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const noteRef = doc(db, 'Notes', initialNote.key);
                const docSnapshot = await getDoc(noteRef);
    
                if (docSnapshot.exists()) {
                    setNote({ id: docSnapshot.id, ...docSnapshot.data() });
                } else {
                    console.log('Note no longer exists');
                }
            } catch (error) {
                console.error('Error fetching note:', error);
            }
        };
    
        fetchNote();
    }, [initialNote.key]);
    

    const handleEditPress = () => {
        navigation.navigate('EditNoteScreen', { note });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.date}>{note.date} {note.time}</Text>
            <Text style={styles.title}>{note.title}</Text>
            <Text style={styles.category}>{note.category}</Text>
            <Text style={styles.text}>{note.text}</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
                <Icon name="edit" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    date: {
        fontSize: 16,
        color: '#999',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1F2544',
    },
    category: {
        fontSize: 18,
        color: '#474F7A', // Similar color to the button for consistency
        marginBottom: 15,
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
    editButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#474F7A',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,  // for Android shadow
    },
});

export default NoteDetailsScreen;