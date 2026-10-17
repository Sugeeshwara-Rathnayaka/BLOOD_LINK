export function isValidRegistrationNumber(regNo) {
  if (!regNo || typeof regNo !== "string") return false;

  const cleaned = regNo.trim().toUpperCase();

  // Pattern 1: Private Companies (e.g., PV1234, PV 123456)
  const privateCompanyRegex = /^PV\s?\d+$/;

  // Pattern 2: Local/Foreign NGOs & Trusts (e.g., L-32101, FL-13607)
  const ngoTrustRegex = /^(L|FL)\s?-\s?\d+$/;

  // Pattern 3: General fallback for other local business or municipal registrations
  const generalBusinessRegex = /^[A-Z0-9/\-\s]{3,30}$/;

  return (
    privateCompanyRegex.test(cleaned) ||
    ngoTrustRegex.test(cleaned) ||
    generalBusinessRegex.test(cleaned)
  );
}
