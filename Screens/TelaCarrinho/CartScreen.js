import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { CartContext } from './CartContext';
import CustomAlert from '../../CustomAlert'; 

const CartScreen = ({ navigation }) => {
  const { cartItems, setCartItems } = useContext(CartContext);
  const [items, setItems] = useState(cartItems);
  const [totalPrice, setTotalPrice] = useState(0);
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [singleConfirm, setSingleConfirm] = useState(false);  

  useEffect(() => {
    setItems(cartItems);
    calculateTotalPrice();
  }, []); 

  useEffect(() => {
    setCartItems(items);
    calculateTotalPrice();
  }, [items]); 

  const calculateTotalPrice = () => {
    let total = 0;
    items.forEach(item => {
      const price = typeof item.price === 'string' ? item.price : item.price.toString();
      if (price) {
        total += parseFloat(price.replace('R$', '').replace(',', '.')) * item.quantity;
      } else {
        console.warn(`O preço do item com ID ${item.id} é inválido: ${price}`);
      }
    });
    setTotalPrice(total.toFixed(2));
  };

  const decreaseQuantity = (itemId) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const increaseQuantity = (itemId) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const removeItem = (itemId) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}> 
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>R$ {parseFloat(item.price).toFixed(2)}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => decreaseQuantity(item.id)} style={[styles.quantityButton, { backgroundColor: '#e91e63' }]}>
          <Icon name="minus" size={14} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.itemQuantity}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => increaseQuantity(item.id)} style={[styles.quantityButton, { backgroundColor: '#1e88e5' }]}>
          <Icon name="plus" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeButton}>
          <Icon name="times" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const proceedToPayment = () => {
    if (items.length === 0) {
      setAlertMessage('Adicione itens ao carrinho antes de prosseguir.');
      setShowAlert(true);
      setSingleConfirm(true);  
      return;
    }
    navigation.navigate('Payment', { cartItems: items, totalPrice, message });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Carrinho</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="shopping-cart" size={30} color="#fff" />
        </TouchableOpacity> 
      </View>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: R${totalPrice}</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Caso necessário, deixe uma mensagem ao restaurante!"
          value={message}
          onChangeText={setMessage}
          multiline={true}
          numberOfLines={4}
        />
        <TouchableOpacity onPress={proceedToPayment}>
          <Text style={styles.proceedButton}>Prosseguir Pedido</Text>
        </TouchableOpacity>
      </View>

      {showAlert && (
        <CustomAlert
          visible={showAlert}
          message={alertMessage}
          onConfirm={() => {
            setShowAlert(false); 
            navigation.navigate('Menu'); 
          }}
          onCancel={() => setAlertVisible(false)}
          singleConfirm={singleConfirm}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  itemContainer: {
    backgroundColor: '#232740',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 80,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    color: '#fff',
    fontSize: 14,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 10,
  },
  quantityButton: {
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  removeButton: {
    backgroundColor: '#e91e63',
    borderRadius: 5,
    padding: 5,
    marginLeft: 10,
  },
  totalContainer: {
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#fff',
  },
  totalText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  messageInput: {
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  proceedButton: {
    backgroundColor: '#e91e63',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CartScreen;
