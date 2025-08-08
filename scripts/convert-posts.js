const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");

// সঠিক রিলেটিভ পাথ ব্যবহার করুন
const inputFile = path.join(__dirname, "../data/posts.json");
const outputFile = path.join(__dirname, "../data/processed_posts.json");

console.log("🔍 Processing posts data...");
console.log("Input file location:", inputFile);

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
          _id: doc._id, // বা new ObjectId(doc._id)
          userId: doc.userId,
          caption: doc.caption,
          image: doc.image.replace(/^uploads[\\/]/, ""), // পাথ ফরম্যাটিং
          likes: doc.likes || [],
          createdAt: new Date(doc.createdAt.$$date),
          updatedAt: new Date(doc.updatedAt.$$date),
        };
      } catch (parseErr) {
        console.error("Error parsing line:", line);
        return null;
      }
    })
    .filter(Boolean);

  fs.writeFileSync(outputFile, JSON.stringify(processedData, null, 2));
  console.log("✅ Success! Processed data saved to:", outputFile);
} catch (err) {
  console.error("❌ Error:", err.message);
  console.log("Please check:");
  console.log("1. File exists at the specified path");
  console.log("2. You have proper read/write permissions");
}
