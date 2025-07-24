// lib/club.ts
import { supabase } from "@/lib/supabase";

export interface ClubMemberEntry {
  user_id: string;
  display_name: string | null;
  profile_picture_url: string | null;
  notes: string[];
  questions: string[];
  rating: number | null;
}

export async function fetchClubBookData(
  clubId: string,
  bookId: string
): Promise<ClubMemberEntry[]> {
  console.log("fetch called")
  // 1. Get club members + profile info
  const { data: members, error: memberErr } = await supabase
    .from("club_members")
    .select("user_id, public_profiles(display_name, profile_picture_url)")
    .eq("club_id", clubId);

  if (memberErr) throw memberErr;
  console.log("members")
  console.log(members)
  console.log(memberErr)

  const userIds = members?.map((m) => m.user_id) ?? [];

  // 2. Get notes, questions, and ratings for those users for the book
  const [notesRes, questionsRes, ratingsRes] = await Promise.all([
    supabase
      .from("user_book_notes")
      .select("user_id, note_text")
      .in("user_id", userIds)
      .eq("book_id", bookId),

    supabase
      .from("user_book_questions")
      .select("user_id, question_text")
      .in("user_id", userIds)
      .eq("book_id", bookId),

    supabase
      .from("user_book_rating")
      .select("user_id, rating")
      .in("user_id", userIds)
      .eq("book_id", bookId),
  ]);

  // 3. Build flat array of entries
  const result: ClubMemberEntry[] = members.map((m) => ({
    user_id: m.user_id,
    display_name: m.public_profiles?.display_name ?? null,
    profile_picture_url: m.public_profiles?.profile_picture_url ?? null,
    notes: [],
    questions: [],
    rating: null,
  }));

  // Index for fast assignment
  const indexByUserId = Object.fromEntries(
    result.map((entry) => [entry.user_id, entry])
  );

  notesRes.data?.forEach((note) => {
    indexByUserId[note.user_id]?.notes.push(note.note_text);
  });

  questionsRes.data?.forEach((q) => {
    indexByUserId[q.user_id]?.questions.push(q.question_text);
  });

  ratingsRes.data?.forEach((r) => {
    indexByUserId[r.user_id].rating = r.rating;
  });

  return result;
}
