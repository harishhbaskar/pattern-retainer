import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Swipeable } from 'react-native-gesture-handler';
import api from '../../utils/api';
import { format } from 'date-fns';

type Learning = {
  _id: string;
  topic: string;
  description: string;
  stage: number;
  nextReviewDate: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [nextUpcoming, setNextUpcoming] = useState<Learning | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLearnings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/learnings');
      const now = new Date();
      const dueItems = data.filter((l: Learning) => new Date(l.nextReviewDate) <= now);
      const upcomingItems = data
        .filter((l: Learning) => new Date(l.nextReviewDate) > now)
        .sort((a: Learning, b: Learning) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());
      setNextUpcoming(upcomingItems[0] ?? null);
      setLearnings(dueItems);
    } catch (error) {
      console.error(error);
      setError('Failed to load. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/learnings/${id}`);
      fetchLearnings();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete');
    }
  };

  const renderRightActions = (id: string) => (
    <TouchableOpacity
      onPress={() => {
        Alert.alert('Delete', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => handleDelete(id) }
        ]);
      }}
      className="bg-red-500 justify-center items-center px-6 rounded-xl mb-4"
    >
      <Text className="text-white font-bold">Delete</Text>
    </TouchableOpacity>
  );

  const handleReview = async (id: string, difficulty: 'hard' | 'good' | 'easy') => {
    try {
      await api.put(`/learnings/${id}/review`, { difficulty });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      fetchLearnings();
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLearnings();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLearnings();
    setRefreshing(false);
  };

  if (loading && !refreshing) return (
    <View className="flex-1 items-center justify-center bg-primary">
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );

  if (error) return (
    <View className="flex-1 items-center justify-center bg-primary p-6">
      <Text className="text-text-muted text-center mb-4">{error}</Text>
      <TouchableOpacity onPress={fetchLearnings} className="bg-accent px-6 py-3 rounded-lg">
        <Text className="text-white font-bold">Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-primary p-4">
      <FlatList
        data={learnings}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-20 px-4">
            <Text className="text-text-muted text-lg text-center">
              No reviews due today!
            </Text>
            {nextUpcoming ? (
              <View className="mt-6 bg-card p-4 rounded-xl border border-card-border w-full">
                <Text className="text-text-muted text-xs uppercase font-bold mb-2">Next Up</Text>
                <Text className="text-white font-bold text-base">{nextUpcoming.topic}</Text>
                <Text className="text-text-muted text-xs mt-1">
                  Due {format(new Date(nextUpcoming.nextReviewDate), 'MMM d')} · Stage {nextUpcoming.stage}
                </Text>
              </View>
            ) : (
              <Text className="text-text-muted text-sm mt-2 text-center">
                Add something new to get started.
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item._id)}>
            <View className="bg-card p-4 rounded-xl mb-4 border border-card-border border-l-4 border-l-accent">
              <View className="flex-row justify-between items-start mb-2">
                <View className="bg-indigo-900/40 px-3 py-1 rounded-full">
                  <Text className="text-indigo-300 font-bold text-xs">Stage {item.stage}</Text>
                </View>
                <Text className="text-text-muted text-xs">{format(new Date(item.nextReviewDate), 'MMM d')}</Text>
              </View>
              
              <Text className="text-white text-xl font-bold mb-1">{item.topic}</Text>
              <Text className="text-text-secondary mb-4">{item.description}</Text>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity
                  onPress={() => handleReview(item._id, 'hard')}
                  className="flex-1 py-3 rounded-lg items-center bg-red-900/30"
                >
                  <Text className="text-red-400 font-bold text-sm">Hard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleReview(item._id, 'good')}
                  className="flex-1 py-3 rounded-lg items-center bg-indigo-900/30"
                >
                  <Text className="text-indigo-300 font-bold text-sm">Good</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleReview(item._id, 'easy')}
                  className="flex-1 py-3 rounded-lg items-center bg-green-900/30"
                >
                  <Text className="text-green-400 font-bold text-sm">Easy</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => router.push({ pathname: '/(tabs)/edit', params: { id: item._id } })}
                className="flex-row items-center justify-center bg-card-border py-3 rounded-lg mt-2"
              >
                <Text className="text-white font-bold">Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Delete', 'Are you sure?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item._id) }
                  ]);
                }}
                className="flex-row items-center justify-center bg-card-border py-3 rounded-lg mt-2"
              >
                <Text className="text-red-400 font-bold">Delete</Text>
              </TouchableOpacity>
            </View>
          </Swipeable>
        )}
      />
    </View>
  );
}