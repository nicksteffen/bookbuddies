import { Book } from "./book";

export interface Member {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
  public_profiles: {
    display_name: string | null;
    email: string;
  };
}

export interface ClubBook {
  id: string;
  club_id?: string;
  book_id: string;
  status: 'current' | 'past';
  notes_revealed: boolean;
  average_rating: number | null;
  created_at: string;
};

export interface PublicClubMember {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
  public_profiles: {
    display_name: string | null;
    profile_picture_url: string | null;
  };
}

export interface UserNotes {
  id: string;
  notes: string;
  questions: string | null;
  updated_at: string;
}


export interface ClubDetails {
  id: string;
  name: string;
  description: string | null;
  privacy: 'public' | 'private' | 'secret';
  admin_user_id: string;
  current_book_id: string | null;
  created_at: string;
  // current_book?: {
  //   id: string;
  //   title: string;
  //   author: string;
  //   cover_url: string | null;
  //   synopsis: string | null;
  //   page_count: number | null;
  // } | null;
    current_book? : Book | null;
  club_books?: {
    id: string;
    notes_revealed: boolean;
    average_rating: number | null;
    book_id: string;
  }[];
}
