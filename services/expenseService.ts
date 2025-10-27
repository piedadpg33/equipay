//get expenses, create expense, delete expense, calculate balances, who pays next
import { supabase } from '@/lib/supabase';

export interface Expense {
  id: number;
  group_id: number;
  amount: number;
  description: string;
  sender: string;
  created_at: string;
}

export interface CreateExpenseData {
  groupId: number;
  amount: number;
  description: string;
  sender: string;
}

export interface Balance {
  nombre: string;
  balance: number;
}

export const expenseService = {


  /**
   * Create a new expense
   */
  async createExpense(expenseData: CreateExpenseData): Promise<{ success: boolean; expense?: Expense; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          group_id: expenseData.groupId,
          amount: expenseData.amount,
          description: expenseData.description,
          sender: expenseData.sender
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating expense:', error);
        return {
          success: false,
          error: 'Error al crear el gasto'
        };
      }

      return {
        success: true,
        expense: data
      };
    } catch (error) {
      console.error('Error in createExpense:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear el gasto'
      };
    }
  },




};