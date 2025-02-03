import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { UserContext } from './UserContext';
import { firestore } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const CustomDrawerContent = (props) => {
  const { user, setUser } = useContext(UserContext);
  const auth = getAuth();
  
  const defaultProfilePicture = 'https://i.pinimg.com/236x/a8/da/22/a8da222be70a71e7858bf752065d5cc3.jpg';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser((prevUser) => ({
            ...prevUser,
            fullName: currentUser.displayName || userData.fullName || 'Usuário',
            email: currentUser.email || userData.email || '',
            photo: currentUser.photoURL || userData.profilePicture || defaultProfilePicture,
          }));
        }
      } else {
        setUser(null); 
      }
    });

    return () => unsubscribe();
  }, [auth, setUser]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null); 
        props.navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }], 
        });
      })
      .catch((error) => {
        console.error("Erro ao fazer logout: ", error);
      });
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: '#1a1a2e' }}>
      <View style={styles.drawerHeader}>
        <Image 
          source={{ uri: 'https://i.ibb.co/9m0nyVT/correta.png' }} 
          style={styles.logo} 
        />
      </View>
      <View style={styles.drawerContent}>
        <DrawerItemList {...props} />
      </View>
      <View style={styles.drawerFooter}>
        {user ? (
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: user.photo || defaultProfilePicture }} 
              style={styles.userPhoto} 
            />
            <View>
              <Text style={styles.userName}>{user.fullName || 'Usuário'}</Text>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.userName}>Nenhum usuário</Text>
        )}
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
  },
  drawerContent: {
    flex: 1,
    paddingTop: 10,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#fff',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
    maxWidth: 150, // Limite o tamanho do nome para evitar que ele fique muito grande
    flexWrap: 'wrap', // Permite a quebra de linha se o nome for muito longo
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 5,
    alignItems: 'center',
    width: 80, // Tamanho fixo para o botão de logout
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});


export default CustomDrawerContent;
