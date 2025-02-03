import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Image, Text, StatusBar } from 'react-native';
import MenuScreen from './Screens/TelaMenu/MenuScreen';
import OrderListScreen from './Screens/TelasFuncionario/OrderListScreen';
import CartScreen from './Screens/TelaCarrinho/CartScreen';
import PaymentScreen from './Screens/TelaCarrinho/PaymentScreen';
import OrderHistoryScreen from './Screens/TelaHistorico/HistoricoPedidos';
import CustomDrawerContent from './CustomDrawerContent';
import { CartProvider } from './Screens/TelaCarrinho/CartContext';
import Login from './Screens/TelasAutenticacao/Login';
import Cadastro from './Screens/TelasAutenticacao/Cadastro';
import PerfilScreen from './Screens/TelaPerfil/PerfilScreen';
import { UserProvider, UserContext } from './UserContext';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import DishManagementScreen from './Screens/TelasFuncionario/DishManagementScreen';
import SobreScreen from './Screens/TelaInfo/SobreRestaurante';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const MenuStack = ({ navigation }) => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#1a1a2e',
      },
      headerTintColor: '#fff',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ paddingLeft: 10 }}>
          <Image
            source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/menu.png' }}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
      ),
    }}
  >
    <Stack.Screen name="Menu" component={MenuScreen} options={{ title: 'Menu', headerShown: false }} />
    <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Carrinho', headerShown: false }} />
    <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Pagamento', headerShown: false }} />
  </Stack.Navigator>
);

const OrderHistoryStack = ({ navigation }) => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#1a1a2e',
      },
      headerTintColor: '#fff',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ paddingLeft: 10 }}>
          <Image
            source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/menu.png' }}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
      ),
    }}
  >
    <Stack.Screen name="Meu Historico" component={OrderHistoryScreen} options={{ title: 'Meu Histórico' }} />
  </Stack.Navigator>
);

const DrawerNavigator = () => {
  const { user } = useContext(UserContext);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#1a1a2e',
          paddingVertical: 20,
        },
        drawerLabelStyle: {
          color: '#fff',
        },
        headerShown: false,
      }}
    >
      <Drawer.Screen name="MenuStack" component={MenuStack} options={{ drawerLabel: 'Menu' }} />
      <Drawer.Screen name="OrderHistoryStack" component={OrderHistoryStack} options={{ drawerLabel: 'Meu Histórico' }} />
      <Drawer.Screen name="Perfil" component={PerfilScreen} options={{ drawerLabel: 'Perfil' }} />
      <Drawer.Screen
        name="Sobre"
        component={SobreScreen} 
        options={{
          drawerLabel: 'Sobre Nós',
        }}
      />
      {user?.isEmployee && (
        <>
          <Drawer.Screen
            name="OrderList"
            component={OrderListScreen}
            options={{
              drawerLabel: () => (
                <Text style={{ color: '#FFD700' }}>Pedidos em Aberto 🛡️</Text>
              ),
            }}
          />
          <Drawer.Screen
            name="DishManagement"
            component={DishManagementScreen}
            options={{
              drawerLabel: () => (
                <Text style={{ color: '#FFD700' }}>Gerenciar Pratos 🍽️</Text>
              ),
            }}
          />
        </>
      )}
    </Drawer.Navigator>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <UserProvider>
      <CartProvider>
        <StatusBar
          barStyle="light-content" 
          backgroundColor="#1a1a2e" 
          translucent={false}
        />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
              <>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Cadastro" component={Cadastro} />
              </>
            ) : (
              <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </UserProvider>
  );
};

export default App;
