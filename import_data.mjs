import axios from 'axios'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // dùng service role cho insert hàng loạt
)

async function importCommunes() {
  // 1. Gọi API của bạn
  const res = await axios.get('https://travinh.sihymecc.vn/dongbo/jsonthoitiet.php')
  const communes = res.data.data

  // 2. Map dữ liệu đúng format DB
  const payload = communes.map(item => ({
    ma_xa: item.maxa,
    ten_xa: item.tenxa,
    lat: item.lat,
    lon: item.lon
  }))

  // 3. Insert hàng loạt
  const { error } = await supabase
    .from('communes')
    .insert(payload)

  if (error) {
    console.error('❌ Lỗi insert:', error)
    return
  }

  console.log(`✅ Đã nhập ${payload.length} xã`)
}

importCommunes()
