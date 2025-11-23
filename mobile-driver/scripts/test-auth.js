const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lsmxfbjrkyhaomjxozwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzbXhmYmpya3loYW9tanhvendkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDk0NzEsImV4cCI6MjA3OTIyNTQ3MX0.UluL87lAo302AnLjM7tyZptq4ooh9i5UX_Ppa7tkFHE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
    // Use a cleaner email format
    const timestamp = Date.now();
    const email = `zad.driver.${timestamp}@gmail.com`;
    const password = 'password123';

    console.log(`1. Tentando cadastrar usuário: [${email}]`);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (signUpError) {
        console.error('❌ Erro no cadastro:', signUpError.message);
        console.error('   Detalhes:', JSON.stringify(signUpError, null, 2));
        return;
    }

    console.log('✅ Cadastro solicitado com sucesso!');
    console.log('   User ID:', signUpData.user?.id);

    if (signUpData.session) {
        console.log('   Sessão criada automaticamente.');
    } else {
        console.log('   ⚠️ Sessão não criada. Provavelmente requer confirmação de email.');
    }

    console.log('\n2. Tentando login com o novo usuário...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
        console.error('❌ Erro no login:', signInError.message);
    } else {
        console.log('✅ Login realizado com sucesso!');
        console.log('   Access Token:', signInData.session.access_token.substring(0, 20) + '...');
    }
}

testAuth();
