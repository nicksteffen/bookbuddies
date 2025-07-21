import { ClubMemberPublicView, GroupedUserNote, UserNote } from "@/types/notes";
import { supabase } from "../supabase";

export async function getGroupedNotesByMember(clubBookId: string): Promise<GroupedUserNote[]> {
  // 1. Fetch all user_book_notes for the given club_book_id,
  //    and directly join the public_profiles table for display_name and profile_picture_url.
  //    Supabase will return public_profiles as a nested object within each note.
  const { data: userNotes, error: notesError } = await supabase
    .from('user_book_notes')
    .select(`
      *,
      public_profiles(display_name, profile_picture_url)
    `)
    .eq('club_book_id', clubBookId)
    // .returns<UserNote[]>(); // Assert the return type based on the new UserNote structure

  if (notesError) {
    console.error("Error fetching user notes:", notesError);
    return [];
  }

  if (!userNotes || userNotes.length === 0) {
    console.log("No user notes found for this club book.");
    return [];
  }

  // The second query to 'club_members_public_view' is now redundant and removed.
  // The public profile data is already available via the join in the first query.

  // 2. Group notes by user and prepare the final structured data.
  //    We'll use a Map to efficiently build the grouped structure.
  const groupedNotesMap = new Map<string, GroupedUserNote>();

  userNotes.forEach(note => {
    const userId = note.user_id;
    let userGroup = groupedNotesMap.get(userId);

    // Get the joined public profile data for this note
    const publicProfile: PublicProfileJoined | null | undefined = note.public_profiles;

    if (!userGroup) {
      // If this is the first note for this user, create their group entry
      const displayName = publicProfile?.display_name || 'Unknown User';
      const profilePicture = publicProfile?.profile_picture_url || null;

      userGroup = {
        userId: userId,
        displayName: displayName,
        profilePicture: profilePicture,
        notes: [], // Initialize an empty array for notes
      };
      groupedNotesMap.set(userId, userGroup);
    }

    // Add the current note to this user's notes array.
    // The 'note' object already contains the public_profiles data if you need it later.
    userGroup.notes.push(note);
  });

  // 3. Convert the Map values into an array for rendering (e.g., with FlatList).
  const finalGroupedData = Array.from(groupedNotesMap.values());

  // Optional: Sort users by display name or some other criteria
  finalGroupedData.sort((a, b) => a.displayName.localeCompare(b.displayName));

  return finalGroupedData;
}