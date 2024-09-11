import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MyButton from '../components/MyButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

const NoteDetailsScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { note: initialNote } = route.params; // Get note passed from previous screen

    const [note, setNote] = useState(initialNote);

    useEffect(() => {
        const noteRef = doc(db, 'Notes', initialNote.key);

        // Set up the real-time listener
        const unsubscribe = onSnapshot(noteRef, (doc) => {
            if (doc.exists()) {
                setNote(doc.data()); // Update state with the new data
            } else {
                console.log('Note no longer exists');
            }
        });

        // Cleanup the listener on component unmount
        return () => unsubscribe();
    }, [initialNote.key]);

    const handleEditPress = () => {
        navigation.navigate('EditNoteScreen', { note });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.date}>{note.date} {note.time}</Text>
            <Text style={styles.title}>{note.title}</Text>
            <Text style={styles.text}>{note.text}</Text>
            <MyButton title="Edit" onPress={handleEditPress} />
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
    text: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
});

export default NoteDetailsScreen;