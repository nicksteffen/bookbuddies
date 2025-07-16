import { supabase } from "@/lib/supabase";
import { UserMinus } from "lucide-react-native";
import { useState } from "react";
import { Alert } from "react-native";
import { Platform, TouchableOpacity, Text} from 'react-native'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface RemoveMemberButtonProps {
  memberId: string;
  reloadMember: () => Promise<void>;
}


export default function RemoveMemberButton({ memberId, reloadMember }: RemoveMemberButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const removeMemberAction = async (memberId: string) => {
    const { error } = await supabase
      .from('club_members')
      .delete()
      .eq('id', memberId);
    if (!error) {
      await reloadMember();
      return { status: "success", message: "Member removed successfully" }
    } else {
      console.log(error.message)
      return { status: "error", message: "Failed to remove member" }
    }
  }
  
  const removeMemberMobile = async (memberId: string) => {
    Alert.alert(
      'Remove Member',
      "Are you sure you want to remove this member",
      [
        { text: 'Cancel', style: 'cancel', },
        {
          text: 'Remove',
          onPress: async () => {
            const result = await removeMemberAction(memberId);
            if (result.status === 'success') {
              Alert.alert('Success', 'Member removed successfully')
            } else {
              Alert.alert('Error', result.message)
            }
          }
        },
      ],
    )
  }
  
  if (Platform.OS !== 'web'){
    return (
      // <Text> Testing </Text>
      <TouchableOpacity className="p-2"
        onPress={() => removeMemberMobile(memberId)}
      >
        <UserMinus size={16} color="#EF4444" />
      </TouchableOpacity>
    )
  }
  
  
  // note: this can only render when we're on web
  return (
    <>
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogTrigger asChild>
          <button
            className="p-2"
          >
            {/* Assuming UserMinus is from lucide-react-native, its color can be set dynamically */}
            <UserMinus size={16} color="#EF4444" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the member
              from your club.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              await removeMemberAction(memberId);
            }}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>

  )
  
}