import CarCard from "@/components/CarCard";
import FeaturedCard from "@/components/FeaturedCard";
import { supabase } from '@/lib/supabase';
import { Car } from '@/types';
import { useUser } from '@clerk/expo';
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {

  const { user } = useUser();
  const router = useRouter();

  const [featured, setFeatured] = useState<Car[]>([]);
  const [recommended, setRecommended] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCars = async () => {
    setLoading(true);
    
    const { data : featuredData } = await supabase
    .from("cars")
    .select("*")
    .eq("is_featured", true)
    .order("created_at", {ascending : false});

    const { data : recommendedData } = await supabase
    .from("cars")
    .select("*")
    .eq("is_featured", false)
    .order("created_at", {ascending : false});

    setFeatured(featuredData ?? []);
    setRecommended(recommendedData ?? []);
    setLoading(false);

    console.log(featured,recommended);
  };

  useFocusEffect(
    useCallback(() => {
      fetchCars();
    }, []),
  );



  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data ={recommended}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100}}
        showsVerticalScrollIndicator = {false}
        ListHeaderComponent={
          <View>

            {/*Header*/}
            <View className='flex-row items-center justify-between px-5 pt-4 pb-5'>
              <Image
              source={require("../../../assets/images/carr.png")}
              style={{width:90, height:80}}
              resizeMode="contain"
              />
              <View className="items-end">
                <Text>Hello there, </Text>
                <Text className="text-gray-900 text-base font-bold">
                  {user?.firstName ?? "User"}
                </Text>
              </View>
            </View>


            {/*Search Bar*/}
            <TouchableOpacity
            onPress={() => router.push("/(root)/(tabs)/search")}
            className="mx-5 mb-6 flex-row items-center bg-white
            rounded-2xl px-4 py-3 gap-3"
            style={{
                shadowColor: "#000",
                shadowOffset: {width:0, height:1},
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <Text className="text-gray-400 text-sm flex-1">
                Search vehicles, cities...
              </Text>

              <TouchableOpacity
                onPress={() => 
                  router.push("/(root)/(tabs)/search?openFilters=true")
                }
                className="w-8 h-8 bg-blue-600 rounded-xl items-center 
                justify-center"
              >
                <Ionicons name="options-outline" size={15} color="white"/>
              </TouchableOpacity>
            </TouchableOpacity>

            {/*Featured Section*/}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-bold px-5 mb-4">
                Featured
              </Text>
              {loading ? (
                <ActivityIndicator
                size="small"
                color="#2563EB"
                className="py-10"
                />
              ) : (
                <FlatList
                  data= {featured}
                  keyExtractor={(item) => item.id}
                  renderItem={({item}) => <FeaturedCard car = {item}
                  />}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal:20 }}
                /> 
              )}

            </View>

            {/*Recommended Header*/}
            <Text className = "text-gray-900 text-lg font-bold px-5 mb-4">
              Recommended
            </Text>
          </View>
        }

        //added for fix
        renderItem={({item}) => {
        return (
          <View className="px-5">
            <CarCard car={item}/>
          </View>
          )
        }}


        // renderItem={({item}) => (
        //   <View className = "px-5">
        //     <CarCard car={item} />
        //   </View>
        // )}
        ListEmptyComponent={
          !loading ? (
            <View className='items-center py-10'>
              <Text className='text-gray-400'>No vehicles found</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}