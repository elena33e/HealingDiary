import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from "firebase/firestore";
import CategoryCard from '../components/CategoryCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAuth } from "firebase/auth"; 

const SubcategoriesScreen = ({ route, navigation }) => {
  const { parent } = route.params || {};  // Retrieve parent ID from route params
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const auth = getAuth(); 

  useEffect(() => {
    getCategories();
  }, [parent]);  // Fetch categories whenever parent changes

  const getCategories = async () => {
    if (!parent) {
      console.error("Parent ID is undefined");
      setLoading(false);
      return;
    }


    try {
      const user = auth.currentUser; // Get the current logged-in user
      if (user) {
        console.log("Starting to fetch categories...");

        // Create a query to fetch categories where parent = 0 and user_id matches the current user
        const categoriesQuery = query(
          collection(db, 'Categories'),
          where('parent', '==', parent),
          where('user_id', '==', user.uid)  // Filter categories by user_id
        );

        const querySnapshot = await getDocs(categoriesQuery);
        const categoriesList = [];

        querySnapshot.forEach((doc) => {
          console.log("Document found:", doc.id, doc.data());
          categoriesList.push({
            ...doc.data(),
            key: doc.id,
          });
        });

        setCategories(categoriesList);
      } else {
        console.error("No user logged in");
      }
    } catch (error) {
      console.error("Error fetching categories: ", error);
    } finally {
      setLoading(false);
    }

  }

  const handleCategoryPress = (categoryName) => {
    // Navigate to SubcategoriesScreen with the selected category's ID as the new parent
    navigation.navigate('SubcategoriesScreen', { parent: categoryName });
  };

  const removeCategory = (categoryId) => {
    setCategories(categories.filter(category => category.key !== categoryId));
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <CategoryCard 
            category={item.name}
            image={{ uri: item.image }} 
            itemKey={item.key}
            onPress={() => handleCategoryPress(item.name)} 
            onDelete={removeCategory}
          />
        )}
        keyExtractor={(item) => item.key}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.scrollViewContent}
      />
       <TouchableOpacity 
      style={styles.addButton}
      onPress={() => navigation.navigate('AddCategoryScreen', { parent })}
    >
      <Icon name="add" size={24} color="white" />
    </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  row: {
    justifyContent: 'space-between',  
    marginBottom: 10,
  },
  scrollViewContent: {
    padding: 20,
  },
  addButton: {
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
    elevation: 5, // for Android shadow
  },
  addButtonText: {

  }
});

export default SubcategoriesScreen;