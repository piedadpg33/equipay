//get user info, get user groups, update user groups, add user to group, remove user from group
import { supabase } from '@/lib/supabase';

export interface User {
  user_name: string;
  email: string;
  user_id: string;
  groups?: number[];
}

export const userService = {
  /**
   * Get user information by user ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserById:', error);
      return null;
    }
  },

  /**
   * Get user groups by user ID
   */
  async getUserGroups(userId: string): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('groups')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user groups:', error);
        return [];
      }

      return data?.groups || [];
    } catch (error) {
      console.error('Error in getUserGroups:', error);
      return [];
    }
  },

  /**
   * Update user groups
   */
  async updateUserGroups(userId: string, groups: number[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ groups })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user groups:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserGroups:', error);
      return false;
    }
  },

  /**
   * Add user to a group
   */
  async addUserToGroup(userId: string, groupId: number): Promise<boolean> {
    try {
      const currentGroups = await this.getUserGroups(userId);
      if (!currentGroups.includes(groupId)) {
        const updatedGroups = [...currentGroups, groupId];
        return await this.updateUserGroups(userId, updatedGroups);
      }
      return true;
    } catch (error) {
      console.error('Error in addUserToGroup:', error);
      return false;
    }
  },

  /**
   * Remove user from a group
   */
  async removeUserFromGroup(userId: string, groupId: number): Promise<boolean> {
    try {
      const currentGroups = await this.getUserGroups(userId);
      const updatedGroups = currentGroups.filter(id => id !== groupId);
      return await this.updateUserGroups(userId, updatedGroups);
    } catch (error) {
      console.error('Error in removeUserFromGroup:', error);
      return false;
    }
  },

  /**
   * Get all users except the specified user
   */
  async getAllUsersExcept(excludeUsername: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('user_name', excludeUsername);

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllUsersExcept:', error);
      return [];
    }
  },

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_name', username)
        .single();

      if (error) {
        console.error('Error fetching user by username:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      return null;
    }
  }
};