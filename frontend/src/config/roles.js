export const ROLES = {
  SUPER_ADMIN: "SuperAdmin",
  BLOOD_BANK: "BloodBankAdmin",
  HOSPITAL: "Hospital",
  DONOR: "Donor",
  ORGANIZATION: "Organization",
  REQUESTER: "Requester",
};

export const PUBLIC_LOGIN_ROLES = [
  ROLES.DONOR,
  ROLES.REQUESTER,
  ROLES.ORGANIZATION,
  ROLES.HOSPITAL,
  ROLES.BLOOD_BANK,
];
