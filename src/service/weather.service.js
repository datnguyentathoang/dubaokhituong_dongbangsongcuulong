const axios = require("axios");
const { supabase } = require("../config/supabase");

class WeatherService {
  static async getDistricts() {
    // Get all available districts/communes from database
    const { data, error } = await supabase
      .from("communes")
      .select("ma_xa, ten_xa")
      .order("ten_xa", { ascending: true });

    if (error) {
      console.error("Error fetching districts:", error);
      // Return empty array if query fails
      return [];
    }

    // Map to format expected by frontend
    return (data || []).map((row) => ({
      ma_xa: row.ma_xa,
      district_name: row.ten_xa,
    }));
  }

  static async getForecastNextHoursByMaXa(ma_xa) {
    // 1️⃣ Lấy lat, lon từ Supabase
    const { data, error } = await supabase
      .from("communes")
      .select("lat, lon, ten_xa")
      .eq("ma_xa", ma_xa)
      .single();

    if (error || !data) {
      throw new Error("Không tìm thấy xã");
    }

    const { lat, lon, ten_xa } = data;

    // 2️⃣ Check API KEY
    if (!process.env.OPENWEATHER_API_KEY) {
      throw new Error("Missing OPENWEATHER_API_KEY");
    }

    // 3️⃣ Gọi API forecast (FREE)
    const res = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      {
        params: {
          lat,
          lon,
          units: "metric",
          lang: "vi",
          appid: process.env.OPENWEATHER_API_KEY,
        },
      },
    );

    // 4️⃣ Lấy giờ hiện tại + 3 giờ tiếp theo
    const now = Math.floor(Date.now() / 1000);

    const timeline = res.data.list
      .filter((item) => item.dt >= now)
      .slice(0, 4) // hiện tại + 3 mốc sau
      .map((item) => ({
        time: item.dt_txt,
        temperature: item.main.temp,
        feels_like: item.main.feels_like,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        rain: item.rain?.["3h"] || 0,
        weather: item.weather[0].description,
        icon: item.weather[0].icon,
      }));

    // 5️⃣ Trả data cho frontend vẽ biểu đồ
    return {
      ma_xa,
      ten_xa,
      lat,
      lon,
      timeline,
    };
  }
}

module.exports = WeatherService;
