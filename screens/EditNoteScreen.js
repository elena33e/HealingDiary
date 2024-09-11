import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { doc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const EditNoteScreen = () => {
  const navigation = useNavigation(); 
  const route = useRoute(); 
  const { note } = route.params;

  const [noteState, setNoteState] = useState({
    title: note.title,
    category: note.category,
    text: note.text,
  });
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [error, setError] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const categoriesQuery = query(
                    collection(db, 'Categories'),
                    where('user_id', '==', user.uid)
                );
                const querySnapshot = await getDocs(categoriesQuery);
                const categoriesList = [];
                querySnapshot.forEach((doc) => {
                    categoriesList.push({ id: doc.id, name: doc.data().name });
                });
                setCategories(categoriesList);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    fetchCategories();
}, []);

const handleSave = async () => {
  try {
    // Check if all fields are filled
    if (!noteState.title || !noteState.category || !noteState.text) {
      setError("Please fill in all fields");
      return;
    }

    console.log('Saving note:', noteState); 

    // Ensure note has an ID or key
    const noteId = note.key || note.id;  // Adjust if your note uses 'id' instead of 'key'

    if (!noteId) {
      throw new Error("Note does not have a valid ID.");
    }

    const noteRef = doc(db, 'Notes', noteId);  // Use the correct ID or key
    await updateDoc(noteRef, noteState);

    console.log("Note saved:", noteState); 
    navigation.goBack();
  } catch (error) {
    console.error("Error updating note:", error);
    setError("Error updating note: " + error.message);
  }
};


  const renderCategoryItem = ({ item }) => {
    console.log('Rendering category item:', item); 
    return (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => {
        setNoteState({ ...noteState, category: item.name });
        setIsModalVisible(false);
      }}
    >
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  )};

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={noteState.title}
          onChangeText={(text) => setNoteState({ ...noteState, title: text })}
          placeholder="Title"
        />
        <Text style={styles.label}>Select Category</Text>
        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.categoryText}>
            {noteState.category || "Select a Category"}
          </Text>
        </TouchableOpacity>
        <TextInput
          multiline
          style={[styles.input, styles.textArea]}
          value={noteState.text}
          onChangeText={(text) => setNoteState({ ...noteState, text: text })}
          placeholder="Note text"
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.save}>Save</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item && item.id}
            />
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    form: {
        flex: 1,
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#CCC',
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#FFF',
        borderRadius: 8,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    textArea: {
        height: 150,
        textAlignVertical: 'top',
    },
    button: {
        width: 55,
        height: 55,
        backgroundColor: "#474F7A",
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
    save: {
        color: '#FFF',
        fontSize: 24,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    categoryItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#EEE',
        width: '100%',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 18,
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#474F7A',
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#FFF',
        fontSize: 16,
    },
});

export default EditNoteScreen;