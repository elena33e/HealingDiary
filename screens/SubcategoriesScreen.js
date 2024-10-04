import React, { useEffect, useState, useCallback, useContext } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, doc, deleteDoc, updateDoc } from "firebase/firestore";
import CategoryCard from '../components/CategoryCard';
import NoteCard from '../components/NoteCard';  
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAuth } from "firebase/auth";
import { ThemeContext } from '../utilities/ThemeContext';

const SubcategoriesScreen = ({ route, navigation }) => {
    const { parent } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [notes, setNotes] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(parent || '');
    const auth = getAuth();
    const { theme } = useContext(ThemeContext);

    useFocusEffect(
        useCallback(() => {
            fetchCategoriesAndNotes();
        }, [parent])
    );

    const fetchCategoriesAndNotes = async () => {
        if (!parent) {
            console.error("Parent ID is undefined");
            setLoading(false);
            return;
        }

        try {
            const user = auth.currentUser;
            if (user) {
                const categoriesQuery = query(
                    collection(db, 'Categories'),
                    where('parent', '==', parent),
                    where('user_id', '==', user.uid)
                );

                const categoriesSnapshot = await getDocs(categoriesQuery);
                const categoriesList = [];
                categoriesSnapshot.forEach((doc) => {
                    categoriesList.push({
                        ...doc.data(),
                        key: doc.id,
                    });
                });

                const notesQuery = query(
                    collection(db, 'Notes'),
                    where('category', '==', parent),
                    where('user_id', '==', user.uid)
                );

                const notesSnapshot = await getDocs(notesQuery);
                const notesList = [];
                notesSnapshot.forEach((doc) => {
                    notesList.push({
                        ...doc.data(),
                        key: doc.id,
                    });
                });

                setCategories(categoriesList);
                setNotes(notesList);
            } else {
                console.error("No user logged in");
            }
        } catch (error) {
            console.error("Error fetching categories and notes: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryPress = (category) => {
        setCurrentCategory(category);
        navigation.navigate('SubcategoriesScreen', { parent: category });
    };

    const removeCategory = (categoryId) => {
        setCategories(categories.filter(category => category.key !== categoryId));
    };

    const handleDeleteNote = async (noteId) => {
        try {
            const noteRef = doc(db, 'Notes', noteId);
            await deleteDoc(noteRef);
            setNotes(notes.filter(note => note.key !== noteId));
        } catch (error) {
            console.error("Error deleting note:", error);
            Alert.alert("Error", "There was a problem deleting the note.");
        }
    };

    const handleFavoriteToggle = async (noteKey, isCurrentlyFavorite) => {
        try {
            const noteRef = doc(db, 'Notes', noteKey);
            await updateDoc(noteRef, {
                isFavourite: !isCurrentlyFavorite
            });
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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {categories.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Subcategories</Text>
                        <View style={styles.sectionContainer}>
                            {categories.map((item, index) => (
                                <View
                                    key={item.key}
                                    style={[styles.categoryWrapper, (index % 2 !== 0) && { marginRight: 0 }]}
                                >
                                    <CategoryCard
                                        category={item.name}
                                        image={{ uri: item.image }}
                                        itemKey={item.key}
                                        onPress={() => handleCategoryPress(item.name)}
                                        onDelete={removeCategory}
                                        theme={theme} 
                                    />
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {notes.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Notes</Text>
                        <View style={styles.notesContainer}>
                            {notes.map(item => (
                                <NoteCard
                                    key={item.key}
                                    title={item.title}
                                    text={item.text}
                                    itemKey={item.key}
                                    isFavorite={item.isFavourite}
                                    onPress={() => navigation.navigate('NoteDetailsScreen', { note: item })}
                                    onFavorite={() => handleFavoriteToggle(item.key, item.isFavourite)} 
                                    onDelete={handleDeleteNote}
                                    theme={theme} 
                                />
                            ))}
                        </View>
                    </>
                )}

                {categories.length === 0 && notes.length === 0 && (
                    <View style={styles.emptyMessageContainer}>
                        <Text style={[styles.emptyMessage, { color: theme.text }]}>
                            It seems like there is nothing here yet... Start adding categories and notes!
                        </Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity 
                    style={[styles.addButton, { backgroundColor: theme.buttonBackground }]}
                    onPress={() => navigation.navigate('AddCategoryScreen', { parent: currentCategory })}
                >
                    <Icon name="add" size={24} color={theme.buttonText} />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.addButton, { backgroundColor: theme.buttonBackground }]}
                    onPress={() => navigation.navigate('AddNoteScreen', { category: currentCategory })}
                >
                    <Icon name="note-add" size={24} color={theme.buttonText}/>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        paddingLeft: 10,
    },
    sectionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryWrapper: {
        width: '48%',
        marginBottom: 15,
        marginRight: '4%',
    },
    notesContainer: {
        flexDirection: 'column',
    },
    buttonsContainer: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButton: {
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
        elevation: 5,
        marginHorizontal: 10,
    },
    emptyMessageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        margin: 15,
    },
    emptyMessage: {
        fontSize: 16,
    },
});

export default SubcategoriesScreen;
