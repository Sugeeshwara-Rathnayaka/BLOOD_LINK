/**
 * 🇱🇰 Sri Lankan District Utility
 * ----------------------------------------
 * This file acts as the "Single Source of Truth" for all 25 districts.
 * It ensures that Donors, Hospitals, and Requesters all use the exact same spelling.
 */

// 1️⃣ The Rich Data (Keep this! It's valuable)
export const DISTRICT_DATA = [
  { name: "Ampara", province: "Eastern" },
  { name: "Anuradhapura", province: "North Central" },
  { name: "Badulla", province: "Uva" },
  { name: "Batticaloa", province: "Eastern" },
  { name: "Colombo", province: "Western" },
  { name: "Galle", province: "Southern" },
  { name: "Gampaha", province: "Western" },
  { name: "Hambantota", province: "Southern" },
  { name: "Jaffna", province: "Northern" },
  { name: "Kalutara", province: "Western" },
  { name: "Kandy", province: "Central" },
  { name: "Kegalle", province: "Sabaragamuwa" },
  { name: "Kilinochchi", province: "Northern" },
  { name: "Kurunegala", province: "North Western" },
  { name: "Mannar", province: "Northern" },
  { name: "Matale", province: "Central" },
  { name: "Matara", province: "Southern" },
  { name: "Monaragala", province: "Uva" },
  { name: "Mullaitivu", province: "Northern" },
  { name: "Nuwara Eliya", province: "Central" },
  { name: "Polonnaruwa", province: "North Central" },
  { name: "Puttalam", province: "North Western" },
  { name: "Ratnapura", province: "Sabaragamuwa" },
  { name: "Trincomalee", province: "Eastern" },
  { name: "Vavuniya", province: "Northern" },
];

// 2️⃣ The Extracted List for Mongoose (Automatic)
// This creates: ["Ampara", "Anuradhapura", "Badulla", ...]
export const DISTRICT_NAMES = DISTRICT_DATA.map((d) => d.name);

// 3️⃣ The Auto-Formatter (Setter)
// Converts "colombo", "COLOMBO", or "CoLoMbO" -> "Colombo"
export const formatDistrictName = (value) => {
  if (!value) return value;
  // Capitalize first letter, lowercase the rest
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

// 5️⃣ The Helper to find Province by District
export const getProvinceByDistrict = (districtName) => {
  if (!districtName) return null;
  const district = DISTRICT_DATA.find(
    (d) => d.name.toLowerCase() === districtName.toLowerCase(),
  );
  return district ? district.province : null;
};

// 4️⃣ The Validator (For manual checks in controllers)
// Returns true if valid, false if invalid
export const isValidDistrict = (value) => {
  if (!value) return false;
  const formatted = formatDistrictName(value);
  return DISTRICT_NAMES.includes(formatted); // Check if it exists in our simple list of names
};
