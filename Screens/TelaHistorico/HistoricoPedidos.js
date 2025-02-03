import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { collection, onSnapshot, query, orderBy, where, updateDoc, doc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import { firestore } from '../../firebaseConfig';
import { UserContext } from '../../UserContext';
import CustomAlert from '../../CustomAlert'; 

const MeuHistorico = ({ navigation }) => {  
  const [orders, setOrders] = useState([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState([]);
  const { user } = useContext(UserContext);
  
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  const defaultUserPhoto = 'https://i.pinimg.com/236x/a8/da/22/a8da222be70a71e7858bf752065d5cc3.jpg'; 

  useEffect(() => {
    if (user?.uid) {
      const q = query(
        collection(firestore, 'orders'),
        where('userId', '==', user.uid),  
        orderBy('orderTime', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const toggleExpandOrder = (orderId) => {
    if (expandedOrderIds.includes(orderId)) {
      setExpandedOrderIds(expandedOrderIds.filter(id => id !== orderId));
    } else {
      setExpandedOrderIds([...expandedOrderIds, orderId]);
    }
  };

  const cancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setIsAlertVisible(true);
  };

  const handleCancelOrder = async () => {
    if (selectedOrderId) {
      const orderRef = doc(firestore, 'orders', selectedOrderId);
      await updateDoc(orderRef, {
        status: 'Cancelado'
      });
      setIsAlertVisible(false); 
    }
  };

  const renderStatusDot = (status) => {
    let backgroundColor;
    switch (status) {
      case 'Pendente':
        backgroundColor = '#FFA500'; 
        break;
      case 'Entregue':
        backgroundColor = '#00BFFF'; 
        break;
      case 'Pronto':
        backgroundColor = '#00FF00'; 
        break;
      case 'Cancelado':
        backgroundColor = '#FF0000'; 
        break;
      default:
        return null;
    }
    return <View style={[styles.statusDot, { backgroundColor }]} />;
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
            {renderStatusDot(item.status)}
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
          <Text style={styles.detailsText}>Whatsapp: {item.phone}</Text>
          <Text style={styles.detailsText}>Mensagem: {item.message || 'Nenhuma mensagem deixada.'}</Text>
          <Text style={styles.detailsText}>Total: R${item.totalPrice}</Text>
          
          {/* Botão de cancelar pedido, visível apenas se o status for "Pendente" */}
          {item.status === 'Pendente' && (
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => cancelOrder(item.id)}
            >
              <Text style={styles.cancelButtonText}>Cancelar Pedido</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
      />
      <CustomAlert 
        visible={isAlertVisible}
        message="Tem certeza que deseja cancelar este pedido?"
        onConfirm={handleCancelOrder}
        onCancel={() => setIsAlertVisible(false)}
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
    fontSize: 18,
    marginLeft: 5,
  },
  statusDot: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
  },
  orderDetails: {
    marginTop: 10,
  },
  detailsText: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 2,
  },
  cancelButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MeuHistorico;
