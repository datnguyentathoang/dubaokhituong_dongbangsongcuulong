const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
// hoặc SUPABASE_ANON_KEY nếu chỉ đọc dữ liệu công khai

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Thiếu SUPABASE_URL hoặc SUPABASE_KEY trong env')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
})

module.exports = { supabase }
