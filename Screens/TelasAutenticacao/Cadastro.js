import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, firestore } from '../../firebaseConfig';
import { UserContext } from '../../UserContext';
import { doc, setDoc } from 'firebase/firestore';

const errorMessages = {
  "auth/email-already-in-use": "Este e-mail já está em uso.",
  "auth/invalid-email": "Formato de e-mail inválido.",
  "auth/operation-not-allowed": "Operação não permitida.",
  "auth/weak-password": "A senha é muito fraca.",
};

const getFriendlyErrorMessage = (errorCode) => {
  return errorMessages[errorCode] || "Ocorreu um erro desconhecido.";
};

const Cadastro = ({ navigation }) => {
  const { setUser } = useContext(UserContext);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [errors, setErrors] = useState({});
  const [validated, setValidated] = useState({});
  const [firebaseError, setFirebaseError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const validateEmail = (email) => {
    const emailPattern = /\S+@\S+\.\S+/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordPattern.test(password);
  };

  const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11) return false;
    let sum = 0;
    let remainder;
    if (cpf === "00000000000") return false;
    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  };

  const validateFullName = (fullName) => {
    const nameParts = fullName.trim().split(' ');
    return nameParts.length >= 2 && nameParts[0].length > 0 && nameParts[1].length > 0;
  };

  const handleRegister = () => {
    setFirebaseError('');
    const newErrors = {};
    const newValidated = {};

    if (!validateFullName(fullName)) {
      newErrors.fullName = 'Por favor, insira pelo menos um nome e um sobrenome.';
    } else {
      newValidated.fullName = true;
    }

    if (!validateEmail(email)) {
      newErrors.email = 'Por favor, insira um e-mail válido.';
    } else {
      newValidated.email = true;
    }

    if (!validatePassword(password)) {
      newErrors.password = 'A senha deve conter pelo menos 6 dígitos, incluindo 1 letra, 1 número e 1 caractere especial.';
    } else {
      newValidated.password = true;
    }

    if (!validateCPF(cpf)) {
      newErrors.cpf = 'Por favor, insira um CPF válido.';
    } else {
      newValidated.cpf = true;
    }

    setErrors(newErrors);
    setValidated(newValidated);

    if (Object.keys(newErrors).length === 0) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          await updateProfile(user, {
            displayName: fullName,
          });

          await setDoc(doc(firestore, 'users', user.uid), {
            fullName: fullName,
            cpf: cpf,
            email: email,
            isEmployee: false, 
          });

          setUser({
            uid: user.uid,
            email: user.email,
            fullName: fullName,
            cpf: cpf,
            isEmployee: false,
          });

          navigation.navigate('MenuStack');
        })
        .catch((error) => {
          setFirebaseError(getFriendlyErrorMessage(error.code));
        });
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://i.ibb.co/9m0nyVT/correta.png' }}
        style={styles.logo}
      />
      
      {/* Nome */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.fullName && { borderColor: 'red' }]}
          placeholder="Nome completo"
          placeholderTextColor="#888"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            setValidated((prev) => ({ ...prev, fullName: validateFullName(text) }));
          }}
        />
        {validated.fullName ? (
          <Icon name="check" size={20} color="green" style={styles.icon} />
        ) : fullName ? (
          <Icon name="times" size={20} color="red" style={styles.icon} />
        ) : null}
      </View>
      {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

      {/* Email */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.email && { borderColor: 'red' }]}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setValidated((prev) => ({ ...prev, email: validateEmail(text) }));
          }}
        />
        {validated.email ? (
          <Icon name="check" size={20} color="green" style={styles.icon} />
        ) : email ? (
          <Icon name="times" size={20} color="red" style={styles.icon} />
        ) : null}
      </View>
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* Senha */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.password && { borderColor: 'red' }]}
          placeholder="Senha"
          placeholderTextColor="#888"
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setValidated((prev) => ({ ...prev, password: validatePassword(text) }));
          }}
        />
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
          <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={24} color="#888" />
        </TouchableOpacity>
        {validated.password ? (
          <Icon name="check" size={20} color="green" style={styles.icon} />
        ) : password ? (
          <Icon name="times" size={20} color="red" style={styles.icon} />
        ) : null}
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {/* CPF */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.cpf && { borderColor: 'red' }]}
          placeholder="CPF"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={cpf}
          onChangeText={(text) => {
            setCpf(text);
            setValidated((prev) => ({ ...prev, cpf: validateCPF(text) }));
          }}
        />
        {validated.cpf ? (
          <Icon name="check" size={20} color="green" style={styles.icon} />
        ) : cpf ? (
          <Icon name="times" size={20} color="red" style={styles.icon} />
        ) : null}
      </View>
      {errors.cpf && <Text style={styles.errorText}>{errors.cpf}</Text>}

      {firebaseError ? <Text style={styles.errorText}>{firebaseError}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>
          Já tem uma conta? <Text style={styles.linkHighlight}>Entre</Text>
        </Text>
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
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  icon: {
    position: 'absolute',
    right: 15,
    alignSelf: 'center', 
  },
  eyeIcon: {
    position: 'absolute',
    right: 40,
    alignSelf: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
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
    fontSize: 20,
  },
  linkText: {
    color: '#fff',
    fontSize: 15,
  },
  linkHighlight: {
    color: '#e94560',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default Cadastro;
