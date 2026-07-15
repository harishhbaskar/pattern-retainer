import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import api from '../../utils/api';
import { format, endOfDay } from 'date-fns';
import { checkAndRequestNotificationPermission } from '../../utils/notifications';

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
  const [upcomingLearnings, setUpcomingLearnings] = useState<Learning[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLearnings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/learnings');
      checkAndRequestNotificationPermission(data);
      const endOfToday = endOfDay(new Date());
      const dueItems = data.filter((l: Learning) => new Date(l.nextReviewDate) <= endOfToday);
      const upcomingItems = data
        .filter((l: Learning) => new Date(l.nextReviewDate) > endOfToday)
        .sort((a: Learning, b: Learning) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());
      setUpcomingLearnings(upcomingItems.slice(0, 5));
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
    } catch {
      Alert.alert('Error', 'Failed to delete');
    }
  };



  const handleReview = async (id: string, difficulty: 'hard' | 'good' | 'easy') => {
    try {
      await api.put(`/learnings/${id}/review`, { difficulty });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      fetchLearnings();
    } catch (err) {
      console.error(err);
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
        ListHeaderComponent={
          learnings.length > 0 ? (
            <Text className="text-white text-xl font-bold mb-4">Due for Review</Text>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12 px-4 bg-card rounded-xl border border-card-border my-2">
            <Text className="text-text-muted text-base font-medium text-center">
              No reviews due today!
            </Text>
            {upcomingLearnings.length === 0 && (
              <Text className="text-text-muted text-sm mt-2 text-center">
                Add something new to get started.
              </Text>
            )}
          </View>
        }
        ListFooterComponent={
          upcomingLearnings.length > 0 ? (
            <View className="mt-6 mb-8">
              <Text className="text-white text-xl font-bold mb-4">Coming Up</Text>
              {upcomingLearnings.map((item) => (
                <View
                  key={item._id}
                  className="bg-card p-4 rounded-xl mb-3 border border-card-border flex-row justify-between items-center"
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    <View className="bg-indigo-900/40 px-2.5 py-0.5 rounded-full mr-2">
                      <Text className="text-indigo-300 font-bold text-xs">Stage {item.stage}</Text>
                    </View>
                    <Text className="text-white font-medium text-base flex-1" numberOfLines={1}>
                      {item.topic}
                    </Text>
                  </View>
                  <Text className="text-text-muted text-xs">
                    {format(new Date(item.nextReviewDate), 'MMM d')}
                  </Text>
                </View>
              ))}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
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
        )}
      />
    </View>
  );
}