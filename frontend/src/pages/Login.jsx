import { useState } from "react";
import { useNavigate, Link as RouterLink, useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  VStack,
  useColorModeValue,
  Icon,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { FaHeartbeat, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Login() {
  const { roleId } = useParams(); // Get the roleId from the URL
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textMuted = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.900", "white");

  // State matches the backend requirements exactly
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const routeUserToDashboard = (userRole) => {
    switch (userRole) {
      case "SuperAdmin":
        navigate("/superadmin/dashboard");
        break;
      case "BloodBankAdmin":
        navigate("/bloodbank/dashboard");
        break;
      case "Hospital":
        navigate("/hospital/dashboard");
        break;
      case "Donor":
        navigate("/donor/dashboard");
        break;
      case "Requester":
        navigate("/requester/dashboard");
        break;
      case "Organization":
        navigate("/organization/dashboard");
        break;
      default:
        navigate("/");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sends identifier, password, and role just like your controller requires
      const { data } = await api.post("/auth/login", {
        identifier,
        password,
        role: roleId, // Use the roleId from the URL
      });

      // Pass the user and token to your AuthContext
      login(data.user, data.token);

      toast({
        title: "Login Successful",
        description: `Welcome back!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Route based on the role we selected
      routeUserToDashboard(roleId);
    } catch (error) {
      toast({
        title: "Authentication Failed",
        // Safely captures your backend ErrorHandler messages (like "Invalid credentials" or "Pending approval")
        description: error.response?.data?.message || "Something went wrong.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg={bg} py={16} px={[4, 8, 16]}>
      <Flex maxW="md" mx="auto" direction="column">
        <VStack spacing={4} textAlign="center" mb={10}>
          <Icon as={FaHeartbeat} w={12} h={12} color="red.500" />
          <Heading size="xl" color={headingColor}>
            Welcome Back
          </Heading>
          <Text fontSize="md" color={textMuted}>
            Sign in to access your Blood-Link dashboard.
          </Text>
        </VStack>

        <Box
          bg={cardBg}
          p={8}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="lg"
        >
          <form onSubmit={handleLogin}>
            <VStack spacing={5}>
              {/* 1. ROLE SELECTION */}
              <FormControl isRequired>
                <FormLabel>Account Type</FormLabel>
                <Input
                  placeholder={roleId}
                  focusBorderColor="red.500"
                  value={roleId}
                  isDisabled // Disable the select to prevent changing role on this page
                ></Input>
              </FormControl>

              {/* 2. IDENTIFIER INPUT (NIC or Username) */}
              <FormControl isRequired>
                <FormLabel>
                  {roleId === "Hospital" || roleId === "Organization"
                    ? "Username"
                    : "NIC Number"}
                </FormLabel>
                <Input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    roleId === "Hospital" || roleId === "Organization"
                      ? "Enter username"
                      : "Enter NIC"
                  }
                  focusBorderColor="red.500"
                />
              </FormControl>

              {/* 3. PASSWORD INPUT */}
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    focusBorderColor="red.500"
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                colorScheme="red"
                size="lg"
                w="full"
                mt={4}
                isLoading={isLoading}
                loadingText="Authenticating..."
              >
                Sign In
              </Button>
            </VStack>
          </form>
        </Box>

        <Text textAlign="center" mt={8} color={textMuted}>
          Don't have an account?{" "}
          <Text
            as={RouterLink}
            to="/role-selection"
            color="red.500"
            fontWeight="bold"
            _hover={{ textDecoration: "underline" }}
          >
            Register here
          </Text>
        </Text>
      </Flex>
    </Box>
  );
}
