/**
 * Authentication API Routes
 * 
 * Functions for handling user authentication
 */

import { User } from '@/types/index';
import { convertUserFromDB } from '@/lib/api-adapter';

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Register a new user
 */
export async function registerUser(
  username: string, 
  email: string, 
  password: string
): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Registration failed: ${response.statusText}`);
    }
    
    const userData = await response.json();
    return convertUserFromDB(userData);
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

/**
 * Log in an existing user
 */
export async function loginUser(email: string, password: string): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for saving session cookies
      body: JSON.stringify({
        email,
        password,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Login failed: ${response.statusText}`);
    }
    
    const userData = await response.json();
    return convertUserFromDB(userData);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

/**
 * Log out the current user
 */
export async function logoutUser(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Logout failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export async function checkAuthStatus(): Promise<{ authenticated: boolean; user?: User }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/status`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      return { authenticated: false };
    }
    
    const data = await response.json();
    if (!data.authenticated) {
      return { authenticated: false };
    }
    
    return {
      authenticated: true,
      user: convertUserFromDB(data.user),
    };
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return { authenticated: false };
  }
} 