import {
  Avatar,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  VStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";

import { Link as RouterLink } from "react-router-dom";

import { FiChevronDown, FiUser, FiSettings, FiLogOut } from "react-icons/fi";

function getDisplayName(user) {
  if (user?.name?.firstName) {
    return `${user.name.firstName} ${user.name.lastName || ""}`.trim();
  }

  if (typeof user?.name === "string") {
    return user.name;
  }

  return (
    user?.organizationName ||
    user?.hospital?.hospitalName ||
    user?.hospitalName ||
    "User"
  );
}

export default function DashboardNavbar({
  user,
  config,
  logout,
  isLoggingOut,
}) {
  const bg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const displayName = getDisplayName(user);

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={6}
      h={20}
      align="center"
      justify="flex-end"
      bg={bg}
      borderBottom="1px solid"
      borderColor={borderColor}
    >
      <Menu>
        <MenuButton>
          <HStack spacing={3}>
            <Avatar
              size="sm"
              name={displayName}
              bg={`${config.color}.500`}
              color="white"
            />

            <VStack
              display={{ base: "none", md: "flex" }}
              align="start"
              spacing={1}
            >
              <Text fontSize="sm" fontWeight="bold">
                {displayName}
              </Text>

              <Text fontSize="xs" color="gray.500">
                {config.label}
              </Text>
            </VStack>

            <Icon as={FiChevronDown} />
          </HStack>
        </MenuButton>

        <MenuList bg={bg} borderColor={borderColor}>
          <MenuItem
            as={RouterLink}
            to={`${config.basePath}/profile`}
            icon={<FiUser />}
          >
            Profile
          </MenuItem>

          <MenuItem
            as={RouterLink}
            to={`${config.basePath}/settings`}
            icon={<FiSettings />}
          >
            Settings
          </MenuItem>

          <MenuDivider />

          <MenuItem
            icon={<FiLogOut />}
            onClick={logout}
            isDisabled={isLoggingOut}
            color="red.500"
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
}
