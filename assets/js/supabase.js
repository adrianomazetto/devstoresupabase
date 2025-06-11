// Configuração do Supabase
const SUPABASE_URL = 'https://xqrgjcuglehopjksyyjt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxcmdqY3VnbGVob3Bqa3N5eWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NjI0NzMsImV4cCI6MjA2NTAzODQ3M30.CkMkdfBQw0mfrhHuPmTwpmiSmBVU_gEp0K76tGcOs-0';

// Importar o Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exportar para uso global
window.supabaseClient = supabaseClient;

