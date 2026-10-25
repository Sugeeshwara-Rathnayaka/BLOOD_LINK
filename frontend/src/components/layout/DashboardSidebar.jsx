import {
  Box,
  Badge,
  CloseButton,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";

import { NavLink } from "react-router-dom";
import { FaHeartbeat } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";

function NavItem({ item, onClose }) {
  return (
    <NavLink
      to={item.path}
      end={item.path.endsWith("/dashboard")}
      onClick={onClose}
      style={{ textDecoration: "none" }}
    >
      {({ isActive }) => (
        <Flex
          align="center"
          p={4}
          mx={4}
          mb={2}
          borderRadius="lg"
          bg={isActive ? "red.50" : "transparent"}
          color={isActive ? "red.600" : "inherit"}
          fontWeight={isActive ? "bold" : "normal"}
          _hover={{ bg: "red.400", color: "white" }}
        >
          <Icon
            as={item.icon}
            mr={4}
            fontSize="16"
            color={isActive ? "red.500" : "gray.500"}
            _groupHover={{ color: "white" }}
          />

          {item.name}
        </Flex>
      )}
    </NavLink>
  );
}

function SidebarContent({ config, onClose, isMobile = false }) {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const sidebarBg = useColorModeValue("white", "gray.900");

  return (
    <Box
      bg={sidebarBg}
      borderRight="1px solid"
      borderColor={borderColor}
      w="full"
      h="full"
    >
      <Flex h="20" align="center" mx={8} justify="space-between">
        <HStack spacing={2}>
          <Icon as={FaHeartbeat} boxSize={8} color="red.500" />

          <Heading size="md" color="red.500">
            Blood-Link
          </Heading>
        </HStack>

        {isMobile && <CloseButton onClick={onClose} />}
      </Flex>

      <Box mb={6} px={8}>
        <Badge colorScheme={config.color} variant="subtle" p={2}>
          {config.label} Dashboard
        </Badge>
      </Box>

      {config.links.map((item) => (
        <NavItem key={item.path} item={item} onClose={onClose} />
      ))}
    </Box>
  );
}

export default function DashboardSidebar({ config, isOpen, onClose, onOpen }) {
  return (
    <>
      {/* Desktop sidebar */}
      <Box
        display={{ base: "none", md: "block" }}
        position="fixed"
        left={0}
        top={0}
        bottom={0}
        w={60}
        zIndex={10}
      >
        <SidebarContent config={config} onClose={onClose} />
      </Box>

      {/* Mobile menu button */}
      <Box
        display={{ base: "block", md: "none" }}
        position="fixed"
        top={4}
        left={4}
        zIndex={20}
      >
        <IconButton
          as={FiMenu}
          boxSize={6}
          cursor="pointer"
          onClick={onOpen}
          aria-label="Open navigation"
        />
      </Box>

      {/* Mobile drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />

        <DrawerContent>
          <SidebarContent config={config} onClose={onClose} isMobile />
        </DrawerContent>
      </Drawer>
    </>
  );
}
