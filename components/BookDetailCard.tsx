import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { Book } from '@/types/book';
import RatingInput from '@/components/RatingInput'; // Make sure this accepts and sets ratings
import StarRating from './StarRating';

interface BookDetailCardProps {
  book: Book;
  userRating?: number | null;
  onRatingChange?: (rating: number) => void;
}

export default function BookDetailCard({ book, userRating, onRatingChange }: BookDetailCardProps) {
  const [rating, setRating] = useState(userRating || 0);
  useEffect(() => {
    if (userRating !== undefined) {
      setRating(userRating || 0);
    }
  }, [userRating]);

  return (
    <View className="bg-card rounded-xl p-5 shadow-md mb-6 flex flex-col md:flex-row gap-5">
      {/* Book Cover */}
      {!!book.cover_url ? (
        <Image
          source={{ uri: book.cover_url }}
          className="w-28 h-40 rounded-lg self-center"
          resizeMode="cover"
        />
      ) : (
        <View className="w-28 h-40 bg-muted rounded-lg justify-center items-center self-center">
          <Text className="text-3xl">📚</Text>
        </View>
      )}

      {/* Info Section */}
      <View className="flex-1 justify-between">
        {/* Title */}
        <Text className="text-foreground text-xl font-bold mb-1">
          {book.title}
        </Text>

        {/* Author */}
        <Text className="text-muted-foreground text-base mb-2">
          {book.author}
        </Text>

        {/* Rating Input */}
        <View className="mb-3">
          {onRatingChange ? (
            <RatingInput
              initialRating={rating}
              onChange={onRatingChange}
            />
          ) : (
            <StarRating rating={rating} />
          )}
        </View>

        {/* Page Count */}
        {!!book.page_count && (
          <Text className="text-muted-foreground text-sm mb-1">
            {book.page_count} pages
          </Text>
        )}

        {/* Synopsis */}
        {!!book.synopsis && (
          <Text className="text-muted-foreground text-sm leading-5 mt-2">
            {book.synopsis}
          </Text>
        )}

        {/* Link to full book page (optional) */}

      </View>
    </View>
  );
}
