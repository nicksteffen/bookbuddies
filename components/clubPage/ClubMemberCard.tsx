import { View,  Text, TouchableOpacity } from "react-native";
import MemberAvatarWithName from "./MemberAvatarWithName";
import RemoveMemberButton from "./RemoveMember";
import { PublicClubMember } from "@/types/club";


interface ClubMemberCardProps {
  member: PublicClubMember;
  club_admin_user_id: string | null;
  updateMemberStatus: (memberId: string, status: 'approved' | 'declined') => Promise<void>;
  loadMembers: () => Promise<void>;
}

export default function ClubMemberCard({ member, club_admin_user_id, updateMemberStatus, loadMembers }: ClubMemberCardProps) {

  return (
    <>
      <View key={member.id} className="bg-card rounded-lg p-4 flex-row justify-between items-center shadow-md">
        {/* Member Status and Info */}
        <View className="flex-1">
          <MemberAvatarWithName displayName={member.public_profiles.display_name || ''} profilePictureUrl={member.public_profiles.profile_picture_url}/>
          <Text
            className={`
              text-xs font-inter-semibold uppercase
              ${member.status === 'approved' ? 'text-emerald-500' : ''}
              ${member.status === 'pending' ? 'text-amber-500' : ''}
            `}
          >
            {member.status}
          </Text>
        </View>

        {/* Approve/Remove member */}
        <View className="flex-row gap-2">
          {member.status === 'pending' && (
            <>
              <TouchableOpacity
                className="bg-green-500 rounded-md px-3 py-1.5"
                onPress={() =>
                  updateMemberStatus(member.id, 'approved')
                }
              >
                <Text className="text-white text-xs font-inter-semibold">Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-500 rounded-md px-3 py-1.5"
                onPress={() =>
                  updateMemberStatus(member.id, 'declined')
                }
              >
                <Text className="text-white text-xs font-inter-semibold">Decline</Text>
              </TouchableOpacity>
            </>
          )}
          

          {/* Remove Member */}
          {member.status === 'approved' &&
            member.user_id !== club_admin_user_id && (
              <RemoveMemberButton memberId={member.id} reloadMember={loadMembers} />
            )}
        </View>
      </View>
    </>
  )

}