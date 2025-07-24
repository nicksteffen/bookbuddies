import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';

type Props = {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  textEntries: string[];
  onSubmit?: (value: string) => void;
};

export default function BookTextEntrySection({
  title = 'Section Title',
  subtitle = '',
  placeholder = 'Write something...',
  buttonText = 'Submit',
  textEntries = [],
  onSubmit,
}: Props) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit?.(text.trim());
      setText('');
    }
  };

  return (
    <View className="bg-card p-5 rounded-xl shadow-md mb-6">
      {/* Title & Subtitle */}
      <View className="mb-4">
        <Text className="text-foreground text-xl font-bold">{title}</Text>
        {!!subtitle && <Text className="text-muted-foreground text-sm mt-1">{subtitle}</Text>}
      </View>

      {/* Entries */}
      <ScrollView className="max-h-60 mb-4">
        {textEntries.length === 0 ? (
          <Text className="text-muted-foreground italic">No entries yet.</Text>
        ) : (
          textEntries.map((entry, index) => (
            <View key={index} className="flex-row items-start space-x-2 mb-3">
              <Text className="text-primary font-bold">•</Text>
              <Text className="text-foreground flex-1">{entry}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Input */}
      {!!onSubmit && (
        <>
          
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.4)"
        value={text}
        onChangeText={setText}
        multiline
        className="bg-muted text-foreground px-4 py-3 rounded-md mb-4 min-h-[80px]"
      />

      {/* Submit Button */}
      <Pressable
        onPress={handleSubmit}
        className="bg-primary py-3 rounded-md items-center active:opacity-70"
      >
        <Text className="text-primary-foreground font-semibold">{buttonText}</Text>
      </Pressable>
        </>
      )}
    </View>
  );
}
