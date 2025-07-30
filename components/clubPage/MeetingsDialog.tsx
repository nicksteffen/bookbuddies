import { Meeting } from '@/app/club/[id]';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/lib/utils/useAlert';
import React, { useEffect, useState } from 'react';

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
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// Helper function to safely parse date strings
const safeParseDate = (dateString: string | undefined | null): Date => {
  if (!dateString) {
    console.warn(
      'safeParseDate: dateString is empty, null, or undefined. Defaulting to current date.',
    );
    return new Date();
  }
  const parsedDate = new Date(dateString);
  if (isNaN(parsedDate.getTime())) {
    console.error(
      `safeParseDate: Invalid date string received: "${dateString}". Returning current date as fallback.`,
    );
    return new Date();
  }
  return parsedDate;
};

interface MeetingsDialogProps {
  showMeetingDialog: boolean;
  onClose: () => void;
  createMeeting: (meeting: Meeting) => void;
  initialMeetingData?: Meeting;
}

export default function MeetingsDialog({
  showMeetingDialog,
  onClose,
  createMeeting,
  initialMeetingData,
}: MeetingsDialogProps) {
  const { showAlert } = useAlert();
  const { user } = useAuth();

  const [meetingForm, setMeetingForm] = useState(() => ({
    title: initialMeetingData?.title || '',
    date_time: safeParseDate(initialMeetingData?.date_time),
    location: initialMeetingData?.location || '',
    virtual_link: initialMeetingData?.virtual_link || '',
  }));

  useEffect(() => {
    if (initialMeetingData) {
      setMeetingForm({
        title: initialMeetingData.title,
        date_time: safeParseDate(initialMeetingData.date_time),
        location: initialMeetingData?.location || '',
        virtual_link: initialMeetingData?.virtual_link || '',
      });
    } else {
      setMeetingForm({
        title: '',
        date_time: new Date(),
        location: '',
        virtual_link: '',
      });
    }
  }, [initialMeetingData]);

  const onCreateOrUpdateMeeting = async () => {
    if (!meetingForm.title.trim()) {
      showAlert('Error', 'Meeting title is required.');
      return;
    }

    const meetingToSave: Meeting = {
      title: meetingForm.title.trim(),
      date_time: meetingForm.date_time.toISOString(),
      location: meetingForm.location.trim(),
      virtual_link: meetingForm.virtual_link.trim(),
      id: initialMeetingData?.id || undefined,
      created_by: initialMeetingData?.created_by || user?.id,
    };

    createMeeting(meetingToSave);
    onClose(); // Close the dialog after submission
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeetingForm({
      ...meetingForm,
      date_time: new Date(e.target.value),
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const newDateTime = new Date(meetingForm.date_time);
    newDateTime.setHours(hours, minutes, 0, 0);
    setMeetingForm({ ...meetingForm, date_time: newDateTime });
  };

  return (
    <Dialog open={showMeetingDialog} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialMeetingData ? 'Edit Meeting' : 'Schedule Meeting'}
          </DialogTitle>
          <DialogDescription>
            {initialMeetingData
              ? 'Make changes to your meeting here.'
              : 'Fill out the form to schedule a new meeting.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Meeting Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Book Discussion"
              value={meetingForm.title}
              onChange={(e) =>
                setMeetingForm({ ...meetingForm, title: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              placeholder="Physical location"
              value={meetingForm.location}
              onChange={(e) =>
                setMeetingForm({ ...meetingForm, location: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="virtual-link" className="text-right">
              Virtual Link
            </Label>
            <Input
              id="virtual-link"
              type="url"
              placeholder="Zoom, Meet, etc."
              value={meetingForm.virtual_link}
              onChange={(e) =>
                setMeetingForm({
                  ...meetingForm,
                  virtual_link: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date-time" className="text-right">
              Date & Time *
            </Label>
            <div className="col-span-3 grid grid-cols-2 gap-2">
              <Input
                id="date-time"
                type="date"
                value={meetingForm.date_time.toISOString().split('T')[0]}
                onChange={handleDateChange}
              />
              <Input
                type="time"
                value={meetingForm.date_time
                  .toTimeString()
                  .split(' ')[0]
                  .substring(0, 5)}
                onChange={handleTimeChange}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onCreateOrUpdateMeeting}>
            {initialMeetingData ? 'Update Meeting' : 'Create Meeting'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
