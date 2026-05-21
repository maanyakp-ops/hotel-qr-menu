import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ieziftgeevgjnteychen.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllemlmdGdlZXZnam50ZXljaGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzk5NjAsImV4cCI6MjA5NDg1NTk2MH0.Uo8t6DMloo6Id3rVCWvGrxxVciOyUBiSUxjtBhSj_Tc'

export const supabase = createClient(supabaseUrl, supabaseKey)