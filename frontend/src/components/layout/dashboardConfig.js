import {
  FiHome,
  FiActivity,
  FiUsers,
  FiDroplet,
  FiHeart,
} from "react-icons/fi";

export const dashboardConfig = {
  SuperAdmin: {
    label: "Super Admin",
    color: "red",
    basePath: "/superadmin",
    links: [
      { name: "Overview", icon: FiHome, path: "/superadmin/dashboard" },
      { name: "System Logs", icon: FiActivity, path: "/superadmin/logs" },
      { name: "Manage Users", icon: FiUsers, path: "/superadmin/users" },
    ],
  },

  BloodBankAdmin: {
    label: "Blood Bank",
    color: "purple",
    basePath: "/bloodbank",
    links: [
      { name: "Dashboard", icon: FiHome, path: "/bloodbank/dashboard" },
      {
        name: "Blood Inventory",
        icon: FiDroplet,
        path: "/bloodbank/inventory",
      },
      { name: "Donation Camps", icon: FiHeart, path: "/bloodbank/camps" },
    ],
  },

  Hospital: {
    label: "Hospital",
    color: "teal",
    basePath: "/hospital",
    links: [
      { name: "Dashboard", icon: FiHome, path: "/hospital/dashboard" },
      { name: "Request Blood", icon: FiActivity, path: "/hospital/request" },
    ],
  },

  Donor: {
    label: "Blood Donor",
    color: "green",
    basePath: "/donor",
    links: [
      { name: "Dashboard", icon: FiHome, path: "/donor/dashboard" },
      { name: "Donation History", icon: FiDroplet, path: "/donor/history" },
    ],
  },

  Organization: {
    label: "Organization",
    color: "blue",
    basePath: "/organization",
    links: [
      { name: "Dashboard", icon: FiHome, path: "/organization/dashboard" },
      { name: "Host a Camp", icon: FiHeart, path: "/organization/camps" },
    ],
  },

  Requester: {
    label: "Requester",
    color: "orange",
    basePath: "/requester",
    links: [
      { name: "Dashboard", icon: FiHome, path: "/requester/dashboard" },
      { name: "My Requests", icon: FiActivity, path: "/requester/history" },
    ],
  },
};

export const getDashboardConfig = (role) =>
  dashboardConfig[role] || {
    label: "User",
    color: "gray",
    basePath: "",
    links: [],
  };
