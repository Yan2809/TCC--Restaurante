import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const MenuItem = ({ item, onAddToCart }) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <Text 
                style={styles.name} 
                numberOfLines={1} 
                adjustsFontSizeToFit 
                minimumFontScale={0.5}
            >
                {item.name}
            </Text>
            <Text style={styles.price}>
                {item.price ? `R$ ${item.price.toFixed(2)}` : 'Preço indisponível'}
            </Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.infoButton} onPress={() => setModalVisible(true)}>
                    <Icon name="info-circle" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.cartButton} onPress={onAddToCart}>
                    <Icon name="shopping-cart" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{item.name}</Text>
                        <Image source={{ uri: item.imageUrl }} style={styles.modalImage} />
                        <Text style={styles.modalText}>{item.description}</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#232740',
        borderRadius: 15,
        padding: 15,
        margin: 10,
        alignItems: 'center',
        width: 170,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    image: {
        width: 140,
        height: 90,
        borderRadius: 10,
    },
    name: {
        color: '#fff',
        fontSize: 17,
        marginVertical: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
    price: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 10,
        fontWeight: '500',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    infoButton: {
        backgroundColor: '#1e88e5',
        padding: 10,
        borderRadius: 10,
        marginRight: 5,
        flex: 1,
        alignItems: 'center',
    },
    cartButton: {
        backgroundColor: '#e91e63',
        padding: 10,
        borderRadius: 10,
        flex: 1,
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        backgroundColor: '#232740',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    modalImage: {
        width: 250,
        height: 150,
        borderRadius: 10,
        marginBottom: 20,
    },
    modalTitle: {
        color: '#D9D9D9',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalText: {
        color: '#D9D9D9',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    closeButton: {
        backgroundColor: '#e91e63',
        padding: 10,
        borderRadius: 20,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MenuItem;
