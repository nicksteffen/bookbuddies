//todo import ffrom types

import { supabase } from '@/lib/supabase';
import { ClubDetails } from '@/types/club';
import { Eye, EyeOff, MessageSquare } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Platform, TouchableOpacity, Text, Alert, View } from 'react-native';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import NotesModal from './NotesModal';

interface RevealNotesButtonProps {
  initialClub: ClubDetails;
  onUpdate: () => Promise<void>;
}

export default function RevealNotesButton({
  initialClub, onUpdate
}: RevealNotesButtonProps) {
  const [club, setClub] = useState(initialClub);
  const [showConfirm, setShowConfirm] = useState(false);
  const revealHeader = 'Reveal Notes & Questions';
  const revealDescription =
    'This will make all member notes and questions visible to everyone in the club. This action cannot be undone.';
  
  useEffect(() => {
    setClub(initialClub);
  }, [initialClub]);
  
  
  const revealNotesAction = async () => {
    const { error } = await supabase
      .from('club_books')
      .update({ notes_revealed: true })
      .eq('club_id', club.id)
      .eq('book_id', club?.current_book_id);
    if (!error) {
      console.log("no error, call onUpdate")
      onUpdate();
      // loadClubDetails();
      // console.log('mock load club details');
    }
    return error;
  };

  const revealNotesMobile = async () => {
    if (!club?.current_book_id) return;
    console.log('revealNotes');
    Alert.alert(revealHeader, revealDescription, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reveal',
        style: 'destructive',
        onPress: async () => {
          try {
            const error = await revealNotesAction();
            if (error) throw error;
            // loadClubDetails();
            Alert.alert('Success', 'Notes and questions revealed!');
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };
  const notesRevealed = club?.club_books?.[0]?.notes_revealed || false;
  const [showNotesModal, setShowNotesModal] = useState(false);
  const isMember = true;
  const isAdmin = true;

  if (Platform.OS !== 'web') {
    return (
      <>
        {isMember && (
          <View className="flex flex-row gap-3">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 bg-amber-600 rounded-lg py-3"
              onPress={() => setShowNotesModal(true)}
            >
              <MessageSquare size={16} color="rgb(255, 255, 255)" />
              {/* white */}
              <Text 
                className="text-lg font-semibold text-gray-800">
                {'My Notes & Questions'}
              </Text>
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity
                className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg py-3 ${
                  notesRevealed ? 'bg-emerald-500' : 'bg-primary'
                }`}
                onPress={revealNotesMobile}
                disabled={notesRevealed}
              >
                {notesRevealed ? (
                  <>
                    <Eye size={16} color="rgb(16, 185, 129)" />
                    {/* emerald-500 */}
                    <Text className="text-white text-sm font-semibold">
                      Notes Revealed
                    </Text>
                  </>
                ) : (
                  <>
                    <EyeOff size={16} color="rgb(255, 255, 255)" />
                    {/* white */}
                    <Text className="text-white text-sm font-semibold">
                      Reveal Notes
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        <NotesModal 
        hideNotesModal={() => setShowNotesModal(false)}
        initialClubDetails={club}
        initialShowNotesModal={showNotesModal} 
        />
        
      </>
    );
  }

  return (
    <>
      <div> {showNotesModal}</div>
      {isMember && (
        <div className="flex flex-row gap-3">
          <Button
            className="flex-1 flex-row items-center justify-center gap-2 bg-amber-600 rounded-lg py-3"
            onClick={() => {
              setShowNotesModal(true);
            }}
          >
            <MessageSquare size={16} color="rgb(255, 255, 255)" />
            {/* white */}
            <span
              className="text-white text-sm font-semibold">
                My Notes & Questions
            </span>
          </Button>
          {isAdmin && (
            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
              <AlertDialogTrigger asChild>
                <Button
                  className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg py-3 ${
                    notesRevealed ? 'bg-emerald-500' : 'bg-primary'
                  }`}
                  disabled={notesRevealed}
                >
                  {notesRevealed ? (
                    <>
                      <Eye size={16} color="rgb(16, 185, 129)" />
                      {/* emerald-500 */}
                      <Text className="text-white text-sm font-semibold">
                        Notes Revealed
                      </Text>
                    </>
                  ) : (
                    <>
                      <EyeOff size={16} color="rgb(255, 255, 255)" />
                      {/* white */}
                      <Text className="text-white text-sm font-semibold">
                        Reveal Notes
                      </Text>
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{revealHeader}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {revealDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      const error = await revealNotesAction();
                      if (error) {
                        console.log('show some sort of error messate');
                        window.alert(
                          'An error occurred while revealing notes.',
                        );
                        // Handle error
                      }
                    }}
                  >
                    Reveal
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}
      <div hidden={!showNotesModal}> Show </div>
      <button onClick={() => setShowNotesModal(false)}>
        Hide Notes
      </button>
      <button onClick={() => setShowNotesModal(true)}>
        show Notes
      </button>

      <NotesModal 
      hideNotesModal={() => setShowNotesModal(false)}
      initialClubDetails={club}
      initialShowNotesModal={showNotesModal} 
      />
      
    </>
  );
}
