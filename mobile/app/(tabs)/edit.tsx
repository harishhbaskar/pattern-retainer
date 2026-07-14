import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../utils/api';

export default function EditLearning() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLearning = async () => {
      try {
        const { data } = await api.get(`/learnings/${id}`);
        setTopic(data.topic);
        setDescription(data.description);
      } catch (e) {
        Alert.alert('Error', 'Could not load this item');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchLearning();
  }, [id]);

  const handleSave = async () => {
    if (!topic.trim()) {
      Alert.alert('Missing Field', 'Topic is required');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/learnings/${id}`, { topic, description });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <View className="flex-1 items-center justify-center bg-primary">
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );

  return (
    <View className="flex-1 bg-primary p-6">
      <Text className="text-text-muted text-sm font-bold uppercase mb-2">Topic</Text>
      <TextInput
        className="bg-input-bg text-white p-4 rounded-lg border border-input-border mb-6"
        value={topic}
        onChangeText={setTopic}
        placeholderTextColor="#9ca3af"
      />
      <Text className="text-text-muted text-sm font-bold uppercase mb-2">Key Takeaway</Text>
      <TextInput
        className="bg-input-bg text-white p-4 rounded-lg border border-input-border mb-8 h-32"
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
        placeholderTextColor="#9ca3af"
      />
      <TouchableOpacity
        className="bg-accent p-4 rounded-lg items-center"
        onPress={handleSave}
        disabled={saving}
      >
        {saving
          ? <ActivityIndicator color="#ffffff" />
          : <Text className="text-white font-bold text-lg">Save Changes</Text>
        }
      </TouchableOpacity>
    </View>
  );
}
