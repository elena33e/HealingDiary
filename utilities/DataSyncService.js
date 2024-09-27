import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Firebase config

const STORAGE_KEY = 'pendingData'; // Store all pending data operations

// Save data to AsyncStorage for offline use
export const saveData = async (key, data) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving data to local storage:', error);
    }
};

// Fetch data from AsyncStorage
export const fetchLocalData = async (key) => {
    try {
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error fetching local data:', error);
        return null;
    }
};

// Fetch data from Firestore
export const fetchFirestoreData = async (collectionName) => {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const dataList = [];
        querySnapshot.forEach((doc) => {
            dataList.push({ id: doc.id, ...doc.data() });
        });
        return dataList;
    } catch (error) {
        console.error('Error fetching data from Firestore:', error);
        return [];
    }
};

// Fetch data considering network availability
export const fetchData = async (collectionName, key) => {
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
        const data = await fetchFirestoreData(collectionName);
        await saveData(key, data); // Sync Firestore data to local storage
        return data;
    } else {
        return await fetchLocalData(key); // Use locally stored data
    }
};

// Save data to Firestore (used when online)
export const saveToFirestore = async (collectionName, data) => {
    try {
        await addDoc(collection(db, collectionName), data);
    } catch (error) {
        console.error('Error saving to Firestore:', error);
    }
};

// Update a document in Firestore
export const updateFirestoreDoc = async (collectionName, docId, data) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error('Error updating Firestore doc:', error);
    }
};

// Save data to local storage for syncing when online
export const saveToLocal = async (operation) => {
    try {
        const pendingData = await AsyncStorage.getItem(STORAGE_KEY);
        const parsedData = pendingData ? JSON.parse(pendingData) : [];

        // Push new operation (e.g., category add) into the pending data queue
        parsedData.push(operation);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));

        console.log('Data saved locally for future syncing.');
    } catch (error) {
        console.error('Error saving data locally:', error);
    }
};

// Sync pending data to Firestore when online
export const syncPendingData = async () => {
    try {
        const pendingData = await AsyncStorage.getItem(STORAGE_KEY);
        const parsedData = pendingData ? JSON.parse(pendingData) : [];

        // If there's any pending data, loop through and try to sync it with Firestore
        for (const item of parsedData) {
            if (item.type === 'category') {
                await saveToFirestore('Categories', item.data);
                console.log('Synced category to Firestore:', item.data);
            }
            // Add other cases for different types of data if needed (e.g., 'products')
        }

        // Once synced, clear the local storage for pending operations
        await AsyncStorage.removeItem(STORAGE_KEY);
        console.log('Pending data cleared after sync.');
    } catch (error) {
        console.error('Error syncing pending data:', error);
    }
};

// Sync data when the network status changes to online
export const setupNetworkSyncListener = () => {
    NetInfo.addEventListener((state) => {
        if (state.isConnected) {
            console.log('Network is back online, syncing pending data...');
            syncPendingData();
        }
    });
};
