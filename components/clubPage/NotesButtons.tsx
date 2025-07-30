import { supabase } from '@/lib/supabase';
import { ClubDetails } from '@/types/club';
import { Eye, EyeOff, MessageSquare, BookOpen } from 'lucide-react-native'; // Import BookOpen icon
import { useEffect, useState } from 'react';
import { Platform, TouchableOpacity, Text, Alert, View } from 'react-native';
import { Link } from 'expo-router';
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

interface NotesButtonsProps {
  // Renamed from RevealNotesButtonProps
  initialClub: ClubDetails;
  onUpdate: () => Promise<void>;
  isAdmin: boolean;
  isMember: boolean;
}

export default function NotesButtons({
  // Renamed component export
  initialClub,
  onUpdate,
  isAdmin,
  isMember,
}: NotesButtonsProps) {
  const [club, setClub] = useState(initialClub);
  const [showConfirm, setShowConfirm] = useState(false);
  const revealHeader = 'Reveal Notes & Questions';
  const revealDescription =
    'This will make all member notes and questions visible to everyone in the club. This action cannot be undone.';

  useEffect(() => {
    setClub(initialClub);
  }, [initialClub]);

  const revealNotesAction = async () => {
    if (!club?.current_book_id) {
      console.error('No current book ID found to reveal notes for.');
      return new Error('No current book selected.');
    }

    const { error } = await supabase
      .from('club_books')
      .update({ notes_revealed: true })
      .eq('club_id', club.id)
      .eq('book_id', club.current_book_id);

    if (!error) {
      console.log('No error, call onUpdate');
      onUpdate();
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
            Alert.alert('Success', 'Notes and questions revealed!');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'An unknown error occurred.');
          }
        },
      },
    ]);
  };

  const notesRevealed = club?.club_books?.[0]?.notes_revealed || false;
  const clubBookIdForNotesPage = club?.club_books?.[0]?.id || null; // This is the ID of the club_book entry

  const [showNotesModal, setShowNotesModal] = useState(false);
  // const isMember = true; // Placeholder: Replace with actual logic
  // const isAdmin = true; // Placeholder: Replace with actual logic

  return (
    <>
      {Platform.OS !== 'web' && (
        <View className="flex flex-row gap-3 items-center justify-center flex-wrap">
          {' '}
          {/* flex-wrap for multiple buttons */}
          {isMember && (
            <TouchableOpacity
              className="flex-grow flex-row items-center justify-center gap-2 bg-amber-600 rounded-lg py-3 px-4 min-w-[150px]"
              onPress={() => setShowNotesModal(true)}
            >
              <MessageSquare size={16} color="rgb(255, 255, 255)" />
              <Text className="text-lg font-semibold text-white">
                My Notes & Questions
              </Text>
            </TouchableOpacity>
          )}
          {isAdmin && (
            <TouchableOpacity
              className={`flex-grow flex-row items-center justify-center gap-2 rounded-lg py-3 px-4 min-w-[150px] ${
                notesRevealed ? 'bg-emerald-500' : 'bg-primary'
              }`}
              onPress={revealNotesMobile}
              disabled={notesRevealed}
            >
              {notesRevealed ? (
                <>
                  <Eye size={16} color="rgb(16, 185, 129)" />
                  <Text className="text-white text-sm font-semibold">
                    Notes Revealed
                  </Text>
                </>
              ) : (
                <>
                  <EyeOff size={16} color="rgb(255, 255, 255)" />
                  <Text className="text-white text-sm font-semibold">
                    Reveal Notes
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {/* New: View Notes Button - Only show if notesRevealed is true */}
          {notesRevealed && clubBookIdForNotesPage && (
            <Link
              href={`/club/${club.id}/book/${club.current_book_id}`}
              asChild
            >
              {/*
            <Link
              href={{
                pathname: `/notes/[clubBookId]`,
                params: { clubBookId: clubBookIdForNotesPage },
              }}
              asChild
            > */}
              <TouchableOpacity className="flex-grow flex-row items-center justify-center gap-2 bg-amber-600 rounded-lg py-3 px-4 min-w-[150px]">
                <View className="flex-row items-center gap-2">
                  <BookOpen size={16} color="rgb(255,255,255)" />
                  <Text className="text-lg font-semibold text-white">
                    View Club Discussion
                  </Text>
                </View>
              </TouchableOpacity>
            </Link>
          )}
        </View>
      )}

      {/* Web platform rendering */}
      {Platform.OS === 'web' && (
        <View className="flex flex-row gap-3 items-center justify-center flex-wrap">
          {isMember && (
            <Button
              className="flex-grow flex-row items-center justify-center gap-2 bg-amber-600 rounded-lg py-3 px-4 min-w-[150px]"
              onClick={() => {
                setShowNotesModal(true);
              }}
            >
              <MessageSquare size={16} color="rgb(255, 255, 255)" />
              <span className="text-white text-sm font-semibold">
                My Notes & Questions
              </span>
            </Button>
          )}
          {isAdmin && (
            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
              <AlertDialogTrigger asChild>
                <Button
                  className={`flex-grow flex-row items-center justify-center gap-2 rounded-lg py-3 px-4 min-w-[150px] ${
                    notesRevealed ? 'bg-emerald-500' : 'bg-primary'
                  }`}
                  disabled={notesRevealed}
                >
                  {notesRevealed ? (
                    <>
                      <Eye size={16} color="rgb(16, 185, 129)" />
                      <Text className="text-white text-sm font-semibold">
                        Notes Revealed
                      </Text>
                    </>
                  ) : (
                    <>
                      <EyeOff size={16} color="rgb(255, 255, 255)" />
                      <Text className="text-white text-sm font-semibold">
                        Reveal Notes
                      </Text>
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                {/* ... AlertDialog content for web */}
              </AlertDialogContent>
            </AlertDialog>
          )}
          {/* New: Web View Notes Button - Only show if notesRevealed is true */}
          {notesRevealed && clubBookIdForNotesPage && (
            <Link
              href={`/club/${club.id}/book/${club.current_book_id}`}
              asChild
            >
              {/* <Link
              href={{
                pathname: `/notes/[clubBookId]`,
                params: { clubBookId: clubBookIdForNotesPage },
              }}
              asChild
            > */}
              <Button className="flex-grow flex-row items-center justify-center gap-2 bg-amber-600 rounded-lg py-3 px-4 min-w-[150px]">
                <BookOpen size={16} color="rgb(255, 255, 255)" />
                <span className="text-white text-sm font-semibold">
                  View Club Discussion
                </span>
              </Button>
            </Link>
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
