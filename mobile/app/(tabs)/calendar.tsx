// app/(tabs)/calendar.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from 'expo-router';
import { format, startOfDay, endOfDay } from 'date-fns';
import api from '../../utils/api';
import { scheduleOrUpdateDueReviewNotification } from '../../utils/notifications';

type Learning = {
  _id: string;
  topic: string;
  description: string;
  stage: number;
  nextReviewDate: string;
};

export default function CalendarScreen() {
  const [learnings, setLearnings] = useState<Learning[]>([]);
  // Default to today's date in YYYY-MM-DD format
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reviewingIds, setReviewingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/learnings');
      setLearnings(data);
      scheduleOrUpdateDueReviewNotification(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, difficulty: 'hard' | 'good' | 'easy') => {
    try {
      setReviewingIds(prev => [...prev, id]);
      await api.put(`/learnings/${id}/review`, { difficulty });
      const { data } = await api.get('/learnings');
      setLearnings(data);
      scheduleOrUpdateDueReviewNotification(data);
    } catch (e) {
      console.error(e);
    } finally {
      setReviewingIds(prev => prev.filter(rId => rId !== id));
    }
  };

  // 1. Fetch Data
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // 2. Transform data for the Calendar "Dots"
  const markedDates = useMemo(() => {
    const marks: any = {};
    const startOfTodayDate = startOfDay(new Date());
    const endOfTodayDate = endOfDay(new Date());
    
    // Add dots for every due date
    learnings.forEach((item) => {
      const dateKey = format(new Date(item.nextReviewDate), 'yyyy-MM-dd');
      const itemDate = new Date(item.nextReviewDate);
      
      let dotColor = '#6366f1';
      if (itemDate < startOfTodayDate) {
        dotColor = '#ef4444';
      } else if (itemDate <= endOfTodayDate) {
        dotColor = '#f59e0b';
      }
      
      if (!marks[dateKey]) {
        marks[dateKey] = { marked: true, dotColor };
      } else if (dotColor === '#ef4444') {
        marks[dateKey].dotColor = '#ef4444';
      } else if (dotColor === '#f59e0b' && marks[dateKey].dotColor !== '#ef4444') {
        marks[dateKey].dotColor = '#f59e0b';
      }
    });

    // Highlight the currently selected date specifically
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: '#6366f1',
    };

    return marks;
  }, [learnings, selectedDate]);

  // 3. Filter the list for the Selected Date
  const selectedItems = learnings.filter((item) => {
    const itemDate = format(new Date(item.nextReviewDate), 'yyyy-MM-dd');
    return itemDate === selectedDate;
  });

  if (loading) return (
    <View className="flex-1 items-center justify-center bg-primary">
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );

  if (error) return (
    <View className="flex-1 items-center justify-center bg-primary p-6">
      <Text className="text-text-muted text-center mb-4">{error}</Text>
      <TouchableOpacity onPress={fetchData} className="bg-accent px-6 py-3 rounded-lg">
        <Text className="text-white font-bold">Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-primary">
      {/* Calendar Component */}
      <Calendar
        // Dark Mode Styling
        theme={{
          backgroundColor: '#101828',
          calendarBackground: '#101828',
          textSectionTitleColor: '#9ca3af',
          selectedDayBackgroundColor: '#6366f1',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#6366f1',
          dayTextColor: '#ffffff',
          textDisabledColor: '#374151',
          dotColor: '#6366f1',
          selectedDotColor: '#ffffff',
          arrowColor: '#6366f1',
          monthTextColor: '#ffffff',
          indicatorColor: '#6366f1',
        }}
        // Handlers
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        enableSwipeMonths={true}
      />

      {/* Legend */}
      <View className="flex-row justify-end items-center gap-4 py-2 px-4 bg-card border-b border-card-border">
        <View className="flex-row items-center gap-1.5">
          <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <Text className="text-text-muted text-xs">Overdue</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <Text className="text-text-muted text-xs">Due Today</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <Text className="text-text-muted text-xs">Upcoming</Text>
        </View>
      </View>

      {/* The List of Items for that Day */}
      <View className="flex-1 p-4">
        <Text className="text-text-muted font-bold mb-4 uppercase text-xs tracking-wider">
          Reviews for {format(new Date(selectedDate), 'MMMM do')}
        </Text>

        <FlatList
          data={selectedItems}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <Text className="text-text-muted italic mt-4 text-center">
              Nothing scheduled for this day.
            </Text>
          }
          renderItem={({ item }) => {
            const isActionable = new Date(item.nextReviewDate) <= endOfDay(new Date());
            return (
              <View className="bg-card p-4 rounded-xl mb-3 border border-card-border">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1 mr-4">
                    <Text className="text-white font-bold text-lg">{item.topic}</Text>
                    <Text className="text-text-muted text-xs mt-1">
                      Stage {item.stage}
                    </Text>
                  </View>
                </View>

                {reviewingIds.includes(item._id) ? (
                  <ActivityIndicator color="#6366f1" />
                ) : isActionable ? (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleReview(item._id, 'hard')}
                      className="flex-1 py-2 rounded-lg items-center bg-red-900/30"
                    >
                      <Text className="text-red-400 font-bold text-xs">Hard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleReview(item._id, 'good')}
                      className="flex-1 py-2 rounded-lg items-center bg-indigo-900/30"
                    >
                      <Text className="text-indigo-300 font-bold text-xs">Good</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleReview(item._id, 'easy')}
                      className="flex-1 py-2 rounded-lg items-center bg-green-900/30"
                    >
                      <Text className="text-green-400 font-bold text-xs">Easy</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}