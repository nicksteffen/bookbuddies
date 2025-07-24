import { supabase } from "@/lib/supabase";
import { Book } from "@/types/book";
import { useState, useEffect } from "react";

// useBookDetails.ts
export const useBookDetails = (bookId: string | undefined) => {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!bookId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (error || !data) {
      setError("Failed to load book.");
      setBook(null);
    } else {
      setBook(data);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [bookId]);

  return { book, loading, error, refresh: load };
};
