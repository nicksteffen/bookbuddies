'use client'; // This is important for client-side components in Next.js

import { searchBooks } from '@/lib/api';
import { Book } from '@/types/book';
import { useState } from 'react';
// import Image from 'next/image'; // Use next/image for web

import { View, Text, Image } from 'react-native'; // Still use for native alerts

// Shadcn UI components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// Assuming you have a web-friendly version of this component
import ReadingListDisplay from '@/components/ReadingListDisplay';
import { useAlert } from '@/lib/utils/useAlert';

type listType = 'reading_now' | 'read' | 'want_to_read';

interface BookSelectionDialogProps {
  isVisible: boolean;
  onClose: () => void;
  onBookSelected: (bookData: Book, listType?: listType) => void;
  initialListType?: listType;
  modalTitle?: string;
}

export default function BookSelectionDialog({
  isVisible,
  onClose,
  onBookSelected,
  initialListType,
  modalTitle,
}: BookSelectionDialogProps) {
  const [bookSearch, setBookSearch] = useState('');
  const [bookResults, setBookResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedList, setSelectedList] = useState<listType | null>(
    initialListType || null,
  );
  const { showAlert } = useAlert();

  const searchForBooks = async () => {
    if (!bookSearch.trim()) return;

    setSearching(true);
    try {
      const results = await searchBooks(bookSearch);
      setBookResults(results);
    } catch (error) {
      showAlert('Error', 'Failed to search books');
    } finally {
      setSearching(false);
    }
  };

  const setCurrentBook = async (bookData: Book) => {
    onClose();
    setBookResults([]);
    setBookSearch('');
    if (selectedList) {
      onBookSelected(bookData, selectedList);
    } else {
      onBookSelected(bookData);
    }
  };

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{modalTitle || 'Select a Book'}</DialogTitle>
          <DialogDescription>
            Search for a book to add to your reading list.
          </DialogDescription>
        </DialogHeader>

        {/* List type selector */}
        {!!initialListType && (
          <div className="mb-5">
            <p className="text-foreground text-base font-semibold mb-3">
              Add to:
            </p>
            <RadioGroup
              value={selectedList || undefined}
              onValueChange={(value: listType) => setSelectedList(value)}
              className="flex-row gap-2"
            >
              {(['want_to_read', 'reading_now', 'read'] as const).map(
                (listType) => (
                  <div key={listType}>
                    <RadioGroupItem
                      value={listType}
                      id={`list-${listType}`}
                      className="sr-only" // Hide the radio button visually
                    />
                    <Label
                      htmlFor={`list-${listType}`}
                      className={`flex-row items-center gap-1.5 bg-muted rounded-lg px-3 py-2 cursor-pointer
                    ${selectedList === listType ? 'bg-primary/10 border border-primary' : ''}
                    `}
                    >
                      <ReadingListDisplay listType={listType} size="small" />
                    </Label>
                  </div>
                ),
              )}
            </RadioGroup>
          </div>
        )}

        {/* Search Input */}
        <div className="flex flex-row items-center bg-muted rounded-xl px-4 py-3 mb-5 gap-3">
          <Input
            className="flex-1 text-base text-gray-800 border-none focus-visible:ring-0"
            placeholder="Search for books..."
            value={bookSearch}
            onChange={(e) => setBookSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                searchForBooks();
              }
            }}
          />
          <Button onClick={searchForBooks} disabled={searching} variant="ghost">
            {searching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Book Results List */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-3">
            {bookResults.length > 0 ? (
              bookResults.map((book, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentBook(book)}
                  className="flex flex-row bg-muted rounded-xl p-3 gap-3 cursor-pointer hover:bg-muted/80 transition-colors"
                >
                  <div className="w-[50px] h-[75px] rounded-md overflow-hidden">
                    {book.cover_url ? (
                      <Image
                        source={{ uri: book.cover_url }}
                        style={{ width: '100%', height: '100%' }} // Use percentages to fill the parent div
                        resizeMode="cover" // This is a good practice for React Native images
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex justify-center items-center">
                        <span className="text-3xl">📚</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-800 mb-1">
                      {book.title}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">{book.author}</p>
                    {book.page_count && (
                      <p className="text-xs text-gray-400">
                        {book.page_count} pages
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 mt-10">
                {bookSearch.trim()
                  ? 'No results found.'
                  : 'Start typing to search for books.'}
              </p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
