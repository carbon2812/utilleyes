import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getUserProfile } from '../lib/auth';
import type { AuthState } from '../lib/auth';
import type { UserProfile } from '../lib/supabase';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  userProfile: UserProfile | null;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const refreshProfile = async () => {
    if (!user) {
      setUserProfile(null);
      setIsAdmin(false);
      return;
    }

    setProfileLoading(true);
    try {
      const { data: profile } = await getUserProfile(user.id);
      setUserProfile(profile);
      setIsAdmin(profile?.is_admin ?? false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
      setIsAdmin(false);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [user]);

  const signUp = async (email: string, password: string) => {
    try {
      // Demo admin check
      if (email === 'admin@demo.com' && password === 'admin123') {
        const mockAdminUser = {
          id: 'demo-admin-id',
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        try {
          await supabase
            .from('user_profiles')
            .upsert({
              id: mockAdminUser.id,
              full_name: 'Demo Admin',
              is_admin: true,
            });
        } catch (error) {
          console.log('Demo profile creation skipped:', error);
        }
        
        localStorage.setItem('demoUser', JSON.stringify(mockAdminUser));
        setUser(mockAdminUser);
        
        return { 
          data: { user: mockAdminUser, session: { user: mockAdminUser } }, 
          error: null 
        };
      }

      // Demo customer check
      if (email === 'customer@demo.com' && password === 'customer123') {
        const mockCustomerUser = {
          id: 'demo-customer-id',
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        try {
          await supabase
            .from('user_profiles')
            .upsert({
              id: mockCustomerUser.id,
              full_name: 'Demo Customer',
              is_admin: false,
            });
        } catch (error) {
          console.log('Demo profile creation skipped:', error);
        }
        
        localStorage.setItem('demoUser', JSON.stringify(mockCustomerUser));
        setUser(mockCustomerUser);
        
        return { 
          data: { user: mockCustomerUser, session: { user: mockCustomerUser } }, 
          error: null 
        };
      }

      // Regular signup
      const result = await supabase.auth.signUp({
        email,
        password,
      });

      // If signup successful and user exists, create basic profile
      if (result.data?.user && !result.error) {
        try {
          await supabase
            .from('user_profiles')
            .insert({
              id: result.data.user.id,
              is_admin: false,
            });
        } catch (error) {
          console.log('Profile creation will be handled later:', error);
        }
      }

      return result;
    } catch (error) {
      console.error('Signup error:', error);
      return {
        data: { user: null, session: null },
        error: error
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Demo admin check
      if (email === 'admin@demo.com' && password === 'admin123') {
        const mockAdminUser = {
          id: 'demo-admin-id',
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        try {
          await supabase
            .from('user_profiles')
            .upsert({
              id: mockAdminUser.id,
              full_name: 'Demo Admin',
              is_admin: true,
            });
        } catch (error) {
          console.log('Demo profile creation skipped:', error);
        }
        
        localStorage.setItem('demoUser', JSON.stringify(mockAdminUser));
        setUser(mockAdminUser);
        
        return { 
          data: { user: mockAdminUser, session: { user: mockAdminUser } }, 
          error: null 
        };
      }

      // Demo customer check
      if (email === 'customer@demo.com' && password === 'customer123') {
        const mockCustomerUser = {
          id: 'demo-customer-id',
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        try {
          await supabase
            .from('user_profiles')
            .upsert({
              id: mockCustomerUser.id,
              full_name: 'Demo Customer',
              is_admin: false,
            });
        } catch (error) {
          console.log('Demo profile creation skipped:', error);
        }
        
        localStorage.setItem('demoUser', JSON.stringify(mockCustomerUser));
        setUser(mockCustomerUser);
        
        return { 
          data: { user: mockCustomerUser, session: { user: mockCustomerUser } }, 
          error: null 
        };
      }

      // Regular signin
      return await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } catch (error) {
      console.error('Signin error:', error);
      return {
        data: { user: null, session: null },
        error: error
      };
    }
  };
      email,
      password,
    });
  };


  const signOut = async () => {
    localStorage.removeItem('demoUser');
    setUser(null);
    setUserProfile(null);
    setIsAdmin(false);
    
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    isAdmin,
    userProfile,
    profileLoading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};