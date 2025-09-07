import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

export const sendOTP = async (phone: string) => {
  return await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: 'sms'
    }
  });
};

export const verifyOTP = async (phone: string, token: string, fullName?: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  });

  if (data.user && !error && fullName) {
    // Create user profile for new users
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: data.user.id,
        full_name: fullName,
        phone: phone,
      });
    
    if (profileError) {
      console.error('Error creating user profile:', profileError);
    }
  }

  return { data, error };
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: any) => {
  return await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId);
};