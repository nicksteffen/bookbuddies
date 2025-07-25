"use client"
import { Edit, MessageSquare, Eye, EyeOff, BookOpen } from "lucide-react-native";
import { View, TouchableOpacity,  Text } from "react-native";
import RevealNotesButton from "./RevealNotesButton";
import { ClubDetails } from "@/types/club";
import { Link } from 'expo-router'
import BookCard from "../BookCard";
import NotesButtons from "./NotesButtons";


interface CurrentBookSectionProps {
  club: ClubDetails;
  isAdmin: boolean;
  loadClubDetails: () => Promise<void>;
  showBookModal: () => void;
  isMember: boolean;
}

export default function CurrentBookSection({ loadClubDetails, club, isAdmin, showBookModal, isMember} : CurrentBookSectionProps) {
  const current_club_book = club?.club_books?.find(
    book => book.book_id === club.current_book_id);

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
        
            <NotesButtons initialClub={club} onUpdate={loadClubDetails} isAdmin={isAdmin} isMember={isMember}  />
        </View> 
      ) : (
        <View className="bg-white rounded-xl p-8 items-center shadow-md">
          <BookOpen size={48} color="rgb(156, 163, 175)" />{/* gray-400 */}
          <Text className="text-base text-gray-600 mt-3 mb-4">No current book selected</Text>
          {isAdmin && (
            <TouchableOpacity
              className="bg-blue-500 rounded-lg px-4 py-3"
              onPress={showBookModal}
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