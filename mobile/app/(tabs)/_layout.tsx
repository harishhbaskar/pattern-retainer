import { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Home, PlusCircle, Calendar as CalendarIcon, BarChart2, LogOut } from 'lucide-react-native'; 
import { TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function TabLayout() {
  const { signOut } = useAuth();
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
          headerRight: () => (
            <TouchableOpacity onPress={signOut} className="mr-4">
              <LogOut size={20} color="#ef4444" />
            </TouchableOpacity>
          ),
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
        name="add"
        options={{
          title: 'New',
          tabBarIcon: ({ color }) => <PlusCircle size={24} color={color} />,
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
        }}
      />
    </Tabs>
  );
}