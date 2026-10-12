import { useSavedCar } from "@/hooks/useSavedCar";
import { useSupabase } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import { formatPrice } from "@/lib/utils";
import { useUserStore } from '@/store/userStore';
import { Car } from '@/types';
import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Linking, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ImageViewing from "react-native-image-viewing";
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from "react-native-webview";


const {width} = Dimensions.get("window");
const ADMIN_PHONE = "01312740417"

export default function CarDetails() {
    
    const {id} = useLocalSearchParams<{id: string}>();
    const {userId} = useAuth();
    const router = useRouter();
    const isAdmin = useUserStore((state) => state.isAdmin);

    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const [imageViewerVisible, setImageViewerVisible] = useState(false);

    const authSupabase = useSupabase();
    const { isSaved, saveLoading, toggleSave } = useSavedCar(id ?? "");

    const fetchCars = async () => {
        const {data} = await supabase
            .from("cars")
            .select("*")
            .eq("id", id)
            .single();
        
        setCar(data);
        setLoading(false)
    };

    useEffect(() => {
        fetchCars();
    }, [id]);

    const onScroll = ( e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        setActiveIndex(index);
    };

    
    const handleContact = () => {
        const message = `Hi! I'm interested in the car: ${car?.title}`;
        const url = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(
        message
        )}`;
        Linking.openURL(url);
    };

    const handleMarkSold = () => {
        Alert.alert("Mark as Sold", "Are you sure?" , [
            {text:"Cancel", style:"cancel"},
            {
                text:"Mark Sold",
                onPress: async() => {
                    await authSupabase
                        .from("cars")
                        .update({is_sold:true})
                        .eq("id", id);
                    setCar((prev) => (prev ? {...prev, is_sold:true} : prev));
                },
            },
        ]);
    };

    const handleDelete = () => {
        Alert.alert("Delete car", "Are you sure?", [
            { text: "Cancel", style: "cancel"},
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    await authSupabase
                        .from("cars")
                        .delete()
                        .eq("id", id);
                    router.replace("/(root)/(tabs)");
                },
            },
        ]);
    };






    if(!car) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text className="text-gray-500">Car not found</Text>
            </View>
        );
    }

    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    car.longitude - 0.003
    }%2C${car.latitude - 0.003}%2C${car.longitude + 0.003}%2C${
    car.latitude + 0.003
    }&layer=mapnik&marker=${car.latitude}%2C${car.longitude}`;

    const isLongDesc = (car.description?.length ?? 0) > 150;
    const displayDesc =
            expanded || !isLongDesc
            ? car.description
            : car.description?.slice(0,150) + "...";

  return (
    <View className="flex-1 bg-white">
        <ScrollView showsVerticalScrollIndicator ={false}>
            <View>
                <View style= {{ opacity: car.is_sold ? 0.5 : 1}}>
                    <FlatList
                        data = {car.images}
                        keyExtractor={(_,i) => i.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity onPress={() => setImageViewerVisible(true)}>
                                <Image
                                    source = {{ uri : item}}
                                    style = {{width, height: 300}}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        )}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                    />
                </View>

                {/*Image count badge*/}
                <View className="absolute bottom-3 right-4 bg-black/50 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-medium">
                        {activeIndex +1} / {car.images.length}
                    </Text>
                </View>

                <SafeAreaView className="absolute top-0 left-0 right-0">
                    <View className="flex-row items-center justify-between px-4 pt-2">
                        <TouchableOpacity
                            onPress={toggleSave}
                            disabled={saveLoading}
                            className="w-10 h-10 bg-white rounded-full items-center justify-center"
                            style={{ elevation:3 }}
                        >
                            <Ionicons 
                                name={isSaved ? "heart" : "heart-outline"}
                                size={20} 
                                color={isSaved ? "EF4444" : "#111827"}
                            />
                        </TouchableOpacity>

                    </View>

                </SafeAreaView>
            </View> 

            <View
                className="px-5 pt-5 pb-8"
                style={{opacity: car.is_sold ? 0.6 :1 }}
            >
                <View className="flex-row gap-2 mb-3 flex-wrap">
                    <View className="bg-blue-50 px-3 py-1 rounded-full">
                        <Text className="text-blue-600 text-xs font-semibold capitalize">
                            {car.type}
                        </Text>
                    </View>

                    {car.is_featured && (
                        <View className="bg-amber-50 px-3 py-1 rounded-full">
                            <Text className="text-amber-600 text-xs font-semibold">
                                🌟Featured
                            </Text>
                        </View>
                    )}

                    {car.is_sold && (
                        <View className="bg-red-50 px-3 py-1 rounded-full">
                            <Text className="text-red-500 text-xs font-semibold">
                                Sold
                            </Text>
                        </View>
                    )}
                </View>

                <Text className="text-2xl font-bold text-gray-900 mb-1">
                    {car.title}
                </Text>
                
                <Text className="text-blue-600 text-xl font-bold mb-4">
                    {formatPrice(car.price)} 
                </Text>

                <View className="flex-row justify-between bg-gray-50 rounded-2xl p-4 mb-5">
                    <SpecItem
                        icon = "speedometer-outline"
                        label="Mileage"
                        value={`${car.mileage}`}
                    />
                    <SpecItem
                        icon = "hardware-chip-outline"
                        label="Engine Size"
                        value={`${car.engine_size}`}
                    />
                    <SpecItem
                        icon = "calendar-outline"
                        label="Year"
                        value={`${car.year}`}
                    />
                    <SpecItem 
                        icon="car-outline" 
                        label="Type"
                        value={car.type}
                    />
                </View>

                <Text className="text-base font-bold text-gray-900 mb-2">
                    Description
                </Text>

                <Text className="text-gray-500 text-sm leading-6 mb-1">
                    {displayDesc}
                </Text>

                {isLongDesc && (
                    <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                        <Text className="text-blue-600 text-sm font-medium mb-5">
                            {expanded ? "Show less" : "Read more"}
                        </Text>
                    </TouchableOpacity>
                )}

                <Text className="text-base font-bold text-gray-900 mb-2 mt-5">
                    Location
                </Text>

                <View className="flex-row items-center gap-2 mb-4">
                    <Ionicons name="location-outline" size={16} color="#6B7280"/>
                    <Text className="text-gray-500 text-sm flex-1">
                        {car.address}, {car.city}
                    </Text>
                </View>
                
                <TouchableOpacity
                    onPress={() =>
                        router.push({
                            pathname: "/(root)/car/map",
                            params: {
                                latitude: car.latitude,
                                longitude: car.longitude,
                                title: car.title,
                                address: `${car.address}, ${car.city}`,
                            },
                        })
                    }
                    activeOpacity={0.9}
                    className="rounded-2xl overflow-hidden mb-6"
                    style={{height:200}}
                >
                    <WebView
                        source={{uri: mapUrl}}
                        style={{flex:1}}
                        scrollEnabled={false}
                        pointerEvents="none"
                    />
                    <View className="absolute bottom-3 right-3 bg-white/90 px-3 py-1 rounded-full flex-row items-center gap-1">
                        <Ionicons name="expand-outline" size={12} color="#374151"/>
                        <Text className="text-gray-600 text-xs font-medium">
                            Tap to expand
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={handleContact}
                    className="flex-row items-center justify-center gap-2 bg-green-600 py-4 rounded-2xl mb-4"
                >
                    <Ionicons name="logo-whatsapp" size={20} color="white"/>
                    <Text className="text-white font-bold text-base">
                        Contact Agent
                    </Text>
                </TouchableOpacity>

                {isAdmin && (
                    <View className="flex-row gap-3">
                        {!car.is_sold && (
                            <TouchableOpacity
                                onPress={handleMarkSold}
                                className="flex-1 flex-row items-center justify-center gap-2 bg-amber-50 py-4 rounded-2xl border border-amber-200"
                            >
                                <Ionicons
                                    name="checkmark-circle-outline"
                                    size={18}
                                    color="#D97706"
                                />
                                <Text className="text-amber-600 font-semibold">
                                    Mark Sold
                                </Text>
                            </TouchableOpacity>
                        )}
                            <TouchableOpacity
                                onPress={handleDelete}
                                className="flex-1 flex-row items-center justify-center gap-2 bg-red-50 py-4 rounded-2xl border border-red-200"
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={18}
                                    color="#EF4444"
                                />
                                <Text className="text-red-600 font-semibold">
                                    Delete
                                </Text>
                            </TouchableOpacity>
                    </View>
                )}
            </View>    
        </ScrollView>

        <ImageViewing
            images={car.images.map((uri) => ({uri}))}
            imageIndex={activeIndex}
            visible={imageViewerVisible}
            onRequestClose={() => setImageViewerVisible(false)}
        />
    </View>
  );
}


function SpecItem({
    icon,
    label,
    value,
} : {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
}) {

    return (
        <View className="items-center gap-1">
            <Ionicons name= {icon} size={20} color="#2563EB"/>
            <Text className="text-gray-900 font-bold text-sm">{value}</Text>
            <Text className="text-gray-400 text-xs">{label}</Text>
        </View>
    );
}