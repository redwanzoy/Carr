import CarCard from '@/components/CarCard';
import { useSupabase } from '@/hooks/useSupabase';
import { Car } from '@/types';
import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SavedCar {
  id: string;
  car_id: string;
  cars: Car;
}


export default function Saved() {
  const { userId } = useAuth();
  const authSupabase = useSupabase();
  const supabaseRef = useRef(authSupabase);

  const [saved, setSaved] = useState<SavedCar[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const {data} = await supabaseRef.current
      .from("saved_cars")
      .select("id, car_id, cars(*)")
      .eq("user_clerk_id", userId)
      .order("id", {ascending: false});
    

    setSaved((data as unknown as SavedCar[]) ?? []);
    setLoading(false);
  }, [userId]);


  useFocusEffect(
    useCallback(() => {
      fetchSaved();
    }, [fetchSaved]),
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-5 pb-3">
        <Text className="text-2xl font-bold text-gray-900">Saved</Text>
        {!loading && (
          <Text className="text-sm text-gray-400 mt-1">
            {saved.length} {saved.length === 1 ? "car" : "cars"}
            {" "}
            saved
          </Text>
        )}
      </View>


      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB"/>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          contentContainerStyle= {{ padding: 20, paddingBottom: 100}}
          showsVerticalScrollIndicator = {false}
          renderItem={({item}) => (
            <CarCard
              car={item.cars}
              onUnsave={() =>
                setSaved((prev) => prev.filter((s) => s.id !== item.id))
              }
              showSave
            />
          )}

          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-24">
              <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-4">
                <Ionicons name="heart-outline" size={36} color="#EF4444"/>
              </View>
              <Text className="text-gray-700 text-lg font-bold mb-1">
                No saved cars
              </Text>
              <Text className="text-gray-400 text-sm text-center px-8">
                Tap the heart icon on any car to save it here
              </Text>
            </View>
          }


        />
      )}


    </SafeAreaView>

  )
}