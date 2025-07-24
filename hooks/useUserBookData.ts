// hooks/useUserBookData.ts
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface NoteRow {
  id: string;
  note_text: string;
  created_at: string;
}

export interface QuestionRow {
  id: string;
  question_text: string;
  created_at: string;
}

export const useUserBookData = (bookId: string | undefined) => {
  const { user } = useAuth();

  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user?.id || !bookId) return;
    setLoading(true);

    const [notesRes, questionsRes, ratingRes] = await Promise.all([
      supabase
        .from("user_book_notes")
        .select("id, note_text, created_at")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .order("created_at", { ascending: true }),

      supabase
        .from("user_book_questions")
        .select("id, question_text, created_at")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .order("created_at", { ascending: true }),

      supabase
        .from("user_book_rating")
        .select("rating")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .single(),
    ]);

    setNotes(notesRes.data || []);
    setQuestions(questionsRes.data || []);
    setRating(ratingRes.data?.rating ?? null);
    setLoading(false);
  }, [user?.id, bookId]);

  const addNote = async (text: string) => {
    if (!user?.id || !bookId || !text.trim()) return;
    await supabase.from("user_book_notes").insert({
      user_id: user.id,
      book_id: bookId,
      note_text: text.trim(),
    });
    refresh();
  };

  const addQuestion = async (text: string) => {
    if (!user?.id || !bookId || !text.trim()) return;
    await supabase.from("user_book_questions").insert({
      user_id: user.id,
      book_id: bookId,
      question_text: text.trim(),
    });
    refresh();
  };

  const updateRating = async (newRating: number) => {
    if (!user?.id || !bookId) return;
    await supabase
      .from("user_book_rating")
      .upsert(
        {
          user_id: user.id,
          book_id: bookId,
          rating: newRating,
        },
        { onConflict: "user_id,book_id" }
      );
    setRating(newRating);
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    notes,
    questions,
    rating,
    loading,
    refresh,
    addNote,
    addQuestion,
    updateRating,
  };
};
