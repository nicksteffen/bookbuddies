import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { router } from "expo-router";


export default async function SignOutNavWeb() {
  const { user, signOut } = useAuth();
  return (
    <Button onClick={async () => {
      await signOut();
      router.replace('/(auth)/login');
    }}>
      Sign Out
    </Button>

  )
}