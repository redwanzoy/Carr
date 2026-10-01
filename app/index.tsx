import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";


// export default function Index() {

//   const {isSignedIn, isLoaded} = useAuth();

//   if (!isLoaded) return null;

//   //Redirect based on auth state
//   if (isSignedIn) return <Redirect href="/(root)/(tabs)"/>;

//   return <Redirect href="/sign-up"/>;
// }


export default function Index() {

  const {isSignedIn, isLoaded} = useAuth();

  console.log("AUTH:", {isLoaded, isSignedIn});

  if (!isLoaded) return null;

  if (isSignedIn) return <Redirect href="/(root)/(tabs)" />;

  return <Redirect href="/sign-in" />;
}