import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ToastAndroid, Modal, FlatList } from 'react-native';
import { db } from '../firebaseConfig';
import { addDoc, collection, getDocs, where, query, doc, getDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Formik } from 'formik';
import { TextInput } from "react-native-gesture-handler";
import MyButton from '../components/MyButton';  // Ensure correct path
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from "firebase/auth";

const AddCategoryScreen = ({ route, navigation }) => {
    const { parent } = route.params || {}; 
    const [image, setImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(parent || 'Main Category');
    const [loading, setLoading] = useState(false); // Add loading state
    const storage = getStorage();
    const auth = getAuth();

    useEffect(() => {
        getCategories();
    }, []);

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
                    categoriesList.push({ id: doc.id, ...doc.data() });
                });
                setCategories(categoriesList);
            } else {
                console.error("No user logged in");
            }
        } catch (error) {
            console.error("Error fetching categories: ", error);
        }
    };

    useEffect(() => {
        if (parent) {
            // Fetch the category name using the category ID if necessary
            const fetchCategoryName = async () => {
                try {
                    const user = auth.currentUser;
                    if (user) {
                        const categoryDoc = doc(db, 'Categories', parent);
                        const categorySnapshot = await getDoc(categoryDoc);
                        if (categorySnapshot.exists()) {
                            setSelectedCategory(categorySnapshot.data().name);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching category name: ", error);
                }
            };
            fetchCategoryName();
        }
    }, [parent]);


    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const onSubmitMethod = async (value) => {
        if (!image) {
            ToastAndroid.show('Please select an image', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            console.error("No user logged in");
            return;
        }

        setLoading(true); // Set loading to true when submission starts

        try {
            const resp = await fetch(image);
            const blob = await resp.blob();
            const storageRef = ref(storage, 'catImages/' + Date.now() + '.jpg');
            await uploadBytes(storageRef, blob);
            const downloadUrl = await getDownloadURL(storageRef);
            value.image = downloadUrl;
            value.user_id = user.uid;

            if (value.parent === "Main Category") {
                value.parent = "0";
            }

            const docRef = await addDoc(collection(db, 'Categories'), value);
            if (docRef.id) {
                ToastAndroid.show('Category added successfully', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
            }
        } catch (error) {
            console.error("Error adding category: ", error);
            ToastAndroid.show('Error adding category: ' + error.message, ToastAndroid.LONG, ToastAndroid.BOTTOM);
        } finally {
            setLoading(false); // Set loading to false when submission completes
        }
    };

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => {
                setSelectedCategory(item.name);
                setIsModalVisible(false);
            }}
        >
            <Text style={styles.categoryText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Formik
                initialValues={{ name: '', parent: selectedCategory, image: '' }}
                onSubmit={value => {
                    if (value.parent === "Main Category") {
                        value.parent = "0";
                    }
                    onSubmitMethod(value);
                }}
                validate={(values) => {
                    const errors = {};
                    if (!values.name) {
                        ToastAndroid.show('You must give the category a name', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
                        errors.name = 'You must give the category a name';
                    }
                    return errors;
                }}
            >
                {({ handleChange, handleBlur, handleSubmit, values, setFieldValue, errors }) => (
                    <View>
                        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.image} />
                            ) : (
                                <Image source={require('../assets/placeholder.png')} style={styles.image} />
                            )}
                        </TouchableOpacity>

                        <TextInput
                            style={styles.input}
                            placeholder="Category title"
                            value={values?.name}
                            onChangeText={handleChange('name')}
                        />

                        <Text style={styles.label}>Choose parent category</Text>

                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setIsModalVisible(true)}
                        >
                            <Text>{selectedCategory}</Text>
                        </TouchableOpacity>

                        {/* MyButton with loading indicator */}
                        <MyButton
                            title="Add category"
                            onPress={handleSubmit}
                            isLoading={loading} // Pass the loading state to the button
                        />

                        {/* Modal for category selection */}
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={isModalVisible}
                            onRequestClose={() => setIsModalVisible(false)}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <FlatList
                                        data={[{ id: '0', name: 'Main Category' }, ...categories]}
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
                    </View>
                )}
            </Formik>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        padding: 30,
        borderRadius: 5,
        flex: 1,
        justifyContent: 'center',
        backgroundColor: "white",
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#D6BBFC',
        backgroundColor: '#E8DFFC',
        borderRadius: 25,
        padding: 15,
        paddingHorizontal: 20,
        fontSize: 16,
        marginBottom: 20,
        marginTop: 20,
    },
    label: {
        marginTop: 20,
        fontSize: 16,
        color: 'black',
    },
    image: {
        borderRadius: 20,
        width: 150,
        height: 150,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
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

export default AddCategoryScreen;
