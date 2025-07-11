/*
# Book Club App Database Schema

## Overview
This migration creates the complete database schema for a book club management application.

## Tables Created

### 1. User Management
- `profiles` - Extended user profile information

### 2. Book Club Management  
- `book_clubs` - Book club information with privacy settings
- `club_members` - Membership relationships with approval status

### 3. Book Management
- `books` - Book catalog with metadata from external APIs
- `book_suggestions` - Member book suggestions for clubs
- `club_books` - Books associated with specific clubs
- `user_book_notes` - Private notes and questions for books
- `user_book_ratings` - User ratings for books within clubs
- `user_book_lists` - Personal reading lists (reading now, read, want to read)

### 4. Meeting Management
- `club_meetings` - Meeting scheduling
- `meeting_rsvps` - Meeting attendance responses

## Security
- Row Level Security (RLS) enabled on all tables
- Policies implemented for data access control based on user authentication and club membership
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  profile_picture_url text,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create book_clubs table
CREATE TABLE IF NOT EXISTS book_clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  privacy text NOT NULL CHECK (privacy IN ('public', 'private', 'secret')),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_book_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE book_clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public and private clubs are visible to all users"
  ON book_clubs
  FOR SELECT
  TO authenticated
  USING (privacy IN ('public', 'private') OR admin_user_id = auth.uid());

CREATE POLICY "Users can create clubs"
  ON book_clubs
  FOR INSERT
  TO authenticated
  WITH CHECK (admin_user_id = auth.uid());

CREATE POLICY "Admins can update their clubs"
  ON book_clubs
  FOR UPDATE
  TO authenticated
  USING (admin_user_id = auth.uid());

-- Create club_members table
CREATE TABLE IF NOT EXISTS club_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(club_id, user_id)
);

ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can see club memberships"
  ON club_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM book_clubs bc 
      WHERE bc.id = club_id AND bc.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can request to join clubs"
  ON club_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update membership status"
  ON club_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM book_clubs bc 
      WHERE bc.id = club_id AND bc.admin_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can leave clubs"
  ON club_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  isbn text,
  cover_url text,
  synopsis text,
  page_count integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Books are readable by all authenticated users"
  ON books
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create books"
  ON books
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create book_suggestions table
CREATE TABLE IF NOT EXISTS book_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  suggested_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(club_id, book_id)
);

ALTER TABLE book_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club members can see suggestions"
  ON book_suggestions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM club_members cm 
      WHERE cm.club_id = book_suggestions.club_id 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'approved'
    )
  );

CREATE POLICY "Club members can create suggestions"
  ON book_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    suggested_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM club_members cm 
      WHERE cm.club_id = book_suggestions.club_id 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'approved'
    )
  );

CREATE POLICY "Club admins can update suggestion status"
  ON book_suggestions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM book_clubs bc 
      WHERE bc.id = club_id AND bc.admin_user_id = auth.uid()
    )
  );

-- Create club_books table
CREATE TABLE IF NOT EXISTS club_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'current' CHECK (status IN ('current', 'past')),
  notes_revealed boolean DEFAULT false,
  average_rating numeric(3,2),
  created_at timestamptz DEFAULT now(),
  UNIQUE(club_id, book_id)
);

ALTER TABLE club_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club members can see club books"
  ON club_books
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM club_members cm 
      WHERE cm.club_id = club_books.club_id 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'approved'
    )
  );

CREATE POLICY "Club admins can manage club books"
  ON club_books
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM book_clubs bc 
      WHERE bc.id = club_id AND bc.admin_user_id = auth.uid()
    )
  );

-- Create user_book_notes table
CREATE TABLE IF NOT EXISTS user_book_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  club_book_id uuid NOT NULL REFERENCES club_books(id) ON DELETE CASCADE,
  notes text NOT NULL DEFAULT '',
  questions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, club_book_id)
);

ALTER TABLE user_book_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notes"
  ON user_book_notes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Club members can see notes after reveal"
  ON user_book_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM club_books cb
      JOIN club_members cm ON cm.club_id = cb.club_id
      WHERE cb.id = club_book_id 
      AND cb.notes_revealed = true
      AND cm.user_id = auth.uid() 
      AND cm.status = 'approved'
    )
  );

-- Create user_book_ratings table
CREATE TABLE IF NOT EXISTS user_book_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  club_book_id uuid NOT NULL REFERENCES club_books(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, club_book_id)
);

ALTER TABLE user_book_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own ratings"
  ON user_book_ratings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Club members can see all ratings"
  ON user_book_ratings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM club_books cb
      JOIN club_members cm ON cm.club_id = cb.club_id
      WHERE cb.id = club_book_id 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'approved'
    )
  );

-- Create user_book_lists table
CREATE TABLE IF NOT EXISTS user_book_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  list_type text NOT NULL CHECK (list_type IN ('reading_now', 'read', 'want_to_read')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, book_id)
);

ALTER TABLE user_book_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own book lists"
  ON user_book_lists
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create club_meetings table
CREATE TABLE IF NOT EXISTS club_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  title text NOT NULL,
  date_time timestamptz NOT NULL,
  location text,
  virtual_link text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE club_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club members can see meetings"
  ON club_meetings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM club_members cm 
      WHERE cm.club_id = club_meetings.club_id 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'approved'
    )
  );

CREATE POLICY "Club admins can manage meetings"
  ON club_meetings
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM book_clubs bc 
      WHERE bc.id = club_id AND bc.admin_user_id = auth.uid()
    )
  );

-- Create meeting_rsvps table
CREATE TABLE IF NOT EXISTS meeting_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES club_meetings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('yes', 'no', 'maybe')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(meeting_id, user_id)
);

ALTER TABLE meeting_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own RSVPs"
  ON meeting_rsvps
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Club members can see all RSVPs"
  ON meeting_rsvps
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM club_meetings cm
      JOIN club_members cmb ON cmb.club_id = cm.club_id
      WHERE cm.id = meeting_id 
      AND cmb.user_id = auth.uid() 
      AND cmb.status = 'approved'
    )
  );

-- Add foreign key constraint for current_book_id in book_clubs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'book_clubs_current_book_id_fkey'
  ) THEN
    ALTER TABLE book_clubs 
    ADD CONSTRAINT book_clubs_current_book_id_fkey 
    FOREIGN KEY (current_book_id) REFERENCES books(id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_club_members_user_id ON club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_book_suggestions_club_id ON book_suggestions(club_id);
CREATE INDEX IF NOT EXISTS idx_club_books_club_id ON club_books(club_id);
CREATE INDEX IF NOT EXISTS idx_user_book_lists_user_id ON user_book_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_club_meetings_club_id ON club_meetings(club_id);
CREATE INDEX IF NOT EXISTS idx_meeting_rsvps_meeting_id ON meeting_rsvps(meeting_id);