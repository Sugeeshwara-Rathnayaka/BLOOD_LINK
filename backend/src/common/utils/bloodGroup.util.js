/**
 * 🩸 Blood Group Utility
 * ----------------------------------------
 * Single source of truth for all blood types in the system.
 */

// 1️⃣ The Rich Data
export const BLOOD_GROUP_DATA = [
  { type: "O+", description: "O Positive" },
  { type: "O-", description: "O Negative" },
  { type: "A+", description: "A Positive" },
  { type: "A-", description: "A Negative" },
  { type: "B+", description: "B Positive" },
  { type: "B-", description: "B Negative" },
  { type: "AB+", description: "AB Positive" },
  { type: "AB-", description: "AB Negative" },
];
// 2️⃣ Extracted List for Mongoose: ["O+", "O-", "A+", ...]
export const BLOOD_GROUPS = BLOOD_GROUP_DATA.map((bg) => bg.type);

// 3️⃣ The Auto-Formatter (Setter)
// Converts "a+" -> "A+", "ab-" -> "AB-"
export const formatBloodGroup = (value) => {
  if (!value) return value;
  // Simple UpperCase handles everything correctly for blood groups!
  return value.toUpperCase();
};

// 4️⃣ The Validator (For manual checks in controllers)
// Returns true if valid, false if invalid
export const isValidBloodGroup = (value) => {
  if (!value) return false;
  return BLOOD_GROUPS.includes(value.toUpperCase());
};

// 5️⃣ Helper: Get Description (Optional UI Helper)
// e.g., getDescription("O+") returns "O Positive"
export const getBloodGroupDescription = (value) => {
  const match = BLOOD_GROUP_DATA.find((bg) => bg.type === value?.toUpperCase());
  return match ? match.description : null;
};
