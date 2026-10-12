import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";
import { useSupabase } from "./useSupabase";


export function useSavedCar(
    carId: string,
    onUnsave?: () => void){
        const { userId } = useAuth();
        const authSupabase = useSupabase();

        const [isSaved, setIsSaved] = useState(false);
        const [saveLoading, setSaveLoading] = useState(false);

        const checkIfSaved = async () => {
            if (!userId) return;

            const { data } = await authSupabase
                .from("saved_cars")
                .select("id")
                .eq("user_clerk_id", userId)
                .eq("car_id", carId)
                .single();
            
                setIsSaved(!!data);
        };

        useEffect(() => {
            checkIfSaved();
        }, [carId, userId]);

        const toggleSave = async () => {
            if (!userId || saveLoading) return;
            setSaveLoading(true);

            if(isSaved) {
                await authSupabase
                    .from("saved_cars")
                    .delete()
                    .eq("user_clerk_id", userId)
                    .eq("car_id", carId);

                setIsSaved(false);
                onUnsave?.();
            } else {
                await authSupabase.from("saved_cars").insert({
                    user_clerk_id: userId,
                    car_id: carId,
                });
                setIsSaved(true);
            }

            setSaveLoading(false);
        };

        return { isSaved, saveLoading, toggleSave };

       
}