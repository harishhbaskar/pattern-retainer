import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Mail } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View className="flex-1 bg-primary p-6">
      <View className="bg-card p-6 rounded-xl border border-card-border mb-6 items-center">
        <View className="w-16 h-16 rounded-full bg-indigo-900/40 items-center justify-center mb-4">
          <UserIcon size={32} color="#6366f1" />
        </View>
        <Text className="text-white text-2xl font-bold mb-1">{user?.name || 'User'}</Text>
        <View className="flex-row items-center gap-2 mt-1">
          <Mail size={16} color="#9ca3af" />
          <Text className="text-text-muted text-sm">{user?.email || ''}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        className="flex-row items-center justify-center bg-red-900/30 border border-red-800/40 p-4 rounded-xl gap-2"
      >
        <LogOut size={20} color="#ef4444" />
        <Text className="text-red-400 font-bold text-lg">Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}
