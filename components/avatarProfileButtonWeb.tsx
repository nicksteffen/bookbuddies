import React from "react";
import { View, Text, Pressable } from "react-native";
// 'react-native-elements';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Link } from "expo-router";
import { UserCircleIcon } from "lucide-react-native";



// export default function AvatarProfileButton() {
//   return (
//     <View className="flex-row items-center">
//       <Avatar >
//         <AvatarFallback>BC</AvatarFallback>
//       </Avatar>
//       <Text className="ml-2 font-semibold">John Doe</Text>
//     </View>
//   );
// }
// 
export default function AvatarProfileButton() {
  return (
    <Link href="/account" asChild>
      <Pressable
        className="ml-4 w-10 h-10 rounded-full bg-primary-dark items-center justify-center
               border border-transparent hover:border-secondary-light hover:scale-105 active:scale-95 transition-transform duration-150"
      >
        {/* This is the placeholder content.
      You can replace the Text with an Image component for an actual avatar, 
      or use a different icon from lucide-react-native.
    */}
        <UserCircleIcon size={24} /> {/* Using Lucide icon */}
        {/* Or if you prefer initials: */}
        {/* <Text className="text-sm font-inter-semibold text-text-inverted">JD</Text> */}
      </Pressable>
    </Link>
  )
}