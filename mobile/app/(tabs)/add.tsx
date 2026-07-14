// app/(tabs)/add.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../utils/api';

export default function AddLearning() {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    if (!topic) {
      Alert.alert('Missing Field', 'Please enter a topic');
      return;
    }

    try {
      await api.post('/learnings', { topic, description });
      setTopic('');
      setDescription('');
      Alert.alert('Success', 'Learning logged!');
      router.push('/(tabs)');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save learning');
    }
  };

  return (
    <View className="flex-1 bg-primary p-6">
      <Text className="text-text-muted text-sm font-bold uppercase mb-2">Topic</Text>
      <TextInput
        className="bg-input-bg text-white p-4 rounded-lg border border-input-border focus:border-accent mb-6"
        placeholder="e.g. React Native Navigation"
        placeholderTextColor="#9ca3af"
        value={topic}
        onChangeText={setTopic}
      />

      <Text className="text-text-muted text-sm font-bold uppercase mb-2">Key Takeaway</Text>
      <TextInput
        className="bg-input-bg text-white p-4 rounded-lg border border-input-border focus:border-accent mb-8 h-32 text-top"
        placeholder="What did you learn today?"
        placeholderTextColor="#9ca3af"
        multiline
        textAlignVertical="top"
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity 
        className="bg-accent p-4 rounded-lg items-center"
        onPress={handleSubmit}
      >
        <Text className="text-white font-bold text-lg">Add to Schedule</Text>
      </TouchableOpacity>
    </View>
  );
}