import CarCard from '@/components/CarCard'
import FilterModal from '@/components/FilterModal'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { useFilterStore } from '@/store/filterStore'
import { Car } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Search() {

  const [results, setResults] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false) 

  const { openFilters } = useLocalSearchParams<{openFilters?: string}>();

  useEffect(() => {
    if (openFilters === "true") {
      setShowFilters(true);
    }
  }, [openFilters]);

  const{
    search,
    type,
    mileage,
    minPrice,
    maxPrice,
    setSearch,
    setType,
    setMileage,
    setMinPrice,
    setMaxPrice,
  } = useFilterStore()

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const activeFilterCount = [
    type !== null,
    mileage !== null,
    minPrice !== null,
    maxPrice !== null,
  ].filter(Boolean).length;

  useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 500);

  return () => clearTimeout(timer);
  }, [search]);


  const fetchResults = useCallback (async () => {
    setLoading(true);

    let query = supabase.from("cars").select("*");

    if (debouncedSearch) {
      query = query.or(
      `title.ilike.%${debouncedSearch}%,city.ilike.%${debouncedSearch}%`
    );
    }

    if (type) {
      query = query.eq("type", type);
    }

  if (mileage) {
  if (mileage === 100001) {
    query = query.gte("mileage", 100000);
  } else {
    query = query.lte("mileage", mileage);
  }
}

    if (minPrice) {
      query = query.gte("price", minPrice);
    }

    if (maxPrice) {
      query = query.lte("price", maxPrice);
    }

    const {data} = await query.order("created_at", {
      ascending:false,
    });

    setResults(data ?? []);
    setLoading(false);
  
  }, [debouncedSearch, type, mileage, minPrice, maxPrice]);

  // useEffect(() => {
  //   fetchResults();
  // }, [fetchResults, debouncedSearch, type, mileage, minPrice, maxPrice]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);


  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-5 pb-3">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Find Car
        </Text>

        <View className="flex-row items-center gap-3">
          <View 
          className="flex-1 flex-row items-center bg-white rounded-2xl px-4 gap-3"
          style={{
            shadowColor: "#000",
            shadowOffset: {width: 0, height:1},
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation:2,
          }}
          >
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            
            <TextInput 
            className="flex-1 py-3 text-gray-800"
            placeholder="Search by title or city"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            />

            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name ="close-circle" size={18} color="#9CA3AF"/>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
          onPress={() => setShowFilters(true)}
          className={`w-12 h-12 rounded-2xl items-center justify-center $ 
            { 
              activeFilterCount > 0 ? "bg-blue-600" : "bg-white"            
            }`}
            style ={{
              shadowColor: "#000",
              shadowOffset: {width: 0, height:1},
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation:2,
            }}
          >
            <Ionicons 
              name="options-outline"
              size={20}
              color={activeFilterCount > 0 ? "#fff" : "#374151"}
            />
            {activeFilterCount > 0 && (
              <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-white text-[9px] font-bold">
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Filter Chips*/}
        {activeFilterCount > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {type && (
              <View className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 gap-1">
                <Text className="text-blue-700 text-xs font-semibold capitalize">
                  {type}
                </Text>
                <TouchableOpacity onPress={() => setType(null)}>
                  <Ionicons name="close" size={12} color="#1D4ED8" />
                </TouchableOpacity>

              </View>
            )}

            {mileage !== null && (
              <View className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 gap-1">
                <Ionicons name= "speedometer-outline" size={11} color="#1D4ED8"/>
                <Text className="text-blue-700 text-xs font-semibold capitalize">
                  {mileage === 100000
                    ? "100k+ km" 
                    : mileage
                      ? `Under ${mileage /1000}k km`
                      : "Any mileage"}
                </Text>
                <TouchableOpacity onPress={() => setMileage(null)}>
                  <Ionicons name="close" size={12} color="#1D4ED8" />
                </TouchableOpacity>

              </View>
            )}

            {(minPrice !== null || maxPrice !== null) && (
              <View className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 gap-1">
                <Text className="text-blue-700 text-xs font-semibold capitalize">
                  {minPrice && maxPrice
                    ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
                    : minPrice
                      ? `From ${formatPrice(minPrice)}`
                      : `Up to ${formatPrice(maxPrice!)}`}
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setMinPrice(null);
                    setMaxPrice(null);
                  }}
                >
                  <Ionicons name="close" size={12} color="#1D4ED8" />
                </TouchableOpacity>

              </View>
            )}
          </View>
        )}

      </View>

      {/* Results */}
      <FlatList
        data ={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100}}
        showsVerticalScrollIndicator = {false}
        ListHeaderComponent={
          <Text className="text-sm text-gray-400 mb-4">
            { loading ? "Searching..." : `${results.length} cars found` }
          </Text>

        }
              //added for fix
        renderItem={({item}) => {
        return (
        <CarCard car={item}/>
        )
        }}
      
        // renderItem={({item}) => (
        //     <CarCard car={item} />
        // )}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-10">
              <Text className="text-gray-400">No vehicles found</Text>
              <Text className="text-gray-300 text-sm mt-1">
                Try different search or adjust filters

              </Text>
            </View>
            ) : (
              <ActivityIndicator size = "large" color="#2563EB"
              className="py-20" />
            )
            }
      />

      {/* Filter Modal */}
      <FilterModal
        visible ={showFilters}
        onClose={() =>setShowFilters(false)}
      />

    </SafeAreaView>

  );
}