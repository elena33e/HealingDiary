import React, { useEffect, useState, useRef} from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, ToastAndroid,
    TextInput, KeyboardAvoidingView, Platform, ScrollView,
    FlatList, Modal
} from 'react-native';
import { db } from '../firebaseConfig';
import { addDoc, collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Formik } from 'formik';
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { actions } from 'react-native-pell-rich-editor/src/const';
import ColorPicker from 'react-native-wheel-color-picker';
import MyButton from "../components/MyButton";

const AddNoteScreen = ({ route, navigation }) => {
    const { category } = route.params || {};
    const [categories, setCategories] = useState([]);
    const [categoryValue, setCategoryValue] = useState(category ? category.name : ""); // Use category.name
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false); // Track if form has been submitted
    const auth = getAuth();
    const richText = useRef();
    const [showColorPicker, setShowColorPicker] = useState(false);


    const handleColorSelect = (color) => {
        richText.current?.setForeColor(color);
        setShowColorPicker(false);
      };

    const customActions = [
        actions.setBold,
        actions.setItalic,
        actions.setUnderline,
        actions.setStrikethrough,
        actions.heading1,
        actions.heading2,
        actions.heading3,
        actions.heading4,
        actions.alignLeft,
        actions.alignCenter,
        actions.alignRight,
        actions.alignFull,
        actions.insertBulletsList,
        actions.insertOrderedList,
        actions.indent,
        actions.outdent,
        actions.insertLink,
        {
          iconName: 'format-color-text',
          title: 'Color',
          onPress: () => setShowColorPicker(true),
        },
        {
          iconName: 'format-size',
          title: 'Font Size',
          onPress: () => {
            // You can implement a custom font size picker here
            const fontSize = prompt('Enter font size (px):');
            if (fontSize) {
              richText.current?.setFontSize(parseInt(fontSize));
            }
          },
        },
      ];

    //Fetching categy list
    useEffect(() => {
        getCategories();
    }, []);

    useEffect(() => {
        if (category) {
            // Fetch the category name using the category ID if necessary
            const fetchCategoryName = async () => {
                try {
                    const user = auth.currentUser;
                    if (user) {
                        const categoryDoc = doc(db, 'Categories', category);
                        const categorySnapshot = await getDoc(categoryDoc);
                        if (categorySnapshot.exists()) {
                            setCategoryValue(categorySnapshot.data().name);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching category name: ", error);
                }
            };
            fetchCategoryName();
        }
    }, [category]);

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
                    categoriesList.push({ 
                        id: doc.id, 
                        name: doc.data().name }); // Get id and data
                });

                setCategories(categoriesList);
            }
        } catch (error) {
            console.error("Error fetching categories: ", error);
        }
    };

    useEffect(() => {
        if (category && category.name) {
            // Set the category value to the name if it exists
            setCategoryValue(category.name);
        } else {
            // Set it to default if no category is provided
            setCategoryValue('Select a Category');
        }
    }, [category]);

    const onSubmitMethod = async (values, { resetForm }) => {
        setFormSubmitted(true);
        try {
            const user = auth.currentUser;
            if (user) {
                const noteData = {
                    ...values,
                    category: values.category,
                    text: values.formattedText, // Use formattedText as the value for the text field
                    user_id: user.uid,
                };
                const docRef = await addDoc(collection(db, 'Notes'), noteData);
                if (docRef.id) {
                    ToastAndroid.show('Note saved!', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
                    resetForm();
                    setCategoryValue(category ? category.name : ""); // Reset with category name
                    setFormSubmitted(false);
                }
            } else {
                ToastAndroid.show('User not authenticated', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
            }
        } catch (error) {
            ToastAndroid.show('Error saving note', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        }
    };

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => {
                setCategoryValue(item.name); // Set category name when selected
                setIsModalVisible(false);
            }}
            key={item.id || item.name}
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
                    initialValues={{ title: '', category: categoryValue || '', formattedText: ''}}
                    onSubmit={(values, actions) => onSubmitMethod(values, actions)}
                    validate={(values) => {
                        const errors = {};
                        if (!values.title) {
                            errors.title = 'You must give the note a title';
                        }
                        if (!categoryValue) {
                            errors.category = 'Please select a category';
                        } else {
                            values.category = categoryValue; // Ensure categoryValue is set correctly
                        }
                        if (!values.formattedText) {
                            errors.formattedText = 'Please add some text to the note';
                        }
                        return errors;
                    }}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, setFieldValue }) => (
                        <View style={{ flex: 1 }}>
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
                                        {categoryValue || "Select a Category"}
                                    </Text>
                                </TouchableOpacity>
                                {formSubmitted && errors.category && (
                                    <Text style={styles.errorText}>{errors.category}</Text>
                                )}
                                <RichToolbar
                                              editor={richText}
                                              actions={customActions}
                                              iconMap={{ [actions.heading1]: ({ tintColor }) => (<Text style={[styles.tib, { color: tintColor }]}>H1</Text>),
                                                         [actions.heading2]: ({ tintColor }) => (<Text style={[styles.tib, { color: tintColor }]}>H2</Text>),
                                                         [actions.heading3]: ({ tintColor }) => (<Text style={[styles.tib, { color: tintColor }]}>H3</Text>),
                                                         [actions.heading4]: ({ tintColor }) => (<Text style={[styles.tib, { color: tintColor }]}>H4</Text>) }}
                                              style={styles.richToolbar}
                                            />
                                            <RichEditor
                                              ref={richText}
                                              onChange={(text) => setFieldValue('formattedText', text)}
                                              initialContentHTML={values.formattedText}
                                              style={styles.richEditor}
                                            />
                                            {showColorPicker && (
                                              <ColorPicker
                                                onColorChange={handleColorSelect}
                                                style={{ flex: 1 }}
                                              />
                                            )}
                                {formSubmitted && errors.formattedText && (
                                    <Text style={styles.errorText}>{errors.formattedText}</Text>
                                )}
                            </View>
                            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
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
                            <MyButton
                                title='Close'
                                onPress={() => setIsModalVisible(false)}
                            />
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
        backgroundColor: 'white',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        paddingBottom: 70, // Add space for the button
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
        paddingHorizontal: 15,
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
        right: 20,  // Fix the button to the bottom right of the form
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
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    tib: {
        textAlign: 'center',
        color: '#515156',
      },
});

export default AddNoteScreen;
