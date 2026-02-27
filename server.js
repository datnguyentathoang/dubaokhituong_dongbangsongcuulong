const app = require("./src/app");
const pool = require("./src/config/db");

(async () => {
  await pool.testConnection();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
  });
})();
