const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");

const inputFile = path.join(__dirname, "../data/tokens.json");
const outputFile = path.join(__dirname, "../data/processed_tokens.json");

console.log("🔁 Processing tokens data...");

try {
  const rawData = fs.readFileSync(inputFile, "utf8");
  const lines = rawData
    .split("\n")
    .filter((line) => line.trim() !== "" && !line.includes("$$indexCreated"));

  const processedData = lines.map((line) => {
    const doc = JSON.parse(line);

    // তারিখ কনভার্ট করার ফাংশন
    const convertDate = (dateObj) => {
      if (dateObj?.$$date) return new Date(dateObj.$$date);
      return new Date();
    };

    return {
      _id: ObjectId.isValid(doc._id) ? new ObjectId(doc._id) : new ObjectId(),
      userId: doc.userId,
      token: doc.token,
      type: doc.type || "refresh", // ডিফল্ট টাইপ
      expiresAt: convertDate(doc.expiresAt),
      createdAt: convertDate(doc.createdAt),
      updatedAt: convertDate(doc.createdAt), // যদি updatedAt না থাকে
    };
  });

  fs.writeFileSync(outputFile, JSON.stringify(processedData, null, 2));
  console.log(`✅ Success! Processed ${processedData.length} tokens.`);
  console.log(`📁 Output saved to: ${outputFile}`);
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}
