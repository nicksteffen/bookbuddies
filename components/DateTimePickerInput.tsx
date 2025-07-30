import React, { useState } from 'react';
import { Platform, TouchableOpacity, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateTimePickerInputProps {
  value: Date;
  onChange: (date: Date) => void;
  label: string;
  temp?: () => void;
}

export default function DateTimePickerInput({
  value,
  onChange,
  label,
  temp,
}: DateTimePickerInputProps) {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  // Handler for @react-native-community/datetimepicker (Native)
  const handleNativeDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || value;
    if (Platform.OS === 'android') {
      setShowDate(false); // Hide picker on Android after selection
      setShowTime(false);
    }
    if (selectedDate) {
      onChange(currentDate);
    }
    console.log('end');
  };

  // Handler for react-datepicker (Web)
  const handleWebDateChange = (date: Date | null) => {
    if (date) {
      onChange(date);
    }
  };

  // Helper to format the date for display (consistent for all platforms)
  const formatDateTimeForDisplay = (date: Date) => {
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  const formatTimeForDisplay = (date: Date) => {
    return date.toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View>
      <Text className="text-base font-semibold text-gray-800 mb-2">
        {label}
      </Text>

      {/* Conditional rendering based on platform */}
      {Platform.select({
        ios: (
          <TouchableOpacity
            onPress={() => setShowDate(true)} // Show native picker
            className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50 flex-row justify-between items-center"
          >
            <Text>{formatDateTimeForDisplay(value)}</Text>
          </TouchableOpacity>
        ),
        android: (
          <View>
            <TouchableOpacity
              onPress={() => setShowDate(true)} // Show native picker
              className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50 flex-row justify-between items-center"
            >
              <Text>{formatDateForDisplay(value)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowTime(true);
              }}
              className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50 flex-row justify-between items-center"
            >
              <Text>{formatTimeForDisplay(value)}</Text>
            </TouchableOpacity>
          </View>
        ),
      })}

      {/* @react-native-community/datetimepicker for iOS/Android */}
      {showDate && Platform.OS === 'ios' && (
        <DateTimePicker
          testID="dateTimePicker"
          value={value}
          mode="datetime"
          // is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleNativeDateChange}
        />
      )}
      {showDate && Platform.OS === 'android' && (
        <DateTimePicker
          testID="datePicker"
          value={value}
          mode="date"
          // is24Hour={true}
          display={'default'}
          onChange={handleNativeDateChange}
        />
      )}
      {showTime && Platform.OS === 'android' && (
        <DateTimePicker
          testID="timePicker"
          value={value}
          mode="time"
          // is24Hour={true}
          display={'default'}
          onChange={handleNativeDateChange}
        />
      )}
    </View>
  );
}
