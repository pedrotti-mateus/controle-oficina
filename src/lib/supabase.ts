import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ysqqppqctpxmcoqlusdx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcXFwcHFjdHB4bWNvcWx1c2R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDc4NzMsImV4cCI6MjA4MTQ4Mzg3M30.ddEulNan1urfN5DliasDrMRbvlGJU-oTWB8ZsOCG2YY';

export const supabase = createClient(supabaseUrl, supabaseKey);
