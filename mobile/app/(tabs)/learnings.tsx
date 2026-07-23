import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import api from '../../utils/api';
import { format } from 'date-fns';
import { scheduleOrUpdateDueReviewNotification } from '../../utils/notifications';

type Learning = {
  _id: string;
  topic: string;
  description: string;
  stage: number;
  nextReviewDate: string;
};

export default function LearningsScreen() {
  const router = useRouter();
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLearnings = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else if (learnings.length === 0) {
      setLoading(true);
    }
    if (!isRefresh) {
      setError(null);
    }

    try {
      const { data } = await api.get('/learnings');
      setLearnings(data);
      scheduleOrUpdateDueReviewNotification(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch learnings:', err);
      const message = err?.response?.data?.message || 'Could not load your learnings. Please check your connection and try again.';
      
      if (isRefresh || learnings.length > 0) {
        Alert.alert(
          'Refresh Failed',
          err?.response?.data?.message || 'Failed to refresh learnings. Please try again.'
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [learnings.length]);

  useFocusEffect(
    useCallback(() => {
      fetchLearnings(false);
    }, [fetchLearnings])
  );

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/learnings/${id}`);
      fetchLearnings(false);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to delete learning. Please try again.'
      );
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Delete Learning', 'Are you sure you want to permanently delete this learning?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => handleDelete(id) },
    ]);
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (error && learnings.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-primary p-6">
        <Text className="text-text-muted text-center mb-4">{error}</Text>
        <TouchableOpacity onPress={() => fetchLearnings(false)} className="bg-accent px-6 py-3 rounded-lg">
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary p-4">
      <FlatList
        data={learnings}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchLearnings(true)}
            tintColor="#6366f1"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-20 px-4">
            <Text className="text-text-muted text-lg text-center font-medium">
              Nothing logged yet. Add your first learning!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-card p-4 rounded-xl mb-4 border border-card-border">
            <View className="flex-row justify-between items-center mb-2">
              <View className="bg-indigo-900/40 px-3 py-1 rounded-full">
                <Text className="text-indigo-300 font-bold text-xs">Stage {item.stage}</Text>
              </View>
              <Text className="text-text-muted text-xs font-medium">
                Review: {format(new Date(item.nextReviewDate), 'MMM d, yyyy')}
              </Text>
            </View>

            <Text className="text-white text-xl font-bold mb-1">{item.topic}</Text>
            {item.description ? (
              <Text className="text-text-secondary mb-4">{item.description}</Text>
            ) : (
              <View className="mb-4" />
            )}

            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/(tabs)/edit', params: { id: item._id } })}
                className="flex-1 items-center justify-center bg-card-border py-3 rounded-lg"
              >
                <Text className="text-white font-bold">Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => confirmDelete(item._id)}
                className="flex-1 items-center justify-center bg-card-border py-3 rounded-lg"
              >
                <Text className="text-red-400 font-bold">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
