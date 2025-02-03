import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import { firestore } from '../../firebaseConfig';
import { UserContext } from '../../UserContext';
import CustomAlert from '../../CustomAlert';

const OrderListScreen = ({ navigation }) => {  
  const [orders, setOrders] = useState([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState([]);
  const { user } = useContext(UserContext);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  
  const defaultUserPhoto = 'https://i.pinimg.com/236x/a8/da/22/a8da222be70a71e7858bf752065d5cc3.jpg'; 

  useEffect(() => {
    const q = query(collection(firestore, 'orders'), orderBy('orderTime', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, []);

  const toggleExpandOrder = (orderId) => {
    if (expandedOrderIds.includes(orderId)) {
      setExpandedOrderIds(expandedOrderIds.filter(id => id !== orderId));
    } else {
      setExpandedOrderIds([...expandedOrderIds, orderId]);
    }
  };

  const showCustomAlert = (message, onConfirm) => {
    setAlertMessage(message);
    setConfirmAction(() => onConfirm);
    setAlertVisible(true);
  };

  const confirmAndUpdateOrderStatus = (orderId, newStatus) => {
    showCustomAlert(
      `Tem certeza de que deseja definir o status como ${newStatus}?`,
      () => updateOrderStatus(orderId, newStatus)
    );
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(firestore, 'orders', orderId), { status: newStatus });
    } catch (error) {
      showCustomAlert('Não foi possível atualizar o status do pedido.', () => {});
      console.error('Erro ao atualizar status do pedido:', error);
    }
  };
  

  const renderStatusIcon = (status) => {
    switch(status) {
      case 'Cancelado':
        return <View style={[styles.statusIcon, { backgroundColor: 'red' }]} />;
      case 'Pendente':
        return <View style={[styles.statusIcon, { backgroundColor: 'orange' }]} />;
      case 'Pronto':
        return <View style={[styles.statusIcon, { backgroundColor: '#00FF00' }]} />;
      case 'Entregue':
        return <View style={[styles.statusIcon, { backgroundColor: '#00BFFF' }]} />;
      default:
        return null;
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity onPress={() => toggleExpandOrder(item.id)} style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <Image 
          source={{ uri: item.userPhoto || defaultUserPhoto }} 
          style={styles.userPhoto} 
        />
        <View style={styles.orderInfo}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.orderTime}>{new Date(item.orderTime.toDate()).toLocaleString()}</Text>
          <View style={styles.orderStatusContainer}>
            {renderStatusIcon(item.status)}
            <Text style={styles.orderStatusText}>{item.status}</Text>
          </View>
        </View>
      </View>
      {expandedOrderIds.includes(item.id) && (
        <View style={styles.orderDetails}>
          <Text style={styles.detailsText}>Pedido:</Text>
          {item.cartItems.map((cartItem, index) => (
            <Text key={index} style={styles.detailsText}>
              - {cartItem.name} (x{cartItem.quantity})
            </Text>
          ))}
          
          <Text style={styles.detailsText}>Endereço: {item.address}</Text>
          <Text style={styles.detailsText}>Método de Pagamento: {item.paymentMethod || 'Não especificado'}</Text>
          <Text style={styles.detailsText}>Whatsapp: {item.phone}</Text>
          <Text style={styles.detailsText}>Mensagem: {item.message || 'Nenhuma mensagem deixada.'}</Text>  
          <Text style={styles.detailsText}>Total: R${item.totalPrice}</Text>
          <View style={styles.statusButtonsContainer}>
            <TouchableOpacity onPress={() => confirmAndUpdateOrderStatus(item.id, 'Cancelado')} style={styles.statusButton}>
              <Text style={styles.statusButtonText}>Cancelado</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmAndUpdateOrderStatus(item.id, 'Pendente')} style={styles.statusButton}>
              <Text style={styles.statusButtonText}>Pendente</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmAndUpdateOrderStatus(item.id, 'Pronto')} style={styles.statusButton}>
              <Text style={styles.statusButtonText}>Pronto</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmAndUpdateOrderStatus(item.id, 'Entregue')} style={styles.statusButton}>
              <Text style={styles.statusButtonText}>Entregue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="bars" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pedidos</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
      />

      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onConfirm={() => {
          confirmAction();
          setAlertVisible(false);
        }}
        onCancel={() => setAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  orderItem: {
    backgroundColor: '#232740',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  orderInfo: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderTime: {
    color: '#aaa',
    fontSize: 14,
  },
  orderStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  orderStatusText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  statusIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  orderDetails: {
    marginTop: 10,
  },
  detailsText: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 2,
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statusButton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default OrderListScreen;
