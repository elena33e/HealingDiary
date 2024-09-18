import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput, 
    Modal, KeyboardAvoidingView, Platform, ScrollView, 
    FlatList, ActivityIndicator
} from 'react-native';
import { db } from '../firebaseConfig';
import { doc, updateDoc, getDocs, collection, query, where, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Formik } from 'formik';
import MyButton from "../components/MyButton";

const EditNoteScreen = ({ route, navigation }) => {
    const { note } = route.params; // Get the note passed from previous screen
    const [categories, setCategories] = useState([]);
    const [categoryValue, setCategoryValue] = useState(note.category || ''); 
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false); // Track form submission
    const [loading, setLoading] = useState(false); // Loading state
    const auth = getAuth();

    // Fetch Categories
    const getCategories = async () => {
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
                    categoriesList.push({ id: doc.id, name: doc.name });
                });
                setCategories(categoriesList);
            }
        } catch (error) {
            console.error("Error fetching categories: ", error);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    // Update Note on Firebase
    const onSubmitMethod = async (values, { resetForm }) => {
      setFormSubmitted(true);
      setLoading(true); // Start loading
  
      try {
          const user = auth.currentUser;
          if (user) {
              if (!note || !note.id) {
                  throw new Error("Note ID is missing");
              }
              
              const noteRef = doc(db, 'Notes', note.id); // Use note id
              await updateDoc(noteRef, { ...values, category: categoryValue, user_id: user.uid });
              setLoading(false); // Stop loading
              navigation.goBack(); // Navigate back
          }
      } catch (error) {
          setLoading(false); // Stop loading on error
          console.error('Error updating note:', error);
      }
  };
  
    // Category Item
    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => {
                setCategoryValue(item.name); // Set selected category
                setIsModalVisible(false);
            }}
        >
            <Text style={styles.categoryText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
            )}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Formik
                    initialValues={{
                        title: note.title || '',
                        category: categoryValue || '',
                        text: note.text || ''
                    }}
                    onSubmit={onSubmitMethod}
                    validate={(values) => {
                        const errors = {};
                        if (!values.title) {
                            errors.title = 'You must give the note a title';
                        }
                        if (!categoryValue) {
                            errors.category = 'Please select a category';
                        } else {
                            values.category = categoryValue; // Set category value
                        }
                        if (!values.text) {
                            errors.text = 'Please add some text to the note';
                        }
                        return errors;
                    }}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
                        <View style={styles.form}>
                            <TextInput
                                style={styles.titleInput}
                                placeholder="Title..."
                                value={values.title}
                                onChangeText={handleChange('title')}
                                onBlur={handleBlur('title')}
                            />
                            {formSubmitted && errors.title && (
                                <Text style={styles.errorText}>{errors.title}</Text>
                            )}

                            <Text style={styles.label}>Select Category</Text>
                            <TouchableOpacity
                                style={styles.categoryInput}
                                onPress={() => setIsModalVisible(true)}
                            >
                                <Text style={styles.categoryText}>
                                    {categoryValue || 'Select a Category'}
                                </Text>
                            </TouchableOpacity>
                            {formSubmitted && errors.category && (
                                <Text style={styles.errorText}>{errors.category}</Text>
                            )}

                            <TextInput
                                multiline
                                style={styles.textArea}
                                placeholder="Your notes here..."
                                value={values.text}
                                onChangeText={handleChange('text')}
                                onBlur={handleBlur('text')}
                            />
                            {formSubmitted && errors.text && (
                                <Text style={styles.errorText}>{errors.text}</Text>
                            )}

                            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                                <Text style={styles.add}>✓</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Formik>

                {/* Category Modal */}
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
                                keyExtractor={(item) => item.id}
                            />
                            <MyButton title='Close' onPress={() => setIsModalVisible(false)} />
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// Styling (similar to AddNoteScreen)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        paddingBottom: 70,
    },
    form: {
        flex: 1,
    },
    titleInput: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 20,
        fontWeight: 'bold',
        backgroundColor: '#FFF',
        borderRadius: 8,
    },
    categoryInput: {
        width: '80%',
        height: 55,
        borderColor: '#D6BBFC',
        backgroundColor: '#E8DFFC',
        borderRadius: 25,
        padding: 15,
        paddingHorizontal: 20,
        fontSize: 16,
        marginBottom: 20,
        marginTop: 20,
        marginLeft: 10
    },
    label: {
        fontSize: 16,
        paddingLeft: 15,
        color: '#333',
    },
    textArea: {
        height: 400,
        textAlignVertical: 'top',
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
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
    add: {
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
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
});

export default EditNoteScreen;
