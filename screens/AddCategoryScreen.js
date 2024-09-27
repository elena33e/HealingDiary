import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ToastAndroid, Modal, FlatList } from 'react-native';
import { db } from '../firebaseConfig';
import { addDoc, collection, getDocs, where, query } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Formik } from 'formik';
import { TextInput } from "react-native-gesture-handler";
import MyButton from '../components/MyButton';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from "firebase/auth";
import { saveToLocal, setupNetworkSyncListener } from '../utilities/DataSyncService'; // Import sync methods
import NetInfo from '@react-native-community/netinfo'; // NetInfo to check online/offline status

const AddCategoryScreen = ({ route, navigation }) => {
    const { parent } = route.params || {};
    const [image, setImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(parent || 'Main Category');
    const [loading, setLoading] = useState(false);
    const storage = getStorage();
    const auth = getAuth();

    useEffect(() => {
        getCategories();
        setupNetworkSyncListener(); // Start syncing when online if there is pending data
    }, []);

    // Fetch categories from Firestore
    const getCategories = async () => {
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
    };

    // Image picker function
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

    // Submit form
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

        setLoading(true);

        try {
            // Upload image to Firebase storage
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

            // Check if user is online or offline
            const netInfo = await NetInfo.fetch();

            if (netInfo.isConnected) {
                // If online, save directly to Firestore
                const docRef = await addDoc(collection(db, 'Categories'), value);
                if (docRef.id) {
                    ToastAndroid.show('Category added successfully', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
                }
            } else {
                // If offline, save to local storage for later sync
                await saveToLocal({ type: 'category', data: value });
                ToastAndroid.show('You are offline. Data will be synced later.', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
            }
        } catch (error) {
            console.error("Error adding category: ", error);
            ToastAndroid.show('Error adding category: ' + error.message, ToastAndroid.LONG, ToastAndroid.BOTTOM);
            // Save to local storage if there's an error
            await saveToLocal({ type: 'category', data: value });
        } finally {
            setLoading(false);
        }
    };

    // Render category item in modal
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
                onSubmit={onSubmitMethod}
                validate={(values) => {
                    const errors = {};
                    if (!values.name) {
                        errors.name = 'You must give the category a name';
                    }
                    return errors;
                }}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
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
                            value={values.name}
                            onChangeText={handleChange('name')}
                            onBlur={handleBlur('name')}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                        <Text style={styles.label}>Choose parent category</Text>

                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setIsModalVisible(true)}
                        >
                            <Text>{selectedCategory}</Text>
                        </TouchableOpacity>

                        <MyButton
                            title="Add category"
                            onPress={handleSubmit}
                            isLoading={loading}
                        />

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

// Styles for the screen
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
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
});

export default AddCategoryScreen;
