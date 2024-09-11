import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import CategoryCard from '../components/CategoryCard';
import { db } from '../firebaseConfig';
import { collection, getDocs, where, query } from "firebase/firestore";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAuth } from "firebase/auth";  // Import Firebase Auth

const CategoriesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const auth = getAuth(); // Get the auth object

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const user = auth.currentUser; // Get the current logged-in user
      if (user) {
        console.log("Starting to fetch categories...");

        // Create a query to fetch categories where parent = 0 and user_id matches the current user
        const categoriesQuery = query(
          collection(db, 'Categories'),
          where('parent', '==', "0"),
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
  };

  const handleCategoryPress = (categoryId) => {
    // You can navigate to a detailed view or perform another action
    navigation.navigate('SubcategoriesScreen', { parent: categoryId });
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
            onPress={handleCategoryPress} 
            onDelete={removeCategory}
          />
        )}
        keyExtractor={(item) => item.key}
        numColumns={2}  // Display 2 items per row
        columnWrapperStyle={styles.row} // Add some spacing between rows
        contentContainerStyle={styles.scrollViewContent} // Use this for padding/margin
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AddCategory')}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',  // Distribute items evenly in the row
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
    elevation: 5, // for Android shadow
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  }
});

export default CategoriesScreen;
