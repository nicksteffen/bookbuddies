export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          profile_picture_url: string | null;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          profile_picture_url?: string | null;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          profile_picture_url?: string | null;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      book_clubs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          privacy: 'public' | 'private' | 'secret';
          admin_user_id: string;
          current_book_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          privacy: 'public' | 'private' | 'secret';
          admin_user_id: string;
          current_book_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          privacy?: 'public' | 'private' | 'secret';
          admin_user_id?: string;
          current_book_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      club_members: {
        Row: {
          id: string;
          club_id: string;
          user_id: string;
          status: 'pending' | 'approved' | 'declined';
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          user_id: string;
          status?: 'pending' | 'approved' | 'declined';
          created_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          user_id?: string;
          status?: 'pending' | 'approved' | 'declined';
          created_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          isbn: string | null;
          cover_url: string | null;
          synopsis: string | null;
          page_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          isbn?: string | null;
          cover_url?: string | null;
          synopsis?: string | null;
          page_count?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          isbn?: string | null;
          cover_url?: string | null;
          synopsis?: string | null;
          page_count?: number | null;
          created_at?: string;
        };
      };
      book_suggestions: {
        Row: {
          id: string;
          club_id: string;
          book_id: string;
          suggested_by: string;
          status: 'pending' | 'selected' | 'dismissed';
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          book_id: string;
          suggested_by: string;
          status?: 'pending' | 'selected' | 'dismissed';
          created_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          book_id?: string;
          suggested_by?: string;
          status?: 'pending' | 'selected' | 'dismissed';
          created_at?: string;
        };
      };
      club_books: {
        Row: {
          id: string;
          club_id: string;
          book_id: string;
          status: 'current' | 'past';
          notes_revealed: boolean;
          average_rating: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          book_id: string;
          status?: 'current' | 'past';
          notes_revealed?: boolean;
          average_rating?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          book_id?: string;
          status?: 'current' | 'past';
          notes_revealed?: boolean;
          average_rating?: number | null;
          created_at?: string;
        };
      };
      user_book_notes: {
        Row: {
          id: string;
          user_id: string;
          club_book_id: string;
          notes: string;
          questions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          club_book_id: string;
          notes: string;
          questions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          club_book_id?: string;
          notes?: string;
          questions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_book_ratings: {
        Row: {
          id: string;
          user_id: string;
          club_book_id: string;
          rating: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          club_book_id: string;
          rating: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          club_book_id?: string;
          rating?: number;
          created_at?: string;
        };
      };
      user_book_lists: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          list_type: 'reading_now' | 'read' | 'want_to_read';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          list_type: 'reading_now' | 'read' | 'want_to_read';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          list_type?: 'reading_now' | 'read' | 'want_to_read';
          created_at?: string;
        };
      };
      club_meetings: {
        Row: {
          id: string;
          club_id: string;
          title: string;
          date_time: string;
          location: string | null;
          virtual_link: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          title: string;
          date_time: string;
          location?: string | null;
          virtual_link?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          title?: string;
          date_time?: string;
          location?: string | null;
          virtual_link?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
      meeting_rsvps: {
        Row: {
          id: string;
          meeting_id: string;
          user_id: string;
          status: 'yes' | 'no' | 'maybe';
          created_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          user_id: string;
          status: 'yes' | 'no' | 'maybe';
          created_at?: string;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          user_id?: string;
          status?: 'yes' | 'no' | 'maybe';
          created_at?: string;
        };
      };
    };
  };
}