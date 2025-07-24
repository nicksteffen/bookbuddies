import React, { useEffect, useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { Star, StarHalf } from 'lucide-react-native';

type RatingInputProps = {
  initialRating?: number;
  onChange?: (rating: number) => void;
  size?: number;
};

export default function RatingInput({
  initialRating = 0,
  onChange,
  size = 28,
}: RatingInputProps) {
  const [rating, setRating] = useState(initialRating);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);
  
  const handlePress = (index: number, isHalf: boolean) => {
    const newRating = isHalf ? index + 0.5 : index + 1;
    setRating(newRating);
    onChange?.(newRating);
  };

  return (
    <View className="flex-row items-center space-x-1">
      {[...Array(5)].map((_, index) => {
        const fullValue = index + 1;
        const halfValue = index + 0.5;

        let icon;
        if (rating >= fullValue) {
          icon = <Star size={size} className="text-yellow-400" />;
        } else if (rating >= halfValue) {
          icon = (
            <View className="relative">
              <Star size={size} className="text-gray-300 absolute z-0" />
              <StarHalf size={size} className="text-yellow-400 z-10" />
            </View>
          );
        } else {
          icon = <Star size={size} className="text-gray-300" />;
        }

        return (
          <View key={index} className="relative">
            {/* Left half (0.5) */}
            <Pressable
              onPress={() => handlePress(index, true)}
              style={{
                position: 'absolute',
                width: size / 2,
                height: size,
                zIndex: 10,
              }}
            />
            {/* Right half (1.0) */}
            <Pressable
              onPress={() => handlePress(index, false)}
              style={{
                position: 'absolute',
                left: size / 2,
                width: size / 2,
                height: size,
                zIndex: 10,
              }}
            />
            {icon}
          </View>
        );
      })}

      <Text className="ml-2 text-sm text-gray-500">{rating.toFixed(1)}</Text>
    </View>
  );
}
