import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://sgeqvnmxmlepphxgcrap.supabase.co/rest/v1/";
const SUPABASE_PUBLIC_KEY = "sb_publishable_5SMfcf3F4ljkz3ozHTeZtA_cJUzJR_y";

// Strip trailing /rest/v1/ if present so createClient receives the base project URL
const normalizedUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '');

export const supabase = createClient(normalizedUrl || SUPABASE_URL, SUPABASE_PUBLIC_KEY);

export { SUPABASE_URL, SUPABASE_PUBLIC_KEY };
export default supabase;
