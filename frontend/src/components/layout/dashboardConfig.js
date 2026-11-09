import {
  FiHome,
  FiActivity,
  FiUsers,
  FiDroplet,
  FiHeart,
} from "react-icons/fi";
import { ROLES } from "../../config/roles.js";

export const dashboardConfig = {
  [ROLES.SUPER_ADMIN]: {
    label: "Super Admin",
    color: "red",
    basePath: "/superadmin",
    links: [
      { name: "Overview", icon: FiHome, path: "/superadmin/dashboard" },
      { name: "System Logs", icon: FiActivity, path: "/superadmin/logs" },
      { name: "Manage Users", icon: FiUsers, path: "/superadmin/users" },
    ],
  },

  [ROLES.BLOOD_BANK]: {
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

  [ROLES.HOSPITAL]: {
    label: "Hospital",
    color: "teal",
    basePath: "/hospital",
    links: [
      { name: "Dashboard", icon: FiHome, path: "/hospital/dashboard" },
      { name: "Request Blood", icon: FiActivity, path: "/hospital/request" },
    ],
  },

  [ROLES.DONOR]: {
    label: "Blood Donor",
    color: "green",
    basePath: "/donor",
    links: [
      { name: "Dashboard", icon: FiHome, path: "/donor/dashboard" },
      { name: "Donation History", icon: FiDroplet, path: "/donor/history" },
    ],
  },

  [ROLES.ORGANIZATION]: {
    label: "Organization",
    color: "blue",
    basePath: "/organization",
    links: [
      { name: "Dashboard", icon: FiHome, path: "/organization/dashboard" },
      { name: "Host a Camp", icon: FiHeart, path: "/organization/camps" },
    ],
  },

  [ROLES.REQUESTER]: {
    label: "Requester",
    color: "orange",
    basePath: "/requester",
    links: [
      { name: "Dashboard", icon: FiHome, path: "/requester/dashboard" },
      { name: "My Requests", icon: FiActivity, path: "/requester/history" },
    ],
  },
};

const fallback = { label: "User", color: "gray", basePath: "", links: [] };
export const getDashboardConfig = (role) => dashboardConfig[role] ?? fallback;

// Replaces the dashboardRoutes map in ProtectedRoute
export const getHomePath = (role) => {
  const { basePath } = getDashboardConfig(role);
  return basePath ? `${basePath}/dashboard` : "/";
};
