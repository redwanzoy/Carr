// import { useAuth } from '@clerk/expo';
// import { Redirect, Slot } from 'expo-router';

// export default function RootLayout() {
//     const{ isSignedIn, isLoaded} = useAuth();

//     //Sync Clerk user -> Supabase (build later)

//     if (!isLoaded) return null;
//     if (isSignedIn) return <Redirect href={"/"}/>;
    

//     return <Slot/> ;
// }

import { Slot } from "expo-router";

export default function RootLayout() {
  return <Slot />;
}