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
        .rpc('get_user_by_id', { user_id_input: userId });

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
      .rpc('get_user_groups', { user_id_input: userId });

      if (error) {
        console.error('Error fetching user groups:', error);
        return [];
      }

      return data ?? [];
    } catch (error) {
      console.error('Error in getUserGroups:', error);
      return [];
    }
  },



  /**
   * Update user groups
   */
  async addUserToGroup(userId: string, groupId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('add_group_to_user', { user_id_input: userId, group_id_input: groupId });
      
        if (error) {
        console.error('Error adding user to group:', error);
        return false;
      }
      return !error;
    } catch (error) {
      console.error('Error in addUserToGroup:', error);
      return false;
    }
  },



  /**
   * Get all users except the specified user
   */
  async getAllUsersExcept(excludeUsername: string): Promise<User[]> {
    try {
    const { data, error } = await supabase
      .rpc('get_all_users_except', { exclude_username: excludeUsername });

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


};