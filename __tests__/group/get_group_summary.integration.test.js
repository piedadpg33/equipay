require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en el entorno');
}
const supabase = createClient(supabaseUrl, supabaseKey);

describe('get_group_summary integración', () => {
  let groupId = null;
  let userIds = [];

  beforeAll(async () => {
    // 1. Crear 3 usuarios
    // Usar usuarios reales existentes
    const users = [
      { user_name: 'user2', user_id: '2e732f26-08b1-4223-8377-8625ce08e372' },
      { user_name: 'user4', user_id: '54695dfc-6792-4175-b0fb-7acef273c0ed' },
      { user_name: 'user3', user_id: '63402d53-c06c-4631-85ad-6c89488a1b90' }
    ];
    // 2. Crear grupo con esos usuarios
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert([{ name: 'TestGroup', members: users.map(u => u.user_name) }])
      .select()
      .single();
    if (groupError) throw groupError;
    groupId = group.id;

    // 3. Crear gastos de prueba
    await supabase.from('expenses').insert([
      { group_id: groupId, amount: 60, description: 'Cena', sender: 'user2' },
      { group_id: groupId, amount: 30, description: 'Taxi', sender: 'user4' }
    ]);
  });

  afterAll(async () => {
    // Limpia los datos de prueba
    await supabase.from('expenses').delete().eq('group_id', groupId);
    await supabase.from('groups').delete().eq('id', groupId);
    // No borrar usuarios reales
  });

  it('calcula balances y next_payer correctamente', async () => {
    const { data, error } = await supabase.rpc('get_group_summary', { group_id_param: groupId });
    expect(error).toBeNull();
    expect(data.members).toEqual(['user2', 'user4', 'user3']);
    expect(data.total).toBe(90);
    expect(data.balances).toEqual(
      expect.arrayContaining([
        { nombre: 'user2', balance: 30 },
        { nombre: 'user4', balance: 0 },
        { nombre: 'user3', balance: -30 }
      ])
    );
    expect(data.next_payer).toBe('user3');
  });
});