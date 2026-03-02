import { createBrowserClient } from '@supabase/ssr';
import { supabaseConfig } from './config';

export const createClient = () =>
  createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
