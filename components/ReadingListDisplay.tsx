import { BookOpen, Heart, Star } from 'lucide-react-native';
import { Text } from 'react-native';
type listType = 'reading_now' | 'read' | 'want_to_read';

// Helper for Lucide Icon Colors:
// These need to be actual color strings (hex, rgb, etc.) as the 'color' prop
// on Lucide icons does not interpret Tailwind class names directly.
// These hex values align with common Tailwind defaults or your custom theme.
const ICON_COLORS = {
  primary: '#3B82F6', // Matches common blue-500, like your 'primary' default
  emerald: '#10B981', // Matches your custom 'emerald-500'
  red: '#EF4444', // Matches your custom 'red-500'
  mutedForeground: '#6B7280', // Matches common gray-500, like your 'muted-foreground' default
};

const getListIcon = (listType: string) => {
  switch (listType) {
    case 'reading_now':
      return <BookOpen size={20} color={ICON_COLORS.primary} />;
    case 'read':
      return <Star size={20} color={ICON_COLORS.emerald} />;
    case 'want_to_read':
      return <Heart size={20} color={ICON_COLORS.red} />;
    default:
      return <BookOpen size={20} color={ICON_COLORS.mutedForeground} />;
  }
};

const getListTitle = (listType: string) => {
  switch (listType) {
    case 'reading_now':
      return 'Currently Reading';
    case 'read':
      return 'Read Books';
    case 'want_to_read':
      return 'Want to Read';
    default:
      return 'Books';
  }
};

interface ReadingListDisplayProps {
  listType: listType;
  size: 'small' | 'large';
}

export default function ReadingListDisplay({
  listType,
  size,
}: ReadingListDisplayProps) {
  const textClass =
    size === 'small'
      ? 'text-foreground text-sm font-medium'
      : 'text-foreground text-lg font-semibold';

  return (
    <>
      {getListIcon(listType)}
      <Text className={textClass}> {getListTitle(listType)}</Text>
    </>
  );
}
