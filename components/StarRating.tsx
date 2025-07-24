import React from 'react';
import { View, Text } from 'react-native';
import { Star, StarHalf } from 'lucide-react-native';

type StarRatingProps = {
  rating: number; // 0–5 float
  maxStars?: number;
  size?: number;
  color?: string; // Tailwind color like 'text-yellow-400'
  className?: string; // Extra class for icon styling
  showNumeric?: boolean; // Whether to show the number next to stars
  precision?: number; // Decimal places for number, default is 2
};

export default function StarRating({
  rating,
  maxStars = 5,
  size = 20,
  color = 'text-yellow-400',
  className = '',
  showNumeric = true,
  precision = 2,
}: StarRatingProps) {
  const stars = [];

  const fullStars = Math.floor(rating);
  const remainder = rating - fullStars;

  const hasHalfStar = remainder >= 0.25 && remainder < 0.75;
  const roundUp = remainder >= 0.75;

  const totalFilled = fullStars + (roundUp ? 1 : 0);
  const totalDisplayed = totalFilled + (hasHalfStar ? 1 : 0);
  const emptyStars = maxStars - totalDisplayed;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={`full-${i}`} size={size} className={`${color} ${className}`} />
    );
  }

  if (roundUp) {
    stars.push(
      <Star key="roundup" size={size} className={`${color} ${className}`} />
    );
  }

  if (hasHalfStar) {
    stars.push(
      <View key="half" className="relative">
        <Star size={size} className={`text-gray-300 absolute z-0 ${className}`} />
        <StarHalf size={size} className={`${color} z-10 ${className}`} />
      </View>
    );
  }

  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star
        key={`empty-${i}`}
        size={size}
        className={`text-gray-300 ${className}`}
      />
    );
  }

  return (
    <View className="flex-row items-center space-x-1">
      <View className="flex-row items-center space-x-0.5">{stars}</View>
      {showNumeric && (
        <Text className="text-sm text-gray-600">
          {rating.toFixed(precision)}
        </Text>
      )}
    </View>
  );
}
