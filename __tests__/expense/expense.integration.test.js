require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en el entorno');
}
const supabase = createClient(supabaseUrl, supabaseKey);

describe('expenseService integración', () => {
  let groupId = null;
  const users = [
    { user_name: 'user2', user_id: '2e732f26-08b1-4223-8377-8625ce08e372' },
    { user_name: 'user4', user_id: '54695dfc-6792-4175-b0fb-7acef273c0ed' }
  ];

  beforeAll(async () => {
    // Crear grupo de prueba
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert([{ name: 'ExpensesTest', members: users.map(u => u.user_name) }])
      .select()
      .single();
    if (groupError) throw groupError;
    groupId = group.id;
  });

  afterAll(async () => {
    // Limpia los datos de prueba
    await supabase.from('expenses').delete().eq('group_id', groupId);
    await supabase.from('groups').delete().eq('id', groupId);
  });

  it('no permite crear un expense vacío', async () => {
    const { error, data } = await supabase
      .from('expenses')
      .insert({})
      .select();
    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });

  it('crea y obtiene un gasto correctamente', async () => {
    // Crear gasto
    const expense = {
      group_id: groupId,
      amount: 42.5,
      description: 'Pizza',
      sender: 'user2'
    };
    const { data: created, error: createError } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();
    expect(createError).toBeNull();
    expect(created).toBeDefined();
    expect(created.amount).toBe(42.5);
    expect(created.description).toBe('Pizza');
    expect(created.sender).toBe('user2');

    // Obtener gastos del grupo
    const { data: expenses, error: getError } = await supabase
      .from('expenses')
      .select('*')
      .eq('group_id', groupId);
    expect(getError).toBeNull();
    expect(Array.isArray(expenses)).toBe(true);
    expect(expenses.length).toBeGreaterThanOrEqual(1);
    expect(expenses.some(e => e.description === 'Pizza')).toBe(true);
  });
});
