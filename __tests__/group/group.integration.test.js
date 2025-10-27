require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en el entorno');
}
const supabase = createClient(supabaseUrl, supabaseKey);

describe('groupService integración', () => {
  afterAll(async () => {
    // Limpia grupos de prueba sin miembros si se crearon
    await supabase.from('groups').delete().eq('name', 'GrupoSinMiembros');
  });

  it('no permite crear un grupo sin miembros', async () => {
    const { error, data } = await supabase
      .from('groups')
      .insert({ name: 'GrupoSinMiembros', members: null })
      .select();
      console.log(error, data);
    expect(!data || (Array.isArray(data) && data.length === 0)).toBe(true);
  });

    it('no permite crear un grupo sin nombre', async () => {
    const { error, data } = await supabase
      .from('groups')
      .insert({ name: null, members: ['alguien'] })
      .select();
    console.log(error, data);
    expect(!data || (Array.isArray(data) && data.length === 0)).toBe(true);
  });

  
});
