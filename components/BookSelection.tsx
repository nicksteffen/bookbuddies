import { Book } from '@/types/book';
import { Platform } from 'react-native';
import BookSelectionModal from './BookSelectionModal';
import BookSelectionDialog from './BookSelectionDialog';

type listType = 'reading_now' | 'read' | 'want_to_read';

interface BookSelectionDialogProps {
  isVisible: boolean;
  onClose: () => void;
  onBookSelected: (bookData: Book, listType?: listType) => void;
  initialListType?: listType;
  modalTitle?: string;
}

export default function BookSelection({
  isVisible,
  onClose,
  onBookSelected,
  initialListType,
  modalTitle,
}: BookSelectionDialogProps) {
  if (Platform.OS !== 'web') {
    return (
      <BookSelectionModal
        isVisible={isVisible}
        onClose={onClose}
        onBookSelected={onBookSelected}
        modalTitle="Select Current Book"
      />
    );
  }

  return (
    <BookSelectionDialog
      isVisible={isVisible}
      onClose={onClose}
      onBookSelected={onBookSelected}
      initialListType={initialListType}
      modalTitle={modalTitle}
    />
  );
}
