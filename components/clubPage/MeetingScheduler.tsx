import { Meeting } from '@/app/club/[id]';
import { Platform } from 'react-native';
import MeetingsDialog from './MeetingsDialog';
import MeetingsModal from './MeetingsModal';

interface MeetingsSchedulerProps {
  showMeetingScheduler: boolean;
  onClose: () => void;
  createMeeting: (meeting: Meeting) => void;
  initialMeetingData?: Meeting;
}

export default function MeetingScheduler({
  showMeetingScheduler,
  onClose,
  createMeeting,
  initialMeetingData,
}: MeetingsSchedulerProps) {
  if (Platform.OS !== 'web') {
    return (
      <MeetingsModal
        showMeetingModal={showMeetingScheduler}
        onClose={onClose}
        createMeeting={createMeeting}
        initialMeetingData={initialMeetingData}
      />
    );
  }

  return (
    <MeetingsDialog
      showMeetingDialog={showMeetingScheduler}
      onClose={onClose}
      createMeeting={createMeeting}
      initialMeetingData={initialMeetingData}
    />
  );
}
