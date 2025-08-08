const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");

// সঠিক ফাইল পাথ
const inputFile = path.join(__dirname, "../data/comments.json");
const outputFile = path.join(__dirname, "../data/processed_comments.json");

console.log("🔍 Looking for file at:", inputFile);

try {
  // ফাইল এক্সিস্টেন্স চেক
  if (!fs.existsSync(inputFile)) {
    throw new Error(`File not found at: ${inputFile}`);
  }

  const rawData = fs.readFileSync(inputFile, "utf8");
  const lines = rawData
    .split("\n")
    .filter((line) => line.trim() !== "" && !line.includes("$$indexCreated"));

  const processedData = lines
    .map((line) => {
      try {
        const doc = JSON.parse(line);
        return {
          _id: new ObjectId(),
          postId: doc.postId,
          userId: doc.userId,
          text: doc.text,
          createdAt: new Date(doc.createdAt.$$date),
          originalId: doc._id,
        };
      } catch (parseError) {
        console.error("Error parsing line:", line);
        return null;
      }
    })
    .filter(Boolean);

  fs.writeFileSync(outputFile, JSON.stringify(processedData, null, 2));
  console.log("✅ Success! Output saved to:", outputFile);
} catch (err) {
  console.error("❌ Error:", err.message);
  console.log("ℹ️ Make sure:");
  console.log("1. comments.json exists in the data folder");
  console.log("2. File path is correct");
}
