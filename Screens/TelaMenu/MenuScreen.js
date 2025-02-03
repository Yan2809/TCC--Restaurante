import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Animated, Easing, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MenuItem from './MenuItem';
import CategorySelector from './CategorySelector';
import { firestore } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { CartContext } from '../TelaCarrinho/CartContext';

const MenuScreen = ({ navigation }) => {
  const { cartItems, setCartItems } = useContext(CartContext);
  const [selectedCategory, setSelectedCategory] = useState('pratosDoDia');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddedVisible, setIsAddedVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    setRefreshing(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, 'products'));
      const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    } catch (error) {
      console.error('Erro ao buscar os produtos: ', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getCategoryData = () => {
    let data = [];
    const filteredProducts = products.filter(product => {
      if (selectedCategory === 'pratosDoDia') {
        return product.category === 'Pratos';
      } else if (selectedCategory === 'bebidas') {
        return product.category === 'Bebidas';
      }
      return false;
    });

    data = [{ key: selectedCategory === 'pratosDoDia' ? 'Pratos' : 'Bebidas', dishes: filteredProducts }];

    if (searchQuery.trim() !== '') {
      data = data.map(category => ({
        ...category,
        dishes: category.dishes.filter(dish => dish.name.toLowerCase().includes(searchQuery.toLowerCase())),
      }));
    }

    return data;
  };

  const addToCart = (item) => {
    const existingItemIndex = cartItems.findIndex((cartItem) => cartItem.id === item.id);
    if (existingItemIndex !== -1) {
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += 1;
      setCartItems(updatedCartItems);
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
    startAnimation();
  };

  const startAnimation = () => {
    translateY.stopAnimation();
    fadeAnim.stopAnimation();

    setIsAddedVisible(true);

    translateY.setValue(20);
    fadeAnim.setValue(1);

    Animated.timing(translateY, {
      toValue: -10,
      duration: 1500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1500,
      delay: 1000,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setIsAddedVisible(false));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="bars" size={30} color="#fff" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#aaa" style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Pesquisar"
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.cartIconContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <Icon name="shopping-cart" size={30} color="#fff" right={5} />
          </TouchableOpacity>
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartCount}>
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {isAddedVisible && (
        <Animated.View style={[styles.addedToCartContainer, { opacity: fadeAnim, transform: [{ translateY }] }]}>
          <Text style={styles.addedToCartText}>Adicionado ao Carrinho</Text>
        </Animated.View>
      )}

      <CategorySelector selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      <FlatList
        data={getCategoryData()}
        renderItem={({ item }) => (
          <View>
            <View style={styles.categoryTitleContainer}>
              <Text style={styles.title}>{item.key}</Text>
              <View style={styles.line} />
            </View>
            <FlatList
              data={item.dishes}
              renderItem={({ item }) => <MenuItem item={item} onAddToCart={() => addToCart(item)} />}
              keyExtractor={dish => dish.id}
              numColumns={2}
              contentContainerStyle={styles.list}
            />
          </View>
        )}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchProducts} />
        }
      />
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
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b2b40',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    color: '#fff',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginVertical: 10,
  },
  title: {
    fontSize: 24,
    color: '#fff',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#fff',
    marginLeft: 10,
  },
  list: {
    alignItems: 'center',
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -1,
    backgroundColor: 'red',
    borderRadius: 12,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  cartCount: {
    color: '#fff',
    fontSize: 12,
  },
  addedToCartContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 128, 0, 0.8)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 100,
  },
  addedToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MenuScreen;
