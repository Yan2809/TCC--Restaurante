// Screens/TelaSobre/SobreScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';

const SobreScreen = ({ navigation }) => {
  const handleInstagramPress = () => {
    const instagramUrl = 'https://www.instagram.com/feebarutti/';
    Linking.openURL(instagramUrl).catch((err) =>
      console.error('Erro ao abrir o Instagram: ', err)
    );
  };

  return (
    <View style={styles.container}>
      {/* Menu Hamburger ajustado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Image
            source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/menu.png' }}
            style={styles.menuIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Logo do restaurante */}
      <Image
        source={{ uri: 'https://i.ibb.co/9m0nyVT/correta.png' }}
        style={styles.logo}
      />

      <Text style={styles.title}>Sobre o Restaurante</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Endereço:</Text>
        <Text style={styles.info}>R. Antúrios, 464 - Vila Formosa, São Paulo - SP, 03415-000</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Horário de Funcionamento:</Text>
        <Text style={styles.info}>Segunda à Sexta: 11:30 - 15:00</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Telefone:</Text>
        <Text style={styles.info}>Whatsapp: (11) 99397-7215</Text>
        <Text style={styles.info}>Telefone: (11) 2671-3987</Text>
      </View>

      <TouchableOpacity style={styles.instagramButton} onPress={handleInstagramPress}>
        <Image source={{ uri: 'https://img.icons8.com/ios/50/ffffff/instagram-new--v1.png' }} style={styles.instagramIcon} />
        <Text style={styles.instagramText}>Siga-nos no Instagram</Text>
      </TouchableOpacity>
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
  menuIcon: {
    width: 30,
    height: 30,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  info: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  instagramButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1306C',
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  instagramIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  instagramText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SobreScreen;
