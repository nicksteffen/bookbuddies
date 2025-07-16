import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ClubBook, ClubDetails, UserNotes } from "@/types/club";
import { use, useEffect, useState } from "react";
import { Modal, SafeAreaView, View, TouchableOpacity, ScrollView, TextInput, Text} from "react-native";



interface NotesModalProps {
  initialShowNotesModal: boolean;
  hideNotesModal: () => void; 
  initialClubDetails: ClubDetails;
  
}

export default function NotesModal ({initialShowNotesModal, initialClubDetails, hideNotesModal}: NotesModalProps) {
  
  const [userNotes, setUserNotes] = useState<UserNotes | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(initialShowNotesModal);
  const { user } = useAuth();
  const [clubDetails, setClubDetails] = useState<ClubDetails | null>(initialClubDetails);
  console.log("on load club details")
  console.log(clubDetails)
  
  // notes modal needs clubbookdata
  // club_books by clubId and club.current_book_id
  // user_book_notes by userId and clubBookData.id
  
  const loadUserNotes = async () => {
    if (!user || !clubDetails || !clubDetails.club_books) return;
    const clubBookDataId = clubDetails.club_books.filter((book: ClubBook) =>
      book.book_id === clubDetails.current_book_id)?.[0]?.id;
    
    console.log("load notes")
    console.log("got clubdata book id")
    console.log(clubBookDataId)

    //   if (clubBookData) {
    const { data } = await supabase
      .from('user_book_notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('club_book_id', clubBookDataId)
      .single();

    if (data) {
      console.log("setting")
      setUserNotes(data);
      setNotesForm({
        notes: data.notes,
        questions: data.questions || '',
      });
    }
  };

  


  const saveNotes = async () => {
    if (!user || !clubDetails) return;
    console.log("save notes")
    // if (!club?.current_book_id) return;
      try {
        
        const clubBookDataId = clubDetails.club_books.filter((book: ClubBook) =>
          book.book_id === clubDetails.current_book_id)?.[0]?.id;
        console.log("details")
        console.log(clubDetails)
        console.log("club book data id")
        console.log(clubBookDataId)

      // const { data: clubBookData } = await supabase
      //   .from('club_books')
      //   .select('id')
      //   .eq('club_id', bookClubId)
      //   .eq('book_id', club.current_book_id)
      //   .single();

      // if (!clubBookData) return;

      if (userNotes) {
        console.log("do update")
        // Update existing notes
        const { error } = await supabase
          .from('user_book_notes')
          .update({
            notes: notesForm.notes,
            questions: notesForm.questions || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userNotes.id);

        if (error) throw error;
      } else {
        // Create new notes
        const { error } = await supabase.from('user_book_notes').insert({
          user_id: user?.id!,
          club_book_id: clubBookDataId,
          notes: notesForm.notes,
          questions: notesForm.questions || null,
        });

        if (error) throw error;
      }

      // setShowNotesModal(false);
      loadUserNotes();
      hideNotesModal();
      // Alert.alert('Success', 'Notes saved!');
    } catch (error: any) {
      console.log(error)
      // Alert.alert('Error', error.message);
    }
  };
  
  useEffect(() => {
    
    setShowNotesModal(initialShowNotesModal)
    loadUserNotes();
    
  }, [initialShowNotesModal] )
  
  const [notesForm, setNotesForm] = useState({
    notes: '',
    questions: '',
  });
  const saveNotes1 = () => {
    
    console.log("save")
    
    
    hideNotesModal()
  }
  
  
  return (
    <Modal
      visible={showNotesModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
          <TouchableOpacity
            onPress={() =>
              hideNotesModal()}>
            <Text className="text-base text-gray-600">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">My Notes & Questions</Text>
          <TouchableOpacity onPress={saveNotes}>
            <Text className="text-base text-blue-500 font-semibold">Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-5">
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-800 mb-2">Notes</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50 h-30 align-text-top"
              placeholder="Your thoughts, observations, favorite quotes..."
              value={notesForm.notes}
              onChangeText={(text) =>
                setNotesForm({ ...notesForm, notes: text })
              }
              multiline
              numberOfLines={6}
            />
          </View>

          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-800 mb-2">Discussion Questions</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50 h-30 align-text-top"
              placeholder="Questions you'd like to discuss with the group..."
              value={notesForm.questions}
              onChangeText={(text) =>
                setNotesForm({ ...notesForm, questions: text })
              }
              multiline
              numberOfLines={4}
            />
          </View>

          <View className="bg-blue-50 rounded-lg p-4 mt-4">
            <Text className="text-sm text-blue-800 text-center">
              🔒 Your notes and questions are private until the admin reveals
              them for group discussion.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}