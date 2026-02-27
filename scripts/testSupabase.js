require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("\n🔍 Testing Supabase Connection...\n");
console.log("URL:", supabaseUrl);
console.log(
  "Key:",
  supabaseKey ? supabaseKey.substring(0, 20) + "..." : "NOT SET",
);

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

async function testConnection() {
  try {
    // Test 1: Try to fetch communes
    console.log("\n1️⃣ Fetching communes from database...");
    const { data: communes, error: communeError } = await supabase
      .from("communes")
      .select("ma_xa, ten_xa")
      .limit(5);

    if (communeError) {
      console.error("❌ Error fetching communes:", communeError);
      console.error("   Message:", communeError.message);
      console.error("   Code:", communeError.code);
      console.error("   Hint:", communeError.hint);
    } else {
      console.log("✅ Communes fetched:", communes.length, "rows");
      console.table(communes.slice(0, 3));
    }

    // Test 2: Check all tables
    console.log("\n2️⃣ Checking available tables...");
    const { data: tables, error: tableError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    if (tableError) {
      console.error("❌ Error fetching tables:", tableError.message);
    } else {
      console.log("✅ Available tables:");
      const tableNames = tables.map((t) => t.table_name);
      console.log("  ", tableNames.join(", "));
    }

    // Test 3: Check stations
    console.log("\n3️⃣ Fetching stations...");
    const { data: stations, error: stationError } = await supabase
      .from("stations")
      .select("id, name")
      .limit(3);

    if (stationError) {
      console.error("❌ Error fetching stations:", stationError.message);
    } else {
      console.log("✅ Stations fetched:", stations.length, "rows");
      console.table(stations);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Supabase connection is working!");
    console.log("=".repeat(60) + "\n");
  } catch (err) {
    console.error("❌ Unexpected error:", err.message);
  }
}

testConnection();
