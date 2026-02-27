const app = require("./src/app");
const pool = require("./src/config/db");

(async () => {
  await pool.testConnection();

  app.listen(3000, () => {
    console.log("🚀 Backend running on port 3000");
  });
})();
