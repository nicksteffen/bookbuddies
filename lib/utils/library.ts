import { Book } from '@/types/book';
import { supabase } from '../supabase';

export async function createOrGetBook(bookData: Book) {
  let bookId = null;
  const { data: existingBook } = await supabase
    .from('books')
    .select('id')
    .eq('title', bookData.title)
    .eq('author', bookData.author)
    .eq('isbn', bookData.isbn)
    .single();

  if (existingBook) {
    bookId = existingBook.id;
  } else {
    const { data: newBook, error: bookError } = await supabase
      .from('books')
      .insert({
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        cover_url: bookData.cover_url,
        synopsis: bookData.synopsis,
        page_count: bookData.page_count,
      })
      .select('id')
      .single();

    if (bookError) throw bookError;
    bookId = newBook?.id;
  }

  if (!bookId) {
    throw new Error('Failed to obtain book ID after creation or lookup.');
  }

  return bookId;
}

export const getListTitle = (listType: string) => {
  switch (listType) {
    case 'reading_now':
      return 'Currently Reading';
    case 'read':
      return 'Read Books';
    case 'want_to_read':
      return 'Want to Read';
    default:
      return 'Books';
  }
};
