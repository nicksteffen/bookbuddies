import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { View , Text, TouchableOpacity, Alert} from "react-native";
import { UserMinus } from 'lucide-react-native';
import { User } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/AuthContext";

interface Member {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
  profiles: {
    display_name: string | null;
    email: string;
  };
}




interface ClubDetails {
  id: string;
  name: string;
  description: string | null;
  privacy: 'public' | 'private' | 'secret';
  admin_user_id: string;
  current_book_id: string | null;
  created_at: string;
  current_book?: {
    id: string;
    title: string;
    author: string;
    cover_url: string | null;
    synopsis: string | null;
    page_count: number | null;
  } | null;
  club_books?: {
    id: string;
    notes_revealed: boolean;
    average_rating: number | null;
  }[];
}


interface MembersProps {
  bookClubId: string;
  initialClub: ClubDetails | null;
}

//todo pass club object?
export default function Members({ initialClub, bookClubId }: MembersProps) {
  
  const [members, setMembers] = useState<Member[]>([]);
  const user = useAuth();
  // const bookClubId = ''
  // const user = null;
  const isAdmin = true
  const [club, setClub] = useState<ClubDetails | null>(initialClub);
  
  
  useEffect(() => {
    if (bookClubId && user) {
      // loadClubDetails();
      loadMembers();
      // loadUserNotes();
      // loadMeetings();
    }
  }, [bookClubId, user]);
  
  const loadMembers = async () => {
    try {
      console.log("book club id")
      console.log(bookClubId)
      const { data, error: memberError } = await supabase
        .from('club_members')
        .select(
          `
          *,
          profiles (
            display_name,
            email
          )
        `,
        )
        .eq('club_id', bookClubId)
        .order('created_at', { ascending: true });

      if (data) {
        setMembers(data);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };
  

  
  const updateMemberStatus = async (
    memberId: string,
    status: 'approved' | 'declined',
  ) => {
    try {
      const { error } = await supabase
        .from('club_members')
        .update({ status })
        .eq('id', memberId);

      if (error) throw error;

      loadMembers();
      Alert.alert('Success', `Member ${status}!`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const removeMember = async (memberId: string) => {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('club_members')
                .delete()
                .eq('id', memberId);

              if (error) throw error;

              loadMembers();
              Alert.alert('Success', 'Member removed!');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
    );
  };

  return (
    <>
      {/* Members Section */}
      {isAdmin && (
        // Styles converted: marginBottom: 24 -> mb-6
        <View className="mb-6">
          {/* Styles converted: fontSize: 20, fontWeight: '600', color: '#1F2937' -> text-xl, font-inter-semibold, text-foreground */}
          <Text className="text-xl font-inter-semibold text-foreground">
            Members ({members.length})
          </Text>
          <View className="gap-3">
            {members.map((member) => (
              <View key={member.id} className="bg-card rounded-lg p-4 flex-row justify-between items-center shadow-md">
                <View className="flex-1">
                  <Text className="text-base font-inter-semibold text-foreground mb-0.5">
                    {member.profiles.display_name || member.profiles.email}
                  </Text>
                  <Text className="text-sm text-muted-foreground mb-1">
                    {member.profiles.email}
                  </Text>
                  <Text
                    className={`
                      text-xs font-inter-semibold uppercase
                      ${member.status === 'approved' ? 'text-green-500' : ''}
                      ${member.status === 'pending' ? 'text-amber-500' : ''}
                    `}
                  >
                    {member.status}
                  </Text>
                </View>
  
                <View className="flex-row gap-2">
                  {member.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        // Styles converted: backgroundColor: '#10B981', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6
                        className="bg-green-500 rounded-md px-3 py-1.5"
                        onPress={() =>
                          updateMemberStatus(member.id, 'approved')
                        }
                      >
                        {/* Styles converted: color: '#FFFFFF', fontSize: 12, fontWeight: '600' */}
                        <Text className="text-white text-xs font-inter-semibold">Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        // Styles converted: backgroundColor: '#EF4444', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6
                        className="bg-red-500 rounded-md px-3 py-1.5"
                        onPress={() =>
                          updateMemberStatus(member.id, 'declined')
                        }
                      >
                        {/* Styles converted: color: '#FFFFFF', fontSize: 12, fontWeight: '600' */}
                        <Text className="text-white text-xs font-inter-semibold">Decline</Text>
                      </TouchableOpacity>
                    </>
                  )}
  
                  {member.status === 'approved' &&
                    member.user_id !== club.admin_user_id && (
                      <TouchableOpacity
                        // Styles converted: padding: 8 -> p-2
                        className="p-2"
                        onPress={() => removeMember(member.id)}
                      >
                        {/* Assuming UserMinus is from lucide-react-native, its color can be set dynamically */}
                        <UserMinus size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  )
}