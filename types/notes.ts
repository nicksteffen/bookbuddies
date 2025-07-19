// types/index.ts (create this file if it doesn't exist)

export interface UserNote {
  id: number; // Or string, uuid, depending on your primary key type
  created_at: string; // ISO 8601 string
  updated_at: string | null;
  club_book_id: string; // UUID
  user_id: string; // UUID
  notes: string;
  questions: string;
  // Add any other fields from your user_book_notes table
}

export interface ClubMemberPublicView {
  user_id: string; // UUID
  display_name: string;
  profile_picture_url: string | null;
  // Add any other fields from your club_members_public_view that you fetch
}

export interface GroupedUserNote {
  userId: string;
  displayName: string;
  profilePicture: string | null;
  notes: UserNote[];
}
