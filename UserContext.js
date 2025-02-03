import React, { createContext, useState, useEffect } from 'react';
import { auth, firestore } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const defaultProfilePicture = 'https://i.pinimg.com/236x/a8/da/22/a8da222be70a71e7858bf752065d5cc3.jpg';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            fullName: userData.fullName || '',  
            cpf: userData.cpf || '',            
            isEmployee: userData.isEmployee || false, 
            profilePicture: userData.profilePicture || defaultProfilePicture, 
          });
        } else {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            fullName: currentUser.displayName || '',
            cpf: '',
            isEmployee: false,
            profilePicture: defaultProfilePicture,
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
