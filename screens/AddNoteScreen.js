
import React, { useEffect, useState } from "react";
import { 
    View, Text, StyleSheet, TouchableOpacity, ToastAndroid, 
    TextInput, KeyboardAvoidingView, Platform, ScrollView, 
    FlatList, Modal 
} from 'react-native';
import { db } from '../firebaseConfig';
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Formik } from 'formik';

const AddNoteScreen = () => {
    const [categories, setCategories] = useState([]);
    const [categoryValue, setCategoryValue] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
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

    const onSubmitMethod = async (values, { resetForm }) => {
        try {
            const user = auth.currentUser;
            if (user) {
                // Add user_id to the note data
                const noteData = {
                    ...values,
                    user_id: user.uid,
                };
                const docRef = await addDoc(collection(db, 'Notes'), noteData);
                if (docRef.id) {
                    ToastAndroid.show('Note saved!', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
                    resetForm(); // Reset form after successful submission
                    setCategoryValue(null); // Reset category selection
                }
            } else {
                ToastAndroid.show('User not authenticated', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
            }
        } catch (error) {
            console.error("Error adding document: ", error);
            ToastAndroid.show('Error saving note', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        }
    };

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => {
                setCategoryValue(item.name);
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
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Formik
                    initialValues={{ title: '', category: '', text: '' }}
                    onSubmit={onSubmitMethod}
                    validate={(values) => {
                        const errors = {};
                        if (!values.title) {
                            errors.title = 'You must give the note a title';
                        }
                        if (!categoryValue) {
                            errors.category = 'Please select a category';
                        } else {
                            values.category = categoryValue;
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
                            {errors.title && ToastAndroid.show(errors.title, ToastAndroid.SHORT)}
                            <Text style={styles.label}>Select Category</Text>
                            <TouchableOpacity 
                                style={styles.input} 
                                onPress={() => setIsModalVisible(true)}
                            >
                                <Text style={styles.categoryText}>
                                    {categoryValue || "Select a Category"}
                                </Text>
                            </TouchableOpacity>
                            <TextInput
                                multiline
                                style={[styles.input, styles.textArea]}
                                placeholder="Your notes here..."
                                value={values.text}
                                onChangeText={handleChange('text')}
                                onBlur={handleBlur('text')}
                            />
                            {errors.text && ToastAndroid.show(errors.text, ToastAndroid.SHORT)}
                            <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
                                <Text style={styles.add}>+</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Formik>
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
                            <TouchableOpacity 
                                style={styles.closeButton} 
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(129, 104, 157, 0.3)',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    form: {
        flex: 1,
    },
    titleInput: {
        borderBottomWidth: 1,
        borderColor: '#CCC',
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#FFF',
        borderRadius: 8,
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
        height: 600,
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

export default AddNoteScreen;