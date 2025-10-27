//get group by id, get groups by ids, create group, update group members, delete group
import { supabase } from '@/lib/supabase';

export interface Group {
  id: number;
  name: string;
  members: string[];
  created_at: string;
}

export interface CreateGroupData {
  name: string;
  members: string[];
}

export const groupService = {
  
  /**
   * Get group by ID
   */
  async getGroupById(groupId: number): Promise<Group | null> {
    try {
    const { data, error } = await supabase
      .rpc('get_group_by_id', { group_id_input: groupId });

      if (error || !data) {
        console.error('Error fetching group:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getGroupById:', error);
      return null;
    }
  },

  /**
   * Get multiple groups by IDs
   */
  async getGroupsByIds(groupIds: number[]): Promise<Group[]> {
    try {
      if (groupIds.length === 0) {
        return [];
      }

    const { data, error } = await supabase
      .rpc('get_groups_by_ids', { ids: groupIds });

      if (error) {
        console.error('Error fetching groups:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getGroupsByIds:', error);
      return [];
    }
  },

  /**
   * Create a new group
   */
  async createGroup(groupData: CreateGroupData): Promise<{ success: boolean; group?: Group; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: groupData.name,
          members: groupData.members,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating group:', error);
        return {
          success: false,
          error: 'Error al crear el grupo'
        };
      }

      return {
        success: true,
        group: data
      };
    } catch (error) {
      console.error('Error in createGroup:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear el grupo'
      };
    }
  },

async getGroupSummary(groupId: number) {
  try {
    const { data, error } = await supabase.rpc('get_group_summary', { group_id_param: groupId });
    if (error) {
      console.error('Error in get summary:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Exception in getGroupSummary:', error);
    return null;
  }
},





};