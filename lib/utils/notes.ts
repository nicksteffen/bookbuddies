import { ClubMemberPublicView, GroupedUserNote, UserNote } from "@/types/notes";
import { supabase } from "../supabase";

export async function getGroupedNotesByMember(clubBookId: string): Promise<GroupedUserNote[]> {
  // 1. Fetch all user_book_notes for the given club_book_id
  const { data: userNotes, error: notesError } = await supabase
    .from('user_book_notes')
    .select('*')
    .eq('club_book_id', clubBookId);
  
    // .returns<UserNote[]>(); // Assert the return type

  if (notesError) {
    console.error("Error fetching user notes:", notesError);
    return [];
  }

  if (!userNotes || userNotes.length === 0) {
    console.log("No user notes found for this club book.");
    return [];
  }

  // 2. Extract all unique user_ids from the fetched notes
  const uniqueUserIds = [...new Set(userNotes.map(note => note.user_id))];

  // 3. Fetch all relevant club_members_public_view entries in a single query
  const { data: clubMembers, error: membersError } = await supabase
    .from('club_members_public_view')
    .select('user_id, display_name, profile_picture_url')
    .in('user_id', uniqueUserIds) // Filter to only fetch relevant members
    // .returns<ClubMemberPublicView[]>(); // Assert the return type
    ;

  if (membersError) {
    console.error("Error fetching club member profiles:", membersError);
    return []; // Handle this error as you see fit
  }

  // 4. Create a Map for efficient lookup of member info by user_id
  const memberInfoMap = new Map<string, { displayName: string; profilePicture: string | null }>();
  if (clubMembers) {
    clubMembers.forEach(member => {
      memberInfoMap.set(member.user_id, {
        displayName: member.display_name,
        profilePicture: member.profile_picture_url,
      });
    });
  }

  // 5. Group notes by user and prepare the final structured data
  const groupedNotesMap = new Map<string, GroupedUserNote>();

  userNotes.forEach(note => {
    const userId = note.user_id;
    let userGroup = groupedNotesMap.get(userId);

    if (!userGroup) {
      const memberInfo = memberInfoMap.get(userId) || {
        displayName: 'Unknown User',
        profilePicture: null,
      };
      userGroup = {
        userId: userId,
        displayName: memberInfo.displayName,
        profilePicture: memberInfo.profilePicture,
        notes: [],
      };
      groupedNotesMap.set(userId, userGroup);
    }

    userGroup.notes.push(note);
  });

  // 6. Convert the Map values into an array for rendering
  const finalGroupedData = Array.from(groupedNotesMap.values());

  finalGroupedData.sort((a, b) => a.displayName.localeCompare(b.displayName));

  return finalGroupedData;
}