/*
  # Update club books schema for notes reveal functionality

  1. Changes
    - Ensure club_books table has proper structure for notes reveal
    - Add any missing indexes for performance
    - Update RLS policies if needed

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control for club book management
*/

-- Ensure club_books table has the correct structure
DO $$
BEGIN
  -- Check if notes_revealed column exists, add if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'club_books' AND column_name = 'notes_revealed'
  ) THEN
    ALTER TABLE club_books ADD COLUMN notes_revealed boolean DEFAULT false;
  END IF;
END $$;

-- Add index for better performance on club book queries
CREATE INDEX IF NOT EXISTS idx_club_books_club_book ON club_books (club_id, book_id);

-- Ensure proper RLS policies exist for club book management
DROP POLICY IF EXISTS "Club admins can manage club books" ON club_books;
CREATE POLICY "Club admins can manage club books"
  ON club_books
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM book_clubs bc
      WHERE bc.id = club_books.club_id
      AND bc.admin_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM book_clubs bc
      WHERE bc.id = club_books.club_id
      AND bc.admin_user_id = auth.uid()
    )
  );

-- Ensure club members can see club books
DROP POLICY IF EXISTS "Club members can see club books" ON club_books;
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