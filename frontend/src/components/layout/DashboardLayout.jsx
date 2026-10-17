import {
  Box,
  Flex,
  Avatar,
  HStack,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  VStack,
  Icon,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Badge,
  CloseButton,
} from "@chakra-ui/react";
import {
  FiHome,
  FiMenu,
  FiChevronDown,
  FiUser,
  FiSettings,
  FiDroplet,
  FiActivity,
  FiUsers,
  FiHeart,
  FiLogOut,
} from "react-icons/fi";
import { Outlet, useLocation, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// 1. Dynamic Links based on Role
const getNavLinks = (role) => {
  const roleLower = role?.toLowerCase() || "";
  const baseDash = `/${roleLower}/dashboard`;

  // You can expand these arrays as you build more pages for each role!
  switch (role) {
    case "SuperAdmin":
      return [
        { name: "Overview", icon: FiHome, path: baseDash },
        { name: "System Logs", icon: FiActivity, path: "/superadmin/logs" },
        { name: "Manage Users", icon: FiUsers, path: "/superadmin/users" },
      ];
    case "BloodBankAdmin":
      return [
        { name: "Dashboard", icon: FiHome, path: baseDash },
        {
          name: "Blood Inventory",
          icon: FiDroplet,
          path: "/bloodbank/inventory",
        },
        { name: "Donation Camps", icon: FiHeart, path: "/bloodbank/camps" },
      ];
    case "Hospital":
      return [
        { name: "Dashboard", icon: FiHome, path: baseDash },
        { name: "Request Blood", icon: FiActivity, path: "/hospital/request" },
      ];
    case "Donor":
      return [
        { name: "My Dashboard", icon: FiHome, path: baseDash },
        { name: "Donation History", icon: FiDroplet, path: "/donor/history" },
      ];
    case "Organization":
      return [
        { name: "Dashboard", icon: FiHome, path: baseDash },
        { name: "Host a Camp", icon: FiHeart, path: "/organization/camps" },
      ];
    case "Requester":
      return [
        { name: "Dashboard", icon: FiHome, path: baseDash },
        { name: "My Requests", icon: FiActivity, path: "/requester/history" },
      ];
    default:
      return [{ name: "Dashboard", icon: FiHome, path: "/" }];
  }
};

// 2. Dynamic UI Styling based on Role
const getRoleStyle = (role) => {
  const styles = {
    SuperAdmin: { label: "Super Admin", color: "red" },
    BloodBankAdmin: { label: "Blood Bank", color: "purple" },
    Hospital: { label: "Hospital", color: "teal" },
    Organization: { label: "Organization", color: "blue" },
    Donor: { label: "Blood Donor", color: "green" },
    Requester: { label: "Requester", color: "orange" },
  };
  return styles[role] || { label: role, color: "gray" };
};

export default function DashboardLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  // const navigate = useNavigate();

  // Safely extract the display name to prevent React object crashes
  const displayName = user?.name?.firstName
    ? `${user.name.firstName} ${user.name.lastName}`
    : user?.name || user?.email || "User";

  const roleStyle = getRoleStyle(user?.role);
  const LinkItems = getNavLinks(user?.role);

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      {/* SIDEBAR FOR DESKTOP */}
      <SidebarContent
        onClose={() => onClose}
        display={{ base: "none", md: "block" }}
        LinkItems={LinkItems}
        roleStyle={roleStyle}
      />

      {/* DRAWER FOR MOBILE */}
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent
            onClose={onClose}
            LinkItems={LinkItems}
            roleStyle={roleStyle}
          />
        </DrawerContent>
      </Drawer>

      {/* TOP HEADER MENU */}
      <MobileNav
        onOpen={onOpen}
        displayName={displayName}
        roleStyle={roleStyle}
        logout={logout}
      />

      {/* MAIN CONTENT AREA */}
      <Box ml={{ base: 0, md: 60 }} p="4">
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

// --- SUB-COMPONENTS ---

const SidebarContent = ({ onClose, LinkItems, roleStyle, ...rest }) => {
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justify="space-between">
        <HStack spacing={3}>
          <Icon as={FiDroplet} boxSize={6} color="red.500" />
          <Text
            fontSize="2xl"
            fontFamily="monospace"
            fontWeight="bold"
            color="red.500"
          >
            Blood-Link
          </Text>
        </HStack>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>

      <Box mb={6} px={8}>
        <Badge
          colorScheme={roleStyle.color}
          variant="subtle"
          px={2}
          py={1}
          borderRadius="md"
        >
          {roleStyle.label} Portal
        </Badge>
      </Box>

      {LinkItems.map((link) => (
        <NavItem
          key={link.name}
          icon={link.icon}
          path={link.path}
          onClick={onClose}
        >
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};

const NavItem = ({ icon, children, path, onClick, ...rest }) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Box
      as={RouterLink}
      to={path}
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        mb="2"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? "red.50" : "transparent"}
        color={isActive ? "red.600" : "inherit"}
        fontWeight={isActive ? "bold" : "normal"}
        _hover={{
          bg: "red.400",
          color: "white",
        }}
        onClick={onClick}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            color={isActive ? "red.500" : "gray.500"}
            _groupHover={{ color: "white" }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Box>
  );
};

const MobileNav = ({ onOpen, displayName, roleStyle, logout, ...rest }) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent={{ base: "space-between", md: "flex-end" }}
      {...rest}
    >
      <IconButton
        display={{ base: "flex", md: "none" }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <HStack spacing={3} display={{ base: "flex", md: "none" }}>
        <Icon as={FiDroplet} boxSize={5} color="red.500" />
        <Text
          fontSize="xl"
          fontFamily="monospace"
          fontWeight="bold"
          color="red.500"
        >
          Blood-Link
        </Text>
      </HStack>

      <HStack spacing={{ base: "0", md: "6" }}>
        <Flex alignItems={"center"}>
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: "none" }}
            >
              <HStack>
                <Avatar
                  size={"sm"}
                  bg={`${roleStyle.color}.500`}
                  color="white"
                  name={displayName}
                />
                <VStack
                  display={{ base: "none", md: "flex" }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm" fontWeight="bold">
                    {displayName}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {roleStyle.label}
                  </Text>
                </VStack>
                <Box display={{ base: "none", md: "flex" }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue("white", "gray.900")}
              borderColor={useColorModeValue("gray.200", "gray.700")}
            >
              <MenuItem icon={<FiUser />}>Profile</MenuItem>
              <MenuItem icon={<FiSettings />}>Settings</MenuItem>
              <MenuDivider />
              <MenuItem
                icon={<FiLogOut />}
                onClick={logout}
                color="red.500"
                fontWeight="bold"
              >
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};
