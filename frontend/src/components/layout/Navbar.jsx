import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  useColorModeValue,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaHeartbeat } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  const navBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const getDashboardRoute = () => {
    if (!user) return "/login";
    return `/${user.role === "BloodBankAdmin" ? "bloodbank" : user.role.toLowerCase()}/dashboard`;
  };

  return (
    <Box
      position="fixed"
      top={0}
      w="full"
      zIndex={100}
      bg={navBg}
      boxShadow="sm"
      borderBottom="1px solid"
      borderColor={borderColor}
      px={[4, 8, 16]}
      py={4}
    >
      <Flex justify="space-between" align="center" maxW="7xl" mx="auto">
        <HStack as={RouterLink} to="/" spacing={2} _hover={{ opacity: 0.8 }}>
          <Icon as={FaHeartbeat} w={8} h={8} color="red.500" />
          <Heading size="md" color="red.500" letterSpacing="tight">
            Blood-Link
          </Heading>
        </HStack>
        <HStack spacing={8} display={{ base: "none", md: "flex" }}>
          <ChakraLink fontWeight="medium" _hover={{ color: "red.500" }}>
            How it Works
          </ChakraLink>
          <ChakraLink fontWeight="medium" _hover={{ color: "red.500" }}>
            Who Can Donate
          </ChakraLink>
          <ChakraLink fontWeight="medium" _hover={{ color: "red.500" }}>
            Hospitals
          </ChakraLink>
        </HStack>
        <HStack spacing={4}>
          {user ? (
            <Button
              as={RouterLink}
              to={getDashboardRoute()}
              colorScheme="red"
              variant="solid"
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                as={RouterLink}
                to="/login"
                variant="ghost"
                colorScheme="red"
              >
                Sign In
              </Button>
              <Button as={RouterLink} to="/register" colorScheme="red">
                Register
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
