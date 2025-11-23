const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lsmxfbjrkyhaomjxozwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzbXhmYmpya3loYW9tanhvendkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDk0NzEsImV4cCI6MjA3OTIyNTQ3MX0.UluL87lAo302AnLjM7tyZptq4ooh9i5UX_Ppa7tkFHE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    const email = 'zad.driver.1763913347287@gmail.com';
    const password = 'password123';

    console.log(`Tentando login com usuário confirmado: ${email}`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('❌ Erro no login:', error.message);
    } else {
        console.log('✅ Login realizado com sucesso!');
        console.log('   User ID:', data.user.id);
        console.log('   Email:', data.user.email);
        console.log('   Access Token:', data.session.access_token.substring(0, 20) + '...');
    }
}

testLogin();
