import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

const errorMessages = {
  "auth/invalid-email": "O email inserido não é válido. Por favor, verifique e tente novamente.",
  "auth/user-disabled": "Este usuário foi desativado. Entre em contato com o suporte para mais informações.",
  "auth/user-not-found": "Não encontramos uma conta com esse email. Verifique o email ou cadastre-se.",
  "auth/wrong-password": "A senha inserida está incorreta. Tente novamente ou redefina sua senha.",
  "auth/email-already-in-use": "Este email já está sendo usado. Por favor, faça login ou use outro email para se cadastrar.",
  "auth/operation-not-allowed": "Essa operação não é permitida. Entre em contato com o suporte se você acha que isso é um erro.",
  "auth/weak-password": "Sua senha é muito fraca. Tente uma combinação mais forte de letras, números e símbolos.",
  "auth/invalid-credential": "A senha digitada está inválida",
  "auth/too-many-requests": "Excedeu o limite de tentativas. Por favor tente novamente mais tarde.",
  "default": "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
};


const getFriendlyErrorMessage = (errorCode) => {
  return errorMessages[errorCode] || errorMessages["default"];
};

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = () => {
    setError('');

    if (!email) {
      setError("Por favor, insira um email.");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError("O email inserido não é válido.");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        navigation.navigate('MenuStack');
      })
      .catch((error) => {
        console.log('Erro de autenticação:', error.code); 
        setError(getFriendlyErrorMessage(error.code));
      });
  };

  const handlePasswordReset = () => {
    if (!email) {
      setError("Por favor, insira seu email para que possamos enviar um link de redefinição de senha.");
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setError("Um email para redefinição de senha foi enviado com sucesso. Verifique sua caixa de entrada.");
      })
      .catch((error) => {
        console.log('Erro de redefinição de senha:', error.code); // Adicionado para depurar o código de erro
        setError(getFriendlyErrorMessage(error.code));
      });
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://i.ibb.co/9m0nyVT/correta.png' }} style={styles.logo} />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Senha"
          placeholderTextColor="#888"
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
          <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={24} color="#888" />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.linkText}>Não tem uma conta? <Text style={styles.linkHighlight}>Cadastre-se</Text></Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handlePasswordReset}>
        <Text style={styles.linkText}>Esqueceu a senha? <Text style={styles.linkHighlight}>Redefina aqui</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,  
    height: 50,
    fontSize: 16,
    color: '#fff',
  },
  eyeIcon: {
    justifyContent: 'center',  
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#e94560',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  linkHighlight: {
    color: '#e94560',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#e94560',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default Login;
