import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { BookOpen } from 'lucide-react-native';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/users/login', { email, password });
      signIn(data);
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-primary">
      <View className="w-full max-w-sm mx-auto">
        <View className="items-center mb-8">
          <BookOpen size={40} color="#6366f1" />
          <Text className="text-3xl font-bold text-white mt-3">Pattern Retainer</Text>
          <Text className="text-text-muted text-center mt-2">Spaced repetition learning logger</Text>
        </View>

        <TextInput
          className="w-full bg-input-bg text-white p-4 rounded-lg mb-4 border border-input-border"
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          className="w-full bg-input-bg text-white p-4 rounded-lg mb-6 border border-input-border"
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          className="w-full bg-accent p-4 rounded-lg items-center"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#ffffff" />
            : <Text className="text-white font-bold text-lg">Sign In</Text>
          }
        </TouchableOpacity>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-text-muted">Don't have an account? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text className="text-accent font-bold">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}