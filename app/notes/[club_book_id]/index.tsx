"use client"
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text} from "react-native";
import UserNotesScreen from "./UserNotesScreen";


export default function NotesPage() {
  
  
  const { club_book_id } = useLocalSearchParams<{ club_book_id: string }>();
  return (
    <UserNotesScreen clubBookId={club_book_id} />
  )
}