import { Box, useDisclosure, useColorModeValue } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardSidebar from "./DashboardSidebar";
import DashboardNavbar from "./DashboardNavbar";
import { getDashboardConfig } from "./dashboardConfig";

export default function DashboardLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout, isLoggingOut } = useAuth();
  const bg = useColorModeValue("gray.50", "gray.900");
  const config = getDashboardConfig(user?.role);

  return (
    <Box minH="100vh" bg={bg}>
      {/* SIDEBAR FOR DESKTOP */}
      <DashboardSidebar
        config={config}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
      />
      <DashboardNavbar
        user={user}
        config={config}
        logout={logout}
        isLoggingOut={isLoggingOut}
      />

      <Box ml={{ base: 0, md: 60 }} p={4}>
        <Box
          bg={useColorModeValue("white", "gray.800")}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={useColorModeValue("gray.200", "gray.700")}
          p={6}
          minH="calc(100vh - 110px)"
          boxShadow="sm"
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
