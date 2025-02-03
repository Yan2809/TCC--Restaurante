import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { firestore } from '../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { CartContext } from './CartContext';
import { UserContext } from '../../UserContext';
import CustomAlert from '../../CustomAlert';

const PaymentScreen = ({ navigation, route }) => {
  const { cartItems, totalPrice } = route.params;
  const { setCartItems } = useContext(CartContext);
  const { user } = useContext(UserContext);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [phone, setPhone] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [singleConfirm, setSingleConfirm] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false); 

  const defaultUserPhoto = 'https://i.pinimg.com/236x/a8/da/22/a8da222be70a71e7858bf752065d5cc3.jpg';
  const { message } = route.params;

  const fetchAddressByCep = async (cepValue) => {
    const cepFormatted = cepValue.replace(/\D/g, '');
    if (cepFormatted.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepFormatted}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setStreet(data.logradouro);
          setComplement(data.complemento);
        } else {
          setAlertMessage('CEP não encontrado.');
          setAlertVisible(true);
        }
      } catch (error) {
        setAlertMessage('Erro ao buscar CEP. Tente novamente.');
        setAlertVisible(true);
      }
    }
  };

  const confirmOrder = () => {
    const phonePattern = /^[1-9]{2}[9][0-9]{8}$/; 

    if (!paymentMethod || !deliveryMethod || (deliveryMethod === 'entrega' && (!street || !number || !cep)) || !phone) {
      setAlertMessage('Por favor, preencha todos os campos obrigatórios.');
      setAlertVisible(true);
      setSingleConfirm(true);
      return;
    }

    if (!phonePattern.test(phone)) {
      setAlertMessage('Por favor, insira um número de telefone válido (formato: 11 91234-5678).');
      setAlertVisible(true);
      setSingleConfirm(true);
      return;
    }

    
    setAlertMessage('Deseja finalizar o pedido?');
    setAlertVisible(true);
    setSingleConfirm(false); 
  };

  const sendOrder = async () => {
    const address = `${street}, ${number}, CEP: ${cep}${complement ? `, Complemento: ${complement}` : ''}`;

    try {
      await addDoc(collection(firestore, 'orders'), {
        cartItems,
        totalPrice,
        paymentMethod,
        deliveryMethod,
        address: deliveryMethod === 'entrega' ? address : 'Retirada no Estabelecimento',
        phone,
        orderTime: new Date(),
        status: 'Pendente',
        userName: user?.fullName || 'Usuário Anônimo',
        userPhoto: user?.photo || defaultUserPhoto,
        userId: user?.uid,
        message,
      });

      setCartItems([]); // Limpa o carrinho após o envio

      setOrderCompleted(true);
      setAlertMessage('Pedido finalizado com sucesso! Verifique seu histórico para mais informações.');
      setAlertVisible(true);
      setSingleConfirm(true);
    } catch (error) {
      setAlertMessage('Não foi possível finalizar o pedido.');
      setAlertVisible(true);
      console.error('Erro ao salvar pedido:', error);
    }
  };



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.header}>Finalizar Pedido</Text>
        </View>

        <Text style={styles.totalPrice}>Total: R${totalPrice}</Text>

        <Text style={styles.label}>Forma de Pagamento</Text>
        <TouchableOpacity
          style={[styles.option, paymentMethod === 'Pix' && styles.selectedOption]}
          onPress={() => setPaymentMethod('Pix')}
        >
          <Text style={styles.optionText}>Pix</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, paymentMethod === 'Dinheiro' && styles.selectedOption]}
          onPress={() => setPaymentMethod('Dinheiro')}
        >
          <Text style={styles.optionText}>Dinheiro</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, paymentMethod === 'Cartão' && styles.selectedOption]}
          onPress={() => setPaymentMethod('Cartão')}
        >
          <Text style={styles.optionText}>Cartão</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Método de Entrega</Text>
        <TouchableOpacity
          style={[styles.option, deliveryMethod === 'retirar' && styles.selectedOption]}
          onPress={() => setDeliveryMethod('retirar')}
        >
          <Text style={styles.optionText}>Retirar no Estabelecimento</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, deliveryMethod === 'entrega' && styles.selectedOption]}
          onPress={() => setDeliveryMethod('entrega')}
        >
          <Text style={styles.optionText}>Entregar em casa</Text>
        </TouchableOpacity>

        {deliveryMethod === 'entrega' && (
          <>
            <Text style={styles.label}>CEP</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o CEP"
              value={cep}
              onChangeText={(value) => {
                setCep(value);
                fetchAddressByCep(value);
              }}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Rua</Text>
            <TextInput
              style={styles.input}
              placeholder="Rua"
              value={street}
              editable={false}
            />

            <Text style={styles.label}>Número</Text>
            <TextInput
              style={styles.input}
              placeholder="Número"
              value={number}
              onChangeText={setNumber}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Complemento (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Apartamento, casa, etc."
              value={complement}
              onChangeText={setComplement}
            />
          </>
        )}

        <Text style={styles.label}>Whatsapp</Text>
        <TextInput
          style={styles.input}
          placeholder="11 93456-1234"
          value={phone}
          onChangeText={(text) => {
            const formattedText = text.replace(/[^0-9]/g, '');
            if (formattedText.length <= 11) setPhone(formattedText);
          }}
          keyboardType="phone-pad"
          maxLength={11}
        />

        <TouchableOpacity style={styles.finalizeButton} onPress={confirmOrder}>
          <Text style={styles.finalizeButtonText}>Finalizar Pedido</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onConfirm={() => {
          setAlertVisible(false);
          if (!singleConfirm) {
            sendOrder();
          } else if (orderCompleted) {
            // Se o pedido foi concluido, redireciona para a tela de menu
            setOrderCompleted(false); 
            navigation.navigate('Menu'); 
          }
        }}
        onCancel={() => setAlertVisible(false)}
        singleConfirm={singleConfirm}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 25,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  totalPrice: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 10,
  },
  label: {
    fontSize: 18,
    color: '#fff',
    marginTop: 20,
  },
  option: {
    backgroundColor: '#232740',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  selectedOption: {
    backgroundColor: '#1e88e5',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  finalizeButton: {
    backgroundColor: '#e91e63',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  finalizeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default PaymentScreen;