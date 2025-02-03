import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { UserContext } from '../../UserContext';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, firestore } from '../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomAlert from '../../CustomAlert'; 

const PerfilScreen = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [singleConfirm, setSingleConfirm] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setAlertMessage('Precisamos de acesso à sua galeria para alterar a foto de perfil.');
      setAlertVisible(true);
      setSingleConfirm(true);
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      setLoading(true);
      const response = await fetch(uri);
      const blob = await response.blob();

      const storage = getStorage();
      const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);

      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, { profilePicture: downloadURL });

      await updateProfile(auth.currentUser, { photoURL: downloadURL });

      setUser((prevUser) => ({
        ...prevUser,
        photo: downloadURL,
      }));

      setAlertMessage('Foto de perfil atualizada com sucesso!');
      setAlertVisible(true);
      setSingleConfirm(true);
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      setAlertMessage('Falha ao fazer upload da imagem.');
      setAlertVisible(true);
      setSingleConfirm(true);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      setAlertMessage('Um email para redefinição de senha foi enviado.');
      setAlertVisible(true);
      setSingleConfirm(true);
    } catch (error) {
      console.error('Erro ao enviar email de redefinição de senha:', error);
      setAlertMessage('Não foi possível enviar o email de redefinição de senha.');
      setAlertVisible(true);
      setSingleConfirm(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="bars" size={30} color="#fff" />
        </TouchableOpacity>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.profileContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <Image
              source={{ uri: user?.photo || 'https://i.pinimg.com/236x/a8/da/22/a8da222be70a71e7858bf752065d5cc3.jpg' }}
              style={styles.profilePicture}
            />
          )}

          <TouchableOpacity style={styles.editIcon} onPress={pickImage} disabled={loading}>
            <Icon name="pencil" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{user?.fullName || 'Nome do Usuário'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'Email do Usuário'}</Text>

        <TouchableOpacity style={styles.resetButton} onPress={resetPassword}>
          <Text style={styles.resetButtonText}>Redefinir Senha</Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onConfirm={() => setAlertVisible(false)}
        onCancel={() => setAlertVisible(false)}
        singleConfirm={singleConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
    paddingTop: 10,
    marginTop: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderColor: '#fff',
    borderWidth: 2,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: -10,
    backgroundColor: '#e94560',
    padding: 8,
    borderRadius: 20,
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 5,
  },
  resetButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PerfilScreen;
