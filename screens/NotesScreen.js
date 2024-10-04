import React, { useEffect, useState, useContext } from "react";
import { FlatList, ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import NoteCard from '../components/NoteCard';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAuth } from "firebase/auth";  // Import Firebase Auth
import { ThemeContext } from '../utilities/ThemeContext';

const NotesScreen = ({ navigation, category }) => {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const auth = getAuth();  // Get the auth object

  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const user = auth.currentUser;  // Get the current logged-in user

    if (user) {
      const notesRef = collection(db, 'Notes');
      
      // Build query based on whether category is provided or not
      let userNotesQuery;
      if (category) {
        // If category is provided, filter by category
        userNotesQuery = query(
          notesRef, 
          where('user_id', '==', user.uid),
          where('category', '==', category)  // Filter by category
        );
      } else {
        // If no category is provided, fetch all notes for the user
        userNotesQuery = query(
          notesRef, 
          where('user_id', '==', user.uid)
        );
      }

      // Set up the real-time listener for notes collection
      const unsubscribe = onSnapshot(userNotesQuery, (querySnapshot) => {
        const notesList = [];
        querySnapshot.forEach((doc) => {
          notesList.push({
            ...doc.data(),
            key: doc.id,
          });
        });

        setNotes(notesList);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching notes: ", error);
        setLoading(false);
      });

      // Cleanup listener on unmount
      return () => unsubscribe();
    } else {
      console.error("No user is logged in");
      setLoading(false);
    }
  }, [category]); 

  const handleNotePress = (itemKey) => {
    const note = notes.find(n => n.key === itemKey);  // Find the note by key
    navigation.navigate('NoteDetailsScreen', { note });
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const noteRef = doc(db, 'Notes', noteId);
      await deleteDoc(noteRef);

      // Update local state to remove the note
      setNotes(notes.filter(note => note.key !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
      Alert.alert("Error", "There was a problem deleting the note.");
    }
  };

  const handleFavoriteToggle = async (noteKey, isCurrentlyFavorite) => {
    try {
      const noteRef = doc(db, 'Notes', noteKey);
      
      // Update the `isFavourite` field in Firestore
      await updateDoc(noteRef, {
        isFavourite: !isCurrentlyFavorite
      });
      
      // Update local state to reflect changes (optional, depending on how real-time listener behaves)
      setNotes(prevNotes => prevNotes.map(note =>
        note.key === noteKey ? { ...note, isFavourite: !isCurrentlyFavorite } : note
      ));
    } catch (error) {
      console.error("Error updating favorite status: ", error);
      Alert.alert("Error", "There was a problem updating the favorite status.");
    }
  };
  

  if (loading) {
    return <ActivityIndicator color={theme.text} />;
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
       {notes.length === 0 && (
          <View style={styles.emptyMessageContainer}>
            <Text style={[styles.emptyMessage, { color: theme.text }]}>
              It seems like there is nothing here yet... Start adding notes!
            </Text>
          </View>
        )}
      <FlatList
        data={notes}
        renderItem={({ item }) => (
          <NoteCard 
            title={item.title}   
            text={item.text}
            itemKey={item.key}
            isFavorite={item.isFavourite}
            onPress={handleNotePress} 
            onFavorite={() => handleFavoriteToggle(item.key, item.isFavourite)} 
            onDelete={handleDeleteNote}
            theme={theme}  // Pass theme to the NoteCard component
          />
        )}
        keyExtractor={(item) => item.key}
        numColumns={1}  // Display 1 item per row
        contentContainerStyle={styles.scrollViewContent}  // Use this for padding/margin
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.buttonBackground, shadowColor: theme.shadow }]}
          onPress={() => navigation.navigate('AddNoteScreen')}
        >
          <Icon name="note-add" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
  },
  button: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,  // for Android shadow
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  emptyMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    margin: 15
  },
  emptyMessage: {
    fontSize: 16,
  },
});

export default NotesScreen;
