import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { View , Text, Alert} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import ClubMemberCard from "./ClubMemberCard";
import { ClubDetails, Member, PublicClubMember } from "@/types/club";

// interface Member {
//   id: string;
//   user_id: string;
//   status: 'pending' | 'approved' | 'declined';
//   created_at: string;
//   profiles: {
//     display_name: string | null;
//     email: string;
//   };
// }

// interface PublicClubMember {
//   id: string;
//   user_id: string;
//   status: 'pending' | 'approved' | 'declined';
//   created_at: string;
//   display_name: string | null;
//   profile_picture_url: string | null;
// }




// export interface ClubDetails {
//   id: string;
//   name: string;
//   description: string | null;
//   privacy: 'public' | 'private' | 'secret';
//   admin_user_id: string;
//   current_book_id: string | null;
//   created_at: string;
//   current_book?: {
//     id: string;
//     title: string;
//     author: string;
//     cover_url: string | null;
//     synopsis: string | null;
//     page_count: number | null;
//   } | null;
//   club_books?: {
//     id: string;
//     notes_revealed: boolean;
//     average_rating: number | null;
//   }[];
// }


interface MembersProps {
  bookClubId: string;
  initialClub: ClubDetails | null;
  isAdmin: boolean;
}

export default function Members({ initialClub, bookClubId, isAdmin }: MembersProps) {
  
  // todo, I think members should maybe be handled one level up, unless this is 
  // the only component that needs the data?
  const [members, setMembers] = useState<Member[]>([]);
  const [clubMembers, setClubMembers] = useState<PublicClubMember[]>([]);
  const user = useAuth();
  const [club, setClub] = useState<ClubDetails | null>(initialClub);
  
  
  useEffect(() => {
    if (bookClubId && user) {
      loadMembers();
    }
  }, [bookClubId, user]);
  
  const loadMembers = async () => {
    try {
      console.log("book club id")
      console.log(bookClubId)
      const { data, error: memberError } = await supabase
        .from('club_members_public_view')
        .select( '*' )
        .eq('club_id', bookClubId)
        .order('created_at', { ascending: true });
      console.log("Members page")
      console.log(data)
      console.log(memberError)

      if (data) {
        setMembers(data);
        setClubMembers(data);
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
  
  return (
    <>
      {/* Members Section */}
      {isAdmin && (
        <View className="mb-6">
          <Text className="text-xl font-inter-semibold text-foreground font-semibold">
            Members ({members.length})
          </Text>
          <View className="gap-3">
            {clubMembers.map((member) => (
              <ClubMemberCard key={member.id} member={member} club_admin_user_id={club?.admin_user_id || null}
              loadMembers={loadMembers} updateMemberStatus={updateMemberStatus}/>
            ))
            }
          </View>
              
        </View>
      )}
    </>
  )
}