const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");

const inputFile = path.join(__dirname, "../data/users.json");
const outputFile = path.join(__dirname, "../data/processed_users.json");

console.log("🔁 Processing users data...");

try {
  const rawData = fs.readFileSync(inputFile, "utf8");
  const lines = rawData
    .split("\n")
    .filter((line) => line.trim() !== "" && !line.includes("$$indexCreated"));

  const processedData = lines.map((line) => {
    const doc = JSON.parse(line);

    // ইমেজ পাথ ফরম্যাটিং (ব্যাকস্ল্যাশ থেকে ফরওয়ার্ড স্ল্যাশ)
    const formatImagePath = (path) => {
      if (!path) return null;
      return path.replace(/\\/g, "/");
    };

    // তারিখ কনভার্ট করার ফাংশন
    const convertDate = (dateObj) => {
      if (dateObj?.$$date) return new Date(dateObj.$$date);
      return new Date();
    };

    return {
      _id: ObjectId.isValid(doc._id) ? new ObjectId(doc._id) : new ObjectId(),
      name: doc.name,
      email: doc.email,
      password: doc.password, // BCrypt হ্যাশড পাসওয়ার্ড
      avatar: formatImagePath(doc.avatar),
      bio: doc.bio || "",
      website: doc.website || "",
      gender: doc.gender || "",
      createdAt: convertDate(doc.createdAt),
      updatedAt: convertDate(doc.createdAt), // যদি updatedAt না থাকে
    };
  });

  fs.writeFileSync(outputFile, JSON.stringify(processedData, null, 2));
  console.log(`✅ Success! Processed ${processedData.length} users.`);
  console.log(`📁 Output saved to: ${outputFile}`);
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}
