import { supabase } from './supabase';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

export interface SignupResponse {
  user: User;
  token?: string;
}

export interface SignupEmailSentResponse {
  emailSent: boolean;
  email: string;
}

// Helper function to convert Supabase errors to user-friendly messages
function getFriendlyErrorMessage(error: { message?: string; code?: string }, context: 'login' | 'signup'): string {
  const errorMessage = error?.message || '';
  const errorCode = error?.code || '';

  // Login errors
  if (context === 'login') {
    if (errorCode === 'invalid_credentials' || errorMessage.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (errorMessage.includes('Email not confirmed')) {
      return 'Please verify your email address before logging in.';
    }
    if (errorMessage.includes('Too many requests')) {
      return 'Too many login attempts. Please wait a moment and try again.';
    }
  }

  // Signup errors
  if (context === 'signup') {
    if (errorMessage.includes('User already registered') || errorMessage.includes('already registered')) {
      return 'An account with this email already exists. Please log in instead.';
    }
    if (errorMessage.includes('Password')) {
      return 'Please choose a different password.';
    }
    if (errorMessage.includes('Email')) {
      return 'Please enter a valid email address.';
    }
    if (errorMessage.includes('already exists')) {
      return 'This email is already registered. Please log in instead.';
    }
  }

  // Generic errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Connection error. Please check your internet connection and try again.';
  }

  // Default: return a friendly generic message
  if (context === 'login') {
    return 'Unable to log in. Please check your credentials and try again.';
  }
  return 'Unable to create account. Please try again.';
}

// Authentication API functions using Supabase
export const authAPI = {
  // Login user
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(getFriendlyErrorMessage(error, 'login'));
    }

    if (!data.user) {
      throw new Error('Login failed');
    }

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is okay for new users
      throw new Error('Unable to load your profile. Please try again.');
    }

    const user: User = {
      id: data.user.id,
      username: profile?.username || data.user.email?.split('@')[0] || 'User',
      email: data.user.email || email,
    };

    return {
      user,
      token: data.session?.access_token,
    };
  },

  // Validate signup data before creating account
  validateSignup: async (username: string, email: string, password: string): Promise<void> => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Please enter a valid email address.');
    }

    // Validate password is not empty
    if (!password || password.trim().length === 0) {
      throw new Error('Password cannot be empty.');
    }

    // Validate username is not empty
    if (!username || username.trim().length === 0) {
      throw new Error('Username cannot be empty.');
    }

    // Check if username is already taken
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.trim())
      .maybeSingle();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      throw new Error('Unable to validate username. Please try again.');
    }

    if (existingProfile) {
      throw new Error('This username is already taken. Please choose a different one.');
    }

    // Note: Email uniqueness will be checked by Supabase during signup
    // We don't need to check it here as Supabase will return an error if email exists
  },

  // Signup user (validates first, then sends confirmation email)
  signup: async (name: string, email: string, password: string): Promise<SignupEmailSentResponse> => {
    // Validate first - this will throw if validation fails
    await authAPI.validateSignup(name, email, password);

    // Get the redirect URL for email confirmation
    const redirectUrl = `${window.location.origin}/dashboard`;

    // Sign up the user (Supabase will send confirmation email)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: name.trim(), // Store username in metadata
        },
      },
    });

    if (authError) {
      console.error('Signup error:', authError);
      throw new Error(getFriendlyErrorMessage(authError, 'signup'));
    }

    if (!authData.user) {
      throw new Error('Unable to create account. Please try again.');
    }

    // Check if email was actually sent
    // Note: In development, Supabase might not send emails if email confirmation is disabled
    console.log('User created:', authData.user.id);
    console.log('Email confirmation sent:', authData.user.email_confirmed_at ? 'Already confirmed' : 'Pending confirmation');
    
    // Note: Profile will be created AFTER email confirmation in the confirmation handler
    // Username is stored in user_metadata for later use

    return {
      emailSent: true,
      email: email.trim(),
    };
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Please log in to view your profile.');
    }

    // Get profile from profiles table (email comes from auth.users, not profiles)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Unable to load your profile. Please try again.');
    }

    return {
      id: profile.id,
      username: profile.username,
      email: user.email || '', // Email comes from auth.users, not profiles table
    };
  },

  // Resend confirmation email
  resendConfirmationEmail: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      throw new Error(getFriendlyErrorMessage(error, 'signup'));
    }
  },

  // Update user profile
  updateProfile: async (username: string, email?: string, phoneNumber?: string): Promise<User> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Please log in to update your profile.');
    }

    // Update email if provided and different from current
    if (email && email.trim() !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: email.trim(),
      });

      if (emailError) {
        throw new Error('Unable to update email. Please check the email address and try again.');
      }
      // Note: Supabase will send a confirmation email for email changes
    }

    // Use upsert to either update existing profile or create new one
    const profileData: { id: string; username: string; phone_number?: string | null } = {
      id: user.id,
      username: username.trim(),
    };
    
    if (phoneNumber !== undefined) {
      profileData.phone_number = phoneNumber.trim() || null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      throw new Error(`Unable to update your profile: ${profileError.message || 'Please try again.'}`);
    }

    // Get updated user email
    const { data: { user: updatedAuthUser } } = await supabase.auth.getUser();

    const updatedUser: User = {
      id: profile.id,
      username: profile.username,
      email: updatedAuthUser?.email || email || user.email || '',
    };

    authStorage.setUser(updatedUser);
    return updatedUser;
  },

  // Logout user
  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error('Unable to log out. Please try again.');
    }
    authStorage.clear();
  },
};

// Store authentication token and user
export const authStorage = {
  setToken: (token: string) => {
    // Supabase handles token storage automatically, but we can store it for convenience
    localStorage.setItem('token', token);
  },
  
  getToken: (): string | null => {
    // Get token from localStorage (Supabase also stores it automatically)
    return localStorage.getItem('token');
  },
  
  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  getUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  clear: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

