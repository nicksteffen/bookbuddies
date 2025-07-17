export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  cover_url: string | null;
  synopsis: string | null;
  page_count: number | null;
  year?: string;
  
}
