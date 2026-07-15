import { useState, useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Home, BookOpen, PlusCircle, Calendar as CalendarIcon, BarChart2, User } from 'lucide-react-native'; 
import { TouchableOpacity } from 'react-native';
import api from '../../utils/api';

export default function TabLayout() {
  const router = useRouter();
  const [dueCount, setDueCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchDueCount = async () => {
      try {
        const { data } = await api.get('/learnings/stats');
        setDueCount(data.dueToday > 0 ? data.dueToday : undefined);
      } catch (e) {
        // silently fail, badge is non-critical
      }
    };
    fetchDueCount();
  }, []);

  const BAR_BG = "#1f2937";
  const BORDER_COLOR = "#374151";

  return (
    <Tabs
      screenOptions={{
        headerStyle: { 
          backgroundColor: BAR_BG, 
          borderBottomColor: BORDER_COLOR, 
          borderBottomWidth: 1,
          elevation: 0, 
          shadowOpacity: 0 
        },
        headerTintColor: '#6366f1', 
        headerRight: () => (
          <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/profile' } as any)} className="mr-4">
            <User size={22} color="#6366f1" />
          </TouchableOpacity>
        ),
        tabBarStyle: { 
          backgroundColor: BAR_BG, 
          borderTopColor: BORDER_COLOR, 
          borderTopWidth: 1,
          height: 60, 
          paddingBottom: 22,
          paddingTop: 8
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          tabBarBadge: dueCount,
          tabBarBadgeStyle: { backgroundColor: '#6366f1' },
        }}
      />
      <Tabs.Screen
        name="learnings"
        options={{
          title: 'Learnings',
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'New',
          tabBarIcon: ({ color }) => <PlusCircle size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <CalendarIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="edit"
        options={{
          href: null,
          title: 'Edit Learning',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          title: 'Settings & Profile',
        }}
      />
    </Tabs>
  );
}