interface OpenLibraryBook {
  title: string;
  author_name?: string[];
  isbn?: string[];
  cover_i?: number;
  first_publish_year?: number;
  subject?: string[];
  number_of_pages_median?: number;
}

interface OpenLibrarySearchResponse {
  docs: OpenLibraryBook[];
  numFound: number;
}

export async function searchBooks(query: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10&fields=title,author_name,isbn,cover_i,first_publish_year,subject,number_of_pages_median`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search books');
    }
    
    const data: OpenLibrarySearchResponse = await response.json();
    
    return data.docs.map((book) => ({
      title: book.title,
      author: book.author_name?.[0] || 'Unknown Author',
      isbn: book.isbn?.[0] || null,
      cover_url: book.cover_i 
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null,
      synopsis: book.subject?.slice(0, 3).join(', ') || null,
      page_count: book.number_of_pages_median || null,
      year: book.first_publish_year || null,
    }));
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}

export async function getBookByISBN(isbn: string): Promise<any | null> {
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?isbn=${isbn}&fields=title,author_name,isbn,cover_i,first_publish_year,subject,number_of_pages_median`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch book');
    }
    
    const data: OpenLibrarySearchResponse = await response.json();
    
    if (data.docs.length === 0) {
      return null;
    }
    
    const book = data.docs[0];
    return {
      title: book.title,
      author: book.author_name?.[0] || 'Unknown Author',
      isbn: book.isbn?.[0] || null,
      cover_url: book.cover_i 
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null,
      synopsis: book.subject?.slice(0, 3).join(', ') || null,
      page_count: book.number_of_pages_median || null,
      year: book.first_publish_year || null,
    };
  } catch (error) {
    console.error('Error fetching book by ISBN:', error);
    return null;
  }
}