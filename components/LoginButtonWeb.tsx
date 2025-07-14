"use client";

import React from 'react';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/button'; // shadcn/ui Button
import AuthButton from './WebHeaderAuthButton';

export default function LoginButtonWeb() {
  return (
     <AuthButton linkDest="/login" buttonText="Login" />
  )
}