import { Meeting } from '@/app/club/[id]';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/lib/utils/useAlert';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Text,
} from 'react-native';
import DateTimePickerInput from '@/components/DateTimePickerInput'; // ADJUST THIS IMPORT PATH

// Helper function to safely parse date strings
const safeParseDate = (dateString: string | undefined | null): Date => {
  if (!dateString) {
    console.warn(
      'safeParseDate: dateString is empty, null, or undefined. Defaulting to current date.',
    );
    return new Date(); // Default to current date if string is invalid/missing
  }
  const parsedDate = new Date(dateString);
  if (isNaN(parsedDate.getTime())) {
    console.error(
      `safeParseDate: Invalid date string received: "${dateString}". Returning current date as fallback.`,
    );
    return new Date(); // Fallback to current date if parsing fails
  }
  return parsedDate;
};

interface MeetingsModalProps {
  showMeetingModal: boolean;
  onClose: () => void;
  createMeeting: (meeting: Meeting) => void;
  initialMeetingData?: Meeting;
}

export default function MeetingsModal({
  showMeetingModal,
  onClose,
  createMeeting,
  initialMeetingData,
}: MeetingsModalProps) {
  const { showAlert } = useAlert();
  const { user } = useAuth();

  const [meetingForm, setMeetingForm] = useState(() => ({
    title: initialMeetingData?.title || '',
    // Use safeParseDate when initializing state
    date_time: safeParseDate(initialMeetingData?.date_time),
    location: initialMeetingData?.location || '',
    virtual_link: initialMeetingData?.virtual_link || '',
  }));

  useEffect(() => {
    if (initialMeetingData) {
      setMeetingForm({
        title: initialMeetingData.title,
        // Use safeParseDate when updating state from props
        date_time: safeParseDate(initialMeetingData.date_time),
        location: initialMeetingData?.location || '',
        virtual_link: initialMeetingData?.virtual_link || '',
      });
    } else {
      // Reset form for new meeting
      setMeetingForm({
        title: '',
        date_time: new Date(), // Default to current date/time for new meeting
        location: '',
        virtual_link: '',
      });
    }
  }, [initialMeetingData]);

  const onCreateOrUpdateMeeting = async () => {
    // Basic validation
    if (!meetingForm.title.trim()) {
      showAlert('Error', 'Meeting title is required.');
      return;
    }

    const meetingToSave: Meeting = {
      title: meetingForm.title.trim(),
      // Convert the Date object back to an ISO string for PostgreSQL timestamptz
      date_time: meetingForm.date_time.toISOString(),
      location: meetingForm.location.trim(),
      virtual_link: meetingForm.virtual_link.trim(),
      id: initialMeetingData?.id || undefined, // Use existing id if updating
      created_by: initialMeetingData?.created_by || user?.id,
    };

    createMeeting(meetingToSave);
  };

  return (
    <Modal
      visible={showMeetingModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-base text-gray-600">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            {initialMeetingData ? 'Edit Meeting' : 'Schedule Meeting'}
          </Text>
          <TouchableOpacity onPress={onCreateOrUpdateMeeting}>
            <Text className="text-base text-blue-500 font-semibold">
              {initialMeetingData ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-5">
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-800 mb-2">
              Meeting Title *
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50"
              placeholder="e.g., Book Discussion"
              value={meetingForm.title}
              onChangeText={(text) =>
                setMeetingForm({ ...meetingForm, title: text })
              }
              autoCorrect={false}
            />
          </View>

          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-800 mb-2">
              Location
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50"
              placeholder="Physical location"
              value={meetingForm.location}
              onChangeText={(text) =>
                setMeetingForm({ ...meetingForm, location: text })
              }
              autoCorrect={false}
            />
          </View>

          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-800 mb-2">
              Virtual Link
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50"
              placeholder="Zoom, Meet, etc."
              value={meetingForm.virtual_link}
              onChangeText={(text) =>
                setMeetingForm({ ...meetingForm, virtual_link: text })
              }
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <View className="mb-6">
            <DateTimePickerInput
              label="Date & Time *"
              value={meetingForm.date_time}
              onChange={(selectedDate) =>
                setMeetingForm({ ...meetingForm, date_time: selectedDate })
              }
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
