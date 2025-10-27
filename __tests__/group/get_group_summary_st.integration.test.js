require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en el entorno');
}
const supabase = createClient(supabaseUrl, supabaseKey);

describe('get_group_summary integración para grupo ST', () => {
  let groupId = null;
  const users = [
    { user_name: 'user2', user_id: '2e732f26-08b1-4223-8377-8625ce08e372' },
    { user_name: 'user4', user_id: '54695dfc-6792-4175-b0fb-7acef273c0ed' },
    { user_name: 'user3', user_id: '63402d53-c06c-4631-85ad-6c89488a1b90' },
    { user_name: 'user5', user_id: 'ab97b335-81f6-4562-a945-a1eb995fd71c' }
  ];

  beforeAll(async () => {
    // Crear grupo ST
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert([{ name: 'ST', members: users.map(u => u.user_name) }])
      .select()
      .single();
    if (groupError) throw groupError;
    groupId = group.id;

    // Crear gastos de prueba
    await supabase.from('expenses').insert([
      { group_id: groupId, amount: 100, description: 'Comida', sender: 'user2' },
      { group_id: groupId, amount: 50, description: 'Taxi', sender: 'user4' },
      { group_id: groupId, amount: 30, description: 'Café', sender: 'user3' },
      { group_id: groupId, amount: 20, description: 'Snacks', sender: 'user5' }
    ]);
  });

  afterAll(async () => {
    // Limpia los datos de prueba
    await supabase.from('expenses').delete().eq('group_id', groupId);
    await supabase.from('groups').delete().eq('id', groupId);
  });

  it('calcula balances y next_payer correctamente para ST', async () => {
    const { data, error } = await supabase.rpc('get_group_summary', { group_id_param: groupId });
    expect(error).toBeNull();
    expect(data.members).toEqual(['user2', 'user4', 'user3', 'user5']);
    expect(data.total).toBe(200);
    expect(data.balances).toEqual(
      expect.arrayContaining([
        { nombre: 'user2', balance: 100 - 50 }, // 50
        { nombre: 'user4', balance: 50 - 50 },  // 0
        { nombre: 'user3', balance: 30 - 50 },  // -20
        { nombre: 'user5', balance: 20 - 50 }   // -30
      ])
    );
    expect(data.next_payer).toBe('user5');
  });
});
