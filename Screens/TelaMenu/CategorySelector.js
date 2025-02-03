import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const CategorySelector = ({ selectedCategory, onSelectCategory }) => (
    <View style={styles.categoryContainer}>
        <TouchableOpacity onPress={() => onSelectCategory('pratosDoDia')}>
            <Text style={[styles.categoryButton, selectedCategory === 'pratosDoDia' && styles.selectedCategory]}>
                Pratos
            </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onSelectCategory('bebidas')}>
            <Text style={[styles.categoryButton, selectedCategory === 'bebidas' && styles.selectedCategory]}>
                Bebidas
            </Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    categoryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    categoryButton: {
        color: '#aaa',
        fontSize: 18,
        fontWeight: 'bold',
    },
    selectedCategory: {
        color: '#fff',
        borderBottomWidth: 2,
        borderBottomColor: '#fff',
    },
});

export default CategorySelector;