import React, { useEffect, useState } from "react";
import { FlatList, ActivityIndicator, StyleSheet, View } from 'react-native';
import NoteCard from '../components/NoteCard';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, deleteDoc} from "firebase/firestore";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAuth } from "firebase/auth";  // Import Firebase Auth

const NotesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const auth = getAuth();  // Get the auth object

  useEffect(() => {
    const user = auth.currentUser;  // Get the current logged-in user

    if (user) {
      const notesRef = collection(db, 'Notes');
      
      // Create a query to fetch notes for the logged-in user
      const userNotesQuery = query(
        notesRef, 
        where('user_id', '==', user.uid)  // Filter by user_id
      );

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
  }, []);

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

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={({ item }) => (
          <NoteCard 
            title={item.title}   
            text={item.text}
            itemKey={item.key}
            onPress={handleNotePress} 
            onDelete={handleDeleteNote}
          />
        )}
        keyExtractor={(item) => item.key}
        numColumns={1}  // Display 1 item per row
        //columnWrapperStyle={styles.row} // Add some spacing between rows
        contentContainerStyle={styles.scrollViewContent} // Use this for padding/margin
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AddNotes')}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollViewContent: {
    padding: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    position: 'absolute',
    right: 20,
    bottom: 20,
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
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  }
});

export default NotesScreen;
