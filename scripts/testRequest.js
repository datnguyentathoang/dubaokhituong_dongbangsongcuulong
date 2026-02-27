const http = require("http");

const url =
  "http://localhost:3000/api/salinity/monthly-chart?station_id=5&month=2026-01-01";
http
  .get(url, (res) => {
    console.log("Status:", res.statusCode);
    console.log("Headers:", res.headers);
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => console.log("Body:", data));
  })
  .on("error", (err) => console.error("Error:", err));
