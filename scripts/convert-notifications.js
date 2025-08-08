const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");

const inputFile = path.join(__dirname, "../data/notifications.json");
const outputFile = path.join(__dirname, "../data/processed_notifications.json");

console.log("🔁 Processing notifications data...");

try {
  const rawData = fs.readFileSync(inputFile, "utf8");
  const lines = rawData
    .split("\n")
    .filter((line) => line.trim() !== "" && !line.includes("$$indexCreated"));

  const processedData = lines.map((line) => {
    const doc = JSON.parse(line);

    // Handle date conversion (supports both $$date and ISO format)
    const getDate = (dateObj) => {
      if (dateObj?.$$date) return new Date(dateObj.$$date);
      if (dateObj instanceof Date || typeof dateObj === "string")
        return new Date(dateObj);
      return new Date();
    };

    return {
      _id: ObjectId.isValid(doc._id) ? new ObjectId(doc._id) : new ObjectId(),
      type: doc.type,
      userId: doc.userId,
      fromUserId: doc.fromUserId,
      postId: doc.postId || null,
      isRead: doc.isRead || false,
      createdAt: getDate(doc.createdAt),
      updatedAt: getDate(doc.updatedAt || doc.createdAt),
    };
  });

  fs.writeFileSync(outputFile, JSON.stringify(processedData, null, 2));
  console.log(`✅ Success! Processed ${processedData.length} notifications.`);
  console.log(`📁 Output saved to: ${outputFile}`);
} catch (err) {
  console.error("❌ Error:", err.message);
  console.log("💡 Ensure your JSON file:");
  console.log("1. Has valid _id fields (12-byte or 24-character hex string)");
  console.log("2. Contains properly formatted dates");
  process.exit(1);
}
