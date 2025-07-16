"use client"
import { supabase } from "@/lib/supabase";
import { Edit, MessageSquare, Eye, EyeOff, BookOpen } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, View, TouchableOpacity, Modal, SafeAreaView, ScrollView, TextInput, Text, Platform, PlatformColor } from "react-native";
import RevealNotesButton from "./RevealNotesButton";
import { Button } from "../ui/button";
import BookSelectionModal from "./BookSelectionModal";

interface ClubDetails {
  id: string;
  name: string;
  description: string | null;
  privacy: 'public' | 'private' | 'secret';
  admin_user_id: string;
  current_book_id: string | null;
  created_at: string;
  current_book?: {
    id: string;
    title: string;
    author: string;
    cover_url: string | null;
    synopsis: string | null;
    page_count: number | null;
  } | null;
  club_books?: {
    id: string;
    notes_revealed: boolean;
    average_rating: number | null;
  }[];
}

interface CurrentBookSectionProps {
  initialClub: ClubDetails;
  isAdmin: boolean;
  isMember: boolean;
  bookClubId: string;
  loadClubDetails: () => Promise<void>;
}

export default function CurrentBookSection({ loadClubDetails, initialClub, isAdmin, isMember, bookClubId } : CurrentBookSectionProps) {
  
  const [showBookModal, setShowBookModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [club, setClub] = useState<ClubDetails>(initialClub);
  // const [notesRevealed, setNotesRevealed] = useState(false);
  useEffect(() => {
    console.log("ciurrent section use effect")
   // loadClubDetails() 
    setClub(initialClub);

  }, [initialClub]);

  return (
    <>
    <View className="mb-6">
      <View className="flex flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold text-gray-800">Current Book</Text>
        {isAdmin && (
          <TouchableOpacity
            className="p-2"
            onPress={() => setShowBookModal(true)}
          >
            <Edit size={16} color="rgb(59, 130, 246)" />{/* blue-500 */}
          </TouchableOpacity>
        )}
      </View>

      {club?.current_book ? (
        <View className="bg-white rounded-xl p-4 shadow-md">
          <View className="flex flex-row gap-4 mb-4">
            {club.current_book.cover_url ? (
              <Image
                source={{ uri: club.current_book.cover_url }}
                className="w-20 h-30 rounded-lg"
              />
            ) : (
              <View className="w-20 h-30 bg-gray-200 rounded-lg justify-center items-center">
                <Text className="text-3xl">📚</Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800 mb-1">
                {club.current_book.title}
              </Text>
              <Text className="text-base text-gray-600 mb-2">
                {club.current_book.author}
              </Text>
              {club.current_book.page_count && (
                <Text className="text-sm text-gray-400 mb-2">
                  {club.current_book.page_count} pages
                </Text>
              )}
              {club.current_book.synopsis && (
                <Text className="text-sm text-gray-600 leading-5" numberOfLines={3}>
                  {club.current_book.synopsis}
                </Text>
              )}
            </View>
          </View>
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
    <BookSelectionModal
      isVisible={showBookModal}
      onClose={() => setShowBookModal(false)}
      bookClubId={bookClubId}
      onBookSelected={loadClubDetails}
    />
    

    </>
    
  )
}