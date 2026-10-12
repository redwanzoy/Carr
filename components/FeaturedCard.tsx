import { formatPrice } from "@/lib/utils";
import { Car } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function FeaturedCard({ car } : { car:Car }) 
{
    const router = useRouter();

    return (
    <TouchableOpacity className="w-72 mr-2 rounded-3x1 overflow-hidden bg-white"
    style={{
        shadowColor: "#000",
        shadowOffset: {width:0, height:2},
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        opacity: car.is_sold ? 0.5 : 1,
    }}
    onPress={() => router.push(`/(root)/car/${car.id}`)}
    >
        <Image
            source={{uri: car.images[0] }}
            className="w-full h-44"
            resizeMode="cover"
        />
        
        <View className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full">
            <Text className="text-xs font-semibold text-blue-600 capitalize">
                {car.type}
            </Text>
        </View>

        {/* Sold Badge */}
        {car.is_sold && (
            <View className="absolute top-3 right-3 bg-red-500 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-white">Sold</Text>
            </View>
        )}

        <View className="p-4">
            <Text
                className="text-base font-bold text-gray-800 mb-1"
                numberOfLines={1}
            >
                {car.title}
            </Text>

            <View className="flex-row items-center gap-1 mb-3">
                <Ionicons name="location-outline" size={13} color={"#6B7280"}/>
                <Text className="text-xs text-gray-500" numberOfLines={1}>
                    {car.address}, {car.city}
                </Text>
            </View>

            <View className="flex-row items-center justify-between">
                <Text className="text-blue-600 font-bold text-base">
                    {formatPrice(car.price)}
                </Text>

                <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="speedometer-outline" size={13} color="#6B7280" />
                        <Text className="text-xs text-gray-500">
                            {car.mileage}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                        <Ionicons name="hardware-chip-outline" size={13} color="#6B7280" />
                        <Text className="text-xs text-gray-500">
                            {car.engine_size}
                        </Text>
                    </View>
                    
                </View>
            </View>
        </View>
    </TouchableOpacity>
  )
}