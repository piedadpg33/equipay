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
   * Get all expenses for a group
   */
  async getExpensesByGroupId(groupId: number): Promise<Expense[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_expenses_by_group', { group_id_input: groupId });

      if (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getExpensesByGroupId:', error);
      return [];
    }
  },

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


  /**
   * Calculate balances for group members based on expenses
   */
  calculateBalances(members: string[], expenses: Expense[]): Balance[] {
    const balances: Record<string, number> = {};
    
    // Initialize balances to 0
    members.forEach(member => { 
      balances[member] = 0; 
    });

    // Add what each person has paid
    expenses.forEach(expense => {
      if (expense.sender && typeof expense.amount === 'number') {
        balances[expense.sender] = (balances[expense.sender] || 0) + Number(expense.amount);
      }
    });

    // Calculate average per person
    const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const average = members.length > 0 ? total / members.length : 0;

    // Calculate final balance (what they paid - what they should pay)
    return members.map(member => ({
      nombre: member,
      balance: Number((balances[member] - average).toFixed(2))
    }));
  },

  /**
   * Determine who should pay next based on balances
   */
  getWhoPays(balances: Balance[]): Balance | null {
    if (balances.length === 0) return null;
    
    const minBalance = Math.min(...balances.map(b => b.balance));
    const debtors = balances.filter(b => b.balance === minBalance && b.balance < 0);
    
    if (debtors.length === 0) return null;
    
    // If there's a tie, choose randomly
    return debtors[Math.floor(Math.random() * debtors.length)];
  },

  /**
   * Get total expenses amount for a group
   */
  getTotalExpenses(expenses: Expense[]): number {
    return expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  }
};