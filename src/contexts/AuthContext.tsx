import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getUserProfile } from '../lib/auth';
import type { AuthState } from '../lib/auth';

interface AuthContextType extends AuthState {
  sendOTP: (phone: string) => Promise<any>;
  verifyOtp: (phone: string, token: string, fullName?: string) => Promise<any>;
  signInWithOtp: (phone: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check for demo users in localStorage for persistence
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser && !session?.user) {
        const parsedUser = JSON.parse(demoUser);
        setUser(parsedUser);
        
        if (parsedUser) {
          const { data: profile } = await getUserProfile(parsedUser.id);
          setIsAdmin(profile?.is_admin ?? false);
        }
      } else {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: profile } = await getUserProfile(session.user.id);
          setIsAdmin(profile?.is_admin ?? false);
        }
      }
      
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: profile } = await getUserProfile(session.user.id);
          setIsAdmin(profile?.is_admin ?? false);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const sendOTP = async (phone: string) => {
    // Demo/Test mode - simulate OTP sending for demo numbers
    if (phone === '+919876543210' || phone === '+919876543211') {
      return { 
        data: { messageId: 'demo-message-id' }, 
        error: null 
      };
    }

    return await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms'
      }
    });
  };

  const verifyOTP = async (phone: string, token: string, fullName?: string) => {
    // Demo/Test mode - accept demo credentials
    if (phone === '+919876543210' && token === '123456') {
      // Create mock user session for customer demo
      const mockUser = {
        id: 'demo-customer-id',
        phone: phone,
        email: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Create/update user profile
      await supabase
        .from('user_profiles')
        .upsert({
          id: mockUser.id,
          full_name: fullName || 'Demo Customer',
          phone: phone,
          is_admin: false,
        });
      
      // Store demo user in localStorage for persistence
      localStorage.setItem('demoUser', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAdmin(false);
      
      return { 
        data: { user: mockUser, session: { user: mockUser } }, 
        error: null 
      };
    }
    
    if (phone === '+919876543211' && token === '123456') {
      // Create mock user session for admin demo
      const mockAdminUser = {
        id: 'demo-admin-id',
        phone: phone,
        email: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Create/update admin user profile
      await supabase
        .from('user_profiles')
        .upsert({
          id: mockAdminUser.id,
          full_name: fullName || 'Demo Admin',
          phone: phone,
          is_admin: true,
        });
      
      // Store demo user in localStorage for persistence
      localStorage.setItem('demoUser', JSON.stringify(mockAdminUser));
      setUser(mockAdminUser);
      setIsAdmin(true);
      
      return { 
        data: { user: mockAdminUser, session: { user: mockAdminUser } }, 
        error: null 
      };
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });

    if (data.user && !error && fullName) {
      await supabase
        .from('user_profiles')
        .upsert({
          id: data.user.id,
          full_name: fullName,
          phone: phone,
        });
    }

    return { data, error };
  };

  const signOut = async () => {
    // Clear demo user from localStorage
    localStorage.removeItem('demoUser');
    setUser(null);
    setIsAdmin(false);
    
    await supabase.auth.signOut();
  };

  const signInWithOtp = async (phone: string) => {
    // Demo/Test mode - simulate OTP sending for demo numbers
    if (phone === '+919876543210' || phone === '+919876543211') {
      return { 
        data: { messageId: 'demo-message-id' }, 
        error: null 
      };
    }

    return await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms'
      }
    });
  };

  const value = {
    user,
    loading,
    isAdmin,
    sendOTP,
    verifyOTP,
    signInWithOtp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};