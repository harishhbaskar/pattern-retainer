import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { BookOpen, Clock, CheckCircle, Flame } from 'lucide-react-native';
import api from '../../utils/api';

type Stats = {
  totalTopics: number;
  dueToday: number;
  reviewedThisWeek: number;
  streak: number;
  stageBreakdown: { _id: number; count: number }[];
};

const STAT_CONFIGS = [
  { key: 'totalTopics', label: 'Total Topics', iconBg: 'bg-indigo-900/40', iconColor: '#6366f1', Icon: BookOpen },
  { key: 'dueToday', label: 'Due Today', iconBg: 'bg-red-900/40', iconColor: '#ef4444', Icon: Clock },
  { key: 'reviewedThisWeek', label: 'Reviewed This Week', iconBg: 'bg-green-900/40', iconColor: '#22c55e', Icon: CheckCircle },
  { key: 'streak', label: 'Day Streak', iconBg: 'bg-amber-900/40', iconColor: '#f59e0b', Icon: Flame },
];

const StatCard = ({
  label,
  value,
  iconBg,
  iconColor,
  Icon,
}: {
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  Icon: React.ElementType;
}) => (
  <View className="flex-1 bg-card border border-card-border rounded-xl p-4 flex-row items-center gap-3">
    <View className={`w-10 h-10 rounded-full ${iconBg} items-center justify-center`}>
      <Icon size={20} color={iconColor} />
    </View>
    <View className="flex-1">
      <Text className="text-white text-2xl font-bold">{value}</Text>
      <Text className="text-text-muted text-xs mt-0.5">{label}</Text>
    </View>
  </View>
);

export default function StatsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        setLoading(true);
        try {
          const { data } = await api.get('/learnings/stats');
          setStats(data);
        } catch (e) {
          setError('Could not load stats.');
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    }, [])
  );

  if (loading) return (
    <View className="flex-1 items-center justify-center bg-primary">
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );

  if (error || !stats) return (
    <View className="flex-1 items-center justify-center bg-primary p-6">
      <Text className="text-text-muted text-center">{error ?? 'No data available.'}</Text>
    </View>
  );

  const maxCount = Math.max(...stats.stageBreakdown.map(s => s.count), 1);

  return (
    <ScrollView className="flex-1 bg-primary p-4">
      <Text className="text-white text-xl font-bold mb-4">Your Progress</Text>

      <View style={{ gap: 12 }} className="mb-6">
        {STAT_CONFIGS.map(cfg => (
          <StatCard
            key={cfg.key}
            label={cfg.label}
            value={stats[cfg.key as keyof Stats] as number}
            iconBg={cfg.iconBg}
            iconColor={cfg.iconColor}
            Icon={cfg.Icon}
          />
        ))}
      </View>

      {stats.stageBreakdown.length > 0 && (
        <View className="bg-card rounded-xl p-4">
          <Text className="text-white font-bold mb-4">Topics by Stage</Text>
          {stats.stageBreakdown.map(({ _id: stage, count }) => (
            <View key={stage} className="mb-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-text-secondary text-xs">Stage {stage}</Text>
                <Text className="text-white text-xs">{count}</Text>
              </View>
              <View style={{ backgroundColor: '#374151', borderRadius: 9999, height: 8 }}>
                <View
                  style={{
                    backgroundColor: '#6366f1',
                    borderRadius: 9999,
                    height: 8,
                    width: `${(count / maxCount) * 100}%`,
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
