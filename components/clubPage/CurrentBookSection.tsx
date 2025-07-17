"use client"
import { supabase } from "@/lib/supabase";
import { Edit, MessageSquare, Eye, EyeOff, BookOpen } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, View, TouchableOpacity, Modal, SafeAreaView, ScrollView, TextInput, Text, Platform, PlatformColor } from "react-native";
import RevealNotesButton from "./RevealNotesButton";
import { Button } from "../ui/button";
import BookSelectionModal from "./BookSelectionModal";
import BookCard from "../BookCard";
import { Book } from "@/types/book";
import { ClubDetails } from "@/types/club";


interface CurrentBookSectionProps {
  club: ClubDetails;
  isAdmin: boolean;
  loadClubDetails: () => Promise<void>;
  showBookModal: () => void;
}

export default function CurrentBookSection({ loadClubDetails, club, isAdmin, showBookModal} : CurrentBookSectionProps) {
  
  // const [showBookModal, setShowBookModal] = useState(false);

  return (
    <>
    <View className="mb-6">
      <View className="flex flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold text-gray-800">Current Book</Text>
        {isAdmin && (
          <TouchableOpacity
            className="p-2"
            // onPress={() => setShowBookModal(true)}
            onPress={showBookModal}
          >
            <Edit size={16} color="rgb(59, 130, 246)" />{/* blue-500 */}
          </TouchableOpacity>
        )}
      </View>

        {club?.current_book ? (
          <View className="bg-white rounded-xl p-4 shadow-md">
            <BookCard book={club.current_book} />
        
            <RevealNotesButton initialClub={club} onUpdate={loadClubDetails} />


        </View>
      ) : (
        <View className="bg-white rounded-xl p-8 items-center shadow-md">
          <BookOpen size={48} color="rgb(156, 163, 175)" />{/* gray-400 */}
          <Text className="text-base text-gray-600 mt-3 mb-4">No current book selected</Text>
          {isAdmin && (
            <TouchableOpacity
              className="bg-blue-500 rounded-lg px-4 py-3"
              onPress={() => setShowBookModal(true)}
            >
              <Text className="text-white text-sm font-semibold">Select Book</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>

    

    </>
    
  )
}