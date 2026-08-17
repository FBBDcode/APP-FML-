import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Configurações do Supabase não encontradas. Certifique-se de configurar as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
  );
}

const isValidUrl = (url: string | undefined) => {
  if (!url) return false;
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

const url = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co';
const key = supabaseAnonKey && supabaseAnonKey.trim() !== '' ? supabaseAnonKey : 'public-anon-key';

export const supabase = createClient<Database>(url, key);
