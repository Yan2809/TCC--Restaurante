import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator, Modal } from 'react-native';
import { firestore, auth } from '../../firebaseConfig';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import CustomAlert from '../../CustomAlert'; 


const exibirSucesso = (titulo, mensagem) => {
  console.log(`${titulo}: ${mensagem}`);
};

const exibirErro = (titulo, mensagem) => {
  console.log(`${titulo}: ${mensagem}`);
};

const DishManagementScreen = ({ navigation }) => {
  const [singleConfirm, setSingleConfirm] = useState(false);
  const [dishName, setDishName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Pratos');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);  
  const [alertMessage, setAlertMessage] = useState('');  
  const [dishToDelete, setDishToDelete] = useState(null);  

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'products'), (snapshot) => {
      const fetchedDishes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDishes(fetchedDishes);
    });
    return unsubscribe;
  }, []);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      exibirErro('Permissão necessária', 'Precisamos de acesso à sua galeria para adicionar imagens.');
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
    }
  };

  const uploadImage = async (uri) => {
    try {
      setLoading(true);
      const response = await fetch(uri);
      const blob = await response.blob();

      const storage = getStorage();
      const storageRef = ref(storage, `dishImages/${auth.currentUser.uid}/${Date.now()}`);

      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      exibirErro('Erro', 'Falha ao fazer upload da imagem.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDish = async () => {
    if (!dishName || !price || !description || !selectedImage) {
      setAlertMessage('Por favor, preencha todos os campos e selecione uma imagem.');
      setAlertVisible(true);
      setSingleConfirm(true);
      return;
    }

    let downloadURL = editingDish?.imageUrl;

    if (selectedImage && (!editingDish || selectedImage !== editingDish.imageUrl)) {
      downloadURL = await uploadImage(selectedImage);
      if (!downloadURL) return;
    }

    try {
      if (editingDish) {
        await updateDoc(doc(firestore, 'products', editingDish.id), {
          name: dishName,
          price: parseFloat(price.replace(',', '.')),
          category: category,
          description: description,
          imageUrl: downloadURL,
        });
        exibirSucesso('Sucesso', 'Prato atualizado com sucesso!');
      } else {
        await addDoc(collection(firestore, 'products'), {
          name: dishName,
          price: parseFloat(price.replace(',', '.')),
          category: category,
          description: description,
          imageUrl: downloadURL,
        });
        exibirSucesso('Sucesso', 'Prato adicionado com sucesso!');
      }

      resetForm();
      setModalVisible(false);
    } catch (error) {
      console.error('Erro ao salvar prato:', error);
      exibirErro('Erro', 'Falha ao salvar prato.');
    }
  };


  const resetForm = () => {
    setDishName('');
    setPrice('');
    setDescription('');
    setCategory('Pratos');
    setSelectedImage(null);
    setEditingDish(null);
  };

  const confirmDeleteDish = (id) => {
    setDishToDelete(id); 
    setAlertMessage('Tem certeza que deseja excluir este prato?');
    setAlertVisible(true); 
    setSingleConfirm(false);
  };

  const deleteDish = async () => {
    if (!dishToDelete) return;

    try {
      await deleteDoc(doc(firestore, 'products', dishToDelete));
      exibirSucesso('Sucesso', 'Prato removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover prato:', error);
      exibirErro('Erro', 'Falha ao remover prato.');
    } finally {
      setAlertVisible(false); 
      setSingleConfirm(true);
      setDishToDelete(null); 
    }
  };

  const editDish = (dish) => {
    setEditingDish(dish);
    setDishName(dish.name);
    setPrice(dish.price.toString().replace('.', ','));
    setDescription(dish.description);
    setCategory(dish.category);
    setSelectedImage(dish.imageUrl);
    setModalVisible(true);
  };

  const formatCurrency = (value) => {
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = (Number(numericValue) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    setPrice(formattedValue.replace('R$', '').trim());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.drawerButton}>
          <Icon name="bars" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Pratos</Text>
      </View>

      <FlatList
        data={dishes}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.dishImage} />
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>R$ {item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => editDish(item)} style={styles.editButton}>
                <Icon name="edit" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDeleteDish(item.id)} style={styles.deleteButton}>
                <Icon name="trash" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      <TouchableOpacity style={styles.floatingButton} onPress={() => setModalVisible(true)}>
        <Icon name="plus" size={20} color="#fff" />
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Nome do Prato"
              value={dishName}
              onChangeText={setDishName}
              style={styles.input}
              placeholderTextColor="#aaa"
            />
            <TextInput
              placeholder="Preço"
              value={`R$ ${price}`}
              onChangeText={formatCurrency}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor="#aaa"
            />
            <TextInput
              placeholder="Descrição"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              placeholderTextColor="#aaa"
            />

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={styles.picker}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="Pratos" value="Pratos" />
                <Picker.Item label="Bebidas" value="Bebidas" />
              </Picker>
            </View>

            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              ) : (
                <Text style={styles.imagePickerText}>Escolher Imagem</Text>
              )}
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color="#fff" />}

            <TouchableOpacity onPress={handleSaveDish} style={styles.button}>
              <Text style={styles.buttonText}>{editingDish ? 'Atualizar Prato' : 'Adicionar Prato'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { resetForm(); setModalVisible(false); }} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onConfirm={() => {
          setAlertVisible(false);
          if (!singleConfirm) {
            deleteDish(); 
          }
        }}
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 40,
  },
  drawerButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#2b2b40',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  dishImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemPrice: {
    fontSize: 16,
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    marginRight: 15,
  },
  deleteButton: {},
  floatingButton: {
    backgroundColor: '#e94560',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    backgroundColor: '#2b2b40',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    color: '#fff',
  },
  pickerContainer: {
    backgroundColor: '#2b2b40',
    borderRadius: 8,
    marginBottom: 15,
  },
  picker: {
    color: '#fff',
  },
  imagePicker: {
    backgroundColor: '#2b2b40',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#fff',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#e94560',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
  },
});

export default DishManagementScreen;
