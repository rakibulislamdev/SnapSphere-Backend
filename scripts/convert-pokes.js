const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");

console.log("🔍 Checking files...");

// Correct paths when running from scripts folder
const inputFile = path.join(__dirname, "../data/pokes.json");
const outputFile = path.join(__dirname, "../data/processed_pokes.json");

console.log(`Input: ${inputFile}`);
console.log(`Output: ${outputFile}`);

// Create data directory if missing
if (!fs.existsSync(path.dirname(inputFile))) {
  fs.mkdirSync(path.dirname(inputFile), { recursive: true });
}

try {
  if (!fs.existsSync(inputFile)) {
    throw new Error(
      `❌ Missing input file!\nCreate 'poke.json' in backend/data/`
    );
  }

  const data = fs.readFileSync(inputFile, "utf8");
  const lines = data
    .split("\n")
    .filter((line) => line.trim() && !line.includes("$$indexCreated"));

  console.log(`📊 Found ${lines.length} records`);

  const result = lines
    .map((line) => {
      try {
        const doc = JSON.parse(line);
        return {
          _id: new ObjectId(doc._id),
          fromUserId: doc.fromUserId,
          toUserId: doc.toUserId,
          status: doc.status || "pending",
          createdAt: new Date(doc.createdAt?.$$date || Date.now()),
          updatedAt: new Date(doc.updatedAt?.$$date || Date.now()),
        };
      } catch (e) {
        console.error(`⚠️ Error parsing: ${line.substring(0, 50)}...`);
        return null;
      }
    })
    .filter(Boolean);

  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  console.log(`✅ Success! Saved ${result.length} records to:\n${outputFile}`);
} catch (err) {
  console.error("💥 Conversion failed:", err.message);
  console.log("\n🔧 Fix these issues:");
  console.log("1. Create backend/data/poke.json");
  console.log("2. Check file permissions");
  console.log("3. Verify JSON formatting");
  process.exit(1);
}
