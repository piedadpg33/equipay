require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en el entorno');
}
const supabase = createClient(supabaseUrl, supabaseKey);

describe('auth integration', () => {
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  afterAll(async () => {
    // No hay forma directa de borrar usuarios de auth desde el cliente, limpiar en la tabla users si es necesario
    await supabase.from('users').delete().eq('email', email);
  });

  it('permite registrar y loguear un usuario', async () => {
    // Sign up
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });
    expect(signUpError).toBeNull();

    // Sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    expect(signInError).toBeNull();
    expect(signInData.user).toBeDefined();
    expect(signInData.session).toBeDefined();
  });
});
