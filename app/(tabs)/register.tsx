import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Role } from '@/types/auth';
import { registerStyles } from '@/styles/registerStyles';

export default function RegisterScreen() {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.OWNER);
  
  // Общие поля
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Для OWNER
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');
  
  // Для VET и SERVICE
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Для VET
  const [licenseNumber, setLicenseNumber] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  
  // Для SERVICE
  const [serviceCategory, setServiceCategory] = useState('');
  
  const { register, isLoading, error, clearError } = useAuthStore();

  const roles = [
    { id: Role.OWNER, name: 'Владелец питомца', icon: '🐾', description: 'Управляйте своими питомцами' },
    { id: Role.VET, name: 'Ветеринар', icon: '👨‍⚕️', description: 'Предоставляйте ветеринарные услуги' },
    { id: Role.SERVICE, name: 'Сервис-провайдер', icon: '🛠️', description: 'Услуги груминга, дрессировки и др.' },
  ];

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep('form');
  };

  const handleRegister = async () => {
    // Валидация общих полей
    if (!email.trim() || !password.trim() || !phoneNumber.trim()) {
      Alert.alert('Ошибка', 'Заполните все обязательные поля');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть не менее 6 символов');
      return;
    }
    
    const registerData: any = {
      email,
      password,
      phoneNumber,
      role: selectedRole,
    };
    
    // Добавляем поля в зависимости от роли
    if (selectedRole === Role.OWNER) {
      if (!username.trim()) {
        Alert.alert('Ошибка', 'Введите имя пользователя');
        return;
      }
      registerData.username = username;
      registerData.address = address;
    } else {
      if (!firstName.trim() || !lastName.trim()) {
        Alert.alert('Ошибка', 'Введите имя и фамилию');
        return;
      }
      registerData.firstName = firstName;
      registerData.lastName = lastName;
      
      if (selectedRole === Role.VET) {
        if (!licenseNumber.trim() || !clinicName.trim()) {
          Alert.alert('Ошибка', 'Заполните данные о лицензии и клинике');
          return;
        }
        registerData.licenseNumber = licenseNumber;
        registerData.clinicName = clinicName;
        registerData.experienceYears = parseInt(experienceYears) || 0;
      } else if (selectedRole === Role.SERVICE) {
        if (!serviceCategory) {
          Alert.alert('Ошибка', 'Выберите категорию услуг');
          return;
        }
        registerData.serviceCategory = serviceCategory;
      }
    }
    
    const success = await register(registerData);
    if (success) {
      Alert.alert(
        'Успешно!',
        'Регистрация прошла успешно',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    }
  };

  const serviceCategories = [
    'Грумер', 'Кинолог', 'Зоопсихолог', 'Фелинолог', 
    'Петситтер', 'Хендлер', 'Зоодиетолог'
  ];

  if (step === 'role') {
    return (
      <ScrollView style={registerStyles.container}>
        <View style={registerStyles.header}>
          <Text style={registerStyles.title}>Выберите роль</Text>
          <Text style={registerStyles.subtitle}>Кем вы будете в приложении?</Text>
        </View>
        
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={registerStyles.roleCard}
            onPress={() => handleRoleSelect(role.id)}
          >
            <Text style={registerStyles.roleIcon}>{role.icon}</Text>
            <View style={registerStyles.roleInfo}>
              <Text style={registerStyles.roleName}>{role.name}</Text>
              <Text style={registerStyles.roleDescription}>{role.description}</Text>
            </View>
            <Text style={registerStyles.roleArrow}>→</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={registerStyles.backButton}
          onPress={() => router.back()}
        >
          <Text style={registerStyles.backButtonText}>Назад</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={registerStyles.container}
    >
      <ScrollView contentContainerStyle={registerStyles.scrollContent}>
        <View style={registerStyles.header}>
          <TouchableOpacity onPress={() => setStep('role')} style={registerStyles.backIcon}>
            <Text>←</Text>
          </TouchableOpacity>
          <Text style={registerStyles.title}>
            {selectedRole === Role.OWNER && 'Регистрация владельца'}
            {selectedRole === Role.VET && 'Регистрация ветеринара'}
            {selectedRole === Role.SERVICE && 'Регистрация специалиста'}
          </Text>
        </View>

        <View style={registerStyles.form}>
          {error && (
            <View style={registerStyles.errorContainer}>
              <Text style={registerStyles.errorText}>{error}</Text>
            </View>
          )}

          {/* Общие поля */}
          <View style={registerStyles.inputGroup}>
            <Text style={registerStyles.label}>Email *</Text>
            <TextInput
              style={registerStyles.input}
              placeholder="example@mail.com"
              placeholderTextColor="#B6CAEB"
              value={email}
              onChangeText={(text) => {
                clearError();
                setEmail(text);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={registerStyles.inputGroup}>
            <Text style={registerStyles.label}>Телефон *</Text>
            <TextInput
              style={registerStyles.input}
              placeholder="+7 777 123 4567"
              placeholderTextColor="#B6CAEB"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <View style={registerStyles.inputGroup}>
            <Text style={registerStyles.label}>Пароль *</Text>
            <View style={registerStyles.passwordContainer}>
              <TextInput
                style={[registerStyles.input, registerStyles.passwordInput]}
                placeholder="••••••••"
                placeholderTextColor="#B6CAEB"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={registerStyles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Поля для OWNER */}
          {selectedRole === Role.OWNER && (
            <>
              <View style={registerStyles.inputGroup}>
                <Text style={registerStyles.label}>Имя пользователя *</Text>
                <TextInput
                  style={registerStyles.input}
                  placeholder="Как вас называть?"
                  placeholderTextColor="#B6CAEB"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>

              <View style={registerStyles.inputGroup}>
                <Text style={registerStyles.label}>Адрес</Text>
                <TextInput
                  style={registerStyles.input}
                  placeholder="Ваш город/адрес"
                  placeholderTextColor="#B6CAEB"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </>
          )}

          {/* Поля для VET и SERVICE */}
          {(selectedRole === Role.VET || selectedRole === Role.SERVICE) && (
            <>
              <View style={registerStyles.row}>
                <View style={[registerStyles.inputGroup, registerStyles.halfWidth]}>
                  <Text style={registerStyles.label}>Имя *</Text>
                  <TextInput
                    style={registerStyles.input}
                                    placeholder="Имя"
                    placeholderTextColor="#B6CAEB"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>

                <View style={[registerStyles.inputGroup, registerStyles.halfWidth]}>
                  <Text style={registerStyles.label}>Фамилия *</Text>
                  <TextInput
                    style={registerStyles.input}
                    placeholder="Фамилия"
                    placeholderTextColor="#B6CAEB"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
            </>
          )}

          {/* Поля для VET */}
          {selectedRole === Role.VET && (
            <>
              <View style={registerStyles.inputGroup}>
                <Text style={registerStyles.label}>Номер лицензии *</Text>
                <TextInput
                  style={registerStyles.input}
                  placeholder="Лицензия врача"
                  placeholderTextColor="#B6CAEB"
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                />
              </View>

              <View style={registerStyles.inputGroup}>
                <Text style={registerStyles.label}>Название клиники *</Text>
                <TextInput
                  style={registerStyles.input}
                  placeholder="Где работаете?"
                  placeholderTextColor="#B6CAEB"
                  value={clinicName}
                  onChangeText={setClinicName}
                />
              </View>

              <View style={registerStyles.inputGroup}>
                <Text style={registerStyles.label}>Опыт работы (лет)</Text>
                <TextInput
                  style={registerStyles.input}
                                  placeholder="0"
                  placeholderTextColor="#B6CAEB"
                  value={experienceYears}
                  onChangeText={setExperienceYears}
                  keyboardType="numeric"
                />
              </View>
            </>
          )}

          {/* Поля для SERVICE */}
          {selectedRole === Role.SERVICE && (
            <View style={registerStyles.inputGroup}>
              <Text style={registerStyles.label}>Категория услуг *</Text>
              <View style={registerStyles.categoryContainer}>
                {serviceCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      registerStyles.categoryButton,
                      serviceCategory === category && registerStyles.categoryButtonActive,
                    ]}
                    onPress={() => setServiceCategory(category)}
                  >
                    <Text
                      style={[
                        registerStyles.categoryText,
                        serviceCategory === category && registerStyles.categoryTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={registerStyles.registerButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={registerStyles.registerButtonText}>Зарегистрироваться</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={registerStyles.loginLink}
            onPress={() => router.push('/(tabs)/login')}
          >
            <Text style={registerStyles.loginLinkText}>
              Уже есть аккаунт? Войти
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}