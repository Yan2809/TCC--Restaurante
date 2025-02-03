import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "SUACONFIG",
    authDomain: "SUACONFIG",
    projectId: "SUACONFIG",
    storageBucket: "SUACONFIG",
    messagingSenderId: "SUACONFIG",
    appId: "SUACONFIG",
    measurementId: "SUACONFIG"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const firestore = getFirestore(app);
const storage = getStorage(app); 

export { auth, firestore, storage }; 