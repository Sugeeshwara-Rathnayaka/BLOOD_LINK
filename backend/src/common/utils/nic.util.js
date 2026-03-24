/**
 * Sri Lanka NIC utility
 * - Supports old (9 digits + V/X)
 * - Supports new (12 digits)
 * - Extracts DOB + Gender
 * - VALIDATION ONLY (no auto-filling)
 */

export function isValidNICFormat(nic) {
  return /^(\d{9}[VXvx]|\d{12})$/.test(nic);
}

export function extractNICDetails(nic) {
  if (!isValidNICFormat(nic)) return null;

  let year;
  let dayOfYear;

  // Old NIC: YYDDD[V/X]
  if (/^\d{9}[VXvx]$/.test(nic)) {
    year = parseInt(`19${nic.substring(0, 2)}`, 10);
    dayOfYear = parseInt(nic.substring(2, 5), 10);
  }
  // New NIC: YYYYDDDXXXX
  else {
    year = parseInt(nic.substring(0, 4), 10);
    dayOfYear = parseInt(nic.substring(4, 7), 10);
  }

  let gender = "Male";
  if (dayOfYear > 500) {
    gender = "Female";
    dayOfYear -= 500;
  }

  if (dayOfYear < 1 || dayOfYear > 366) return null;

  const dob = new Date(year, 0);
  dob.setDate(dayOfYear);

  return { dob, gender };
}

export function doesDOBMatchNIC(nic, dob) {
  const details = extractNICDetails(nic);
  if (!details) return false;

  return (
    dob.getFullYear() === details.dob.getFullYear() &&
    dob.getMonth() === details.dob.getMonth() &&
    dob.getDate() === details.dob.getDate()
  );
}

export function doesGenderMatchNIC(nic, gender) {
  const details = extractNICDetails(nic);
  if (!details) return false;

  return details.gender === gender;
}

export function calculateAge(dob) {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}
