import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const sendEmail = async (to: string[], subject: string, html: string) => {
    const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, html },
    });

    if (error) {
        console.error('Error sending email:', error);
        throw error;
    }

    return data;
};
