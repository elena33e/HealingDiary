import React, { useEffect, useState } from "react";
import { FlatList, ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import NoteCard from '../components/NoteCard';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc} from "firebase/firestore";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAuth } from "firebase/auth";  // Import Firebase Auth

const FavoriteNotesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const auth = getAuth();  

  useEffect(() => {
    const user = auth.currentUser;  // Get the current logged-in user

    if (user) {
      const notesRef = collection(db, 'Notes');
      
      let favNotesQuery;     
      favNotesQuery = query(
          notesRef, 
          where('user_id', '==', user.uid),
          where('isFavourite', '==', true)  // Filter by favourite status
        );

      // Set up the real-time listener for notes collection
      const unsubscribe = onSnapshot(favNotesQuery, (querySnapshot) => {
        const favNotesList = [];
        querySnapshot.forEach((doc) => {
          favNotesList.push({
            ...doc.data(),
            key: doc.id,
          });
        });

        setNotes(favNotesList);
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
  }); 

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
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
       {notes.length === 0 && (
          <View style={styles.emptyMessageContainer}>
            <Text style={styles.emptyMessage}>It seems like there is nothing here yet...
                                              Start adding notes! 
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
          />
        )}
        keyExtractor={(item) => item.key}
        numColumns={1}  // Display 1 item per row
        //columnWrapperStyle={styles.row} // Add some spacing between rows
        contentContainerStyle={styles.scrollViewContent} // Use this for padding/margin
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  scrollViewContent: {
    padding: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
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
    color: '#999',
  },
});

export default FavoriteNotesScreen;

