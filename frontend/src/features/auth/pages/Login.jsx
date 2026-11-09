import { useState } from "react";
import {
  useNavigate,
  Link as RouterLink,
  useParams,
  useLocation,
  Navigate,
} from "react-router-dom";
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
import { FaHeartbeat, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import { ROLES, PUBLIC_LOGIN_ROLES } from "../../../config/roles";
import {
  getDashboardConfig,
  getHomePath,
} from "../../../components/layout/dashboardConfig";

export default function Login() {
  const { roleId } = useParams(); // Get the roleId from the URL
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textMuted = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.900", "white");
  const staffBg = useColorModeValue("gray.100", "gray.900");

  // State matches the backend requirements exactly
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!PUBLIC_LOGIN_ROLES.includes(roleId)) {
    return <Navigate to="/login" replace />;
  }
  const { label } = getDashboardConfig(roleId);
  const isStaff = roleId === ROLES.BLOOD_BANK;
  const accent = isStaff ? "purple" : "red";
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: authenticate. The server sets the HTTP-only cookie.
      // Sends identifier, password, and role just like your controller requires
      await api.post("/auth/login", {
        identifier: identifier.trim(),
        password,
        role: roleId, // Use the roleId from the URL
      });
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    try {
      // Step 2: load the user through the shared auth flow
      const user = await login(); // Get the user data from the response
      if (!user || user.role !== roleId) {
        throw new Error("Could not verify your session. Please try again.");
      }
      toast({
        title: "Login Successful",
        description: `Welcome back to Blood-Link!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      const from = location.state?.from?.pathname;
      navigate(from ?? getHomePath(user.role), { replace: true });
    } catch {
      toast({
        title: "Signed in, but couldn't load your profile",
        description: "Please check your connection and try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg={isStaff ? staffBg : bg} py={16} px={[4, 8, 16]}>
      <Flex maxW="md" mx="auto" direction="column">
        <VStack spacing={4} textAlign="center" mb={10}>
          <Icon
            as={isStaff ? FaShieldAlt : FaHeartbeat}
            w={12}
            h={12}
            color={`${accent}.500`}
          />
          <Heading size="xl" color={headingColor}>
            {isStaff ? "Staff Portal" : "Welcome Back"}
          </Heading>
          <Text fontSize="md" color={textMuted}>
            {isStaff
              ? `${label} staff sign in.`
              : "Sign in to access your Blood-Link dashboard."}
          </Text>
        </VStack>

        <Box
          bg={cardBg}
          p={8}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={borderColor}
          borderTopWidth={isStaff ? "4px" : "1px"}
          borderTopColor={isStaff ? `${accent}.500` : borderColor}
          boxShadow="lg"
        >
          <form onSubmit={handleLogin}>
            <VStack spacing={5}>
              {/* 1. ACCOUNT TYPE */}
              {!isStaff && (
                <FormControl>
                  <FormLabel>Account Type</FormLabel>
                  <Input
                    focusBorderColor={`${accent}.500`}
                    value={getDashboardConfig(roleId).label}
                    isReadOnly
                  />
                </FormControl>
              )}
              {/* 2. IDENTIFIER INPUT (NIC or Username) */}
              <FormControl isRequired>
                <FormLabel>
                  {roleId === "Hospital" || roleId === "Organization"
                    ? "Username"
                    : "NIC Number"}
                </FormLabel>
                <Input
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    roleId === "Hospital" || roleId === "Organization"
                      ? "Enter username"
                      : "Enter NIC"
                  }
                  focusBorderColor={`${accent}.500`}
                />
              </FormControl>

              {/* 3. PASSWORD INPUT */}
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    focusBorderColor={`${accent}.500`}
                    pr="2.75rem"
                    sx={{
                      "&::-ms-reveal": { display: "none" },
                      "&::-ms-clear": { display: "none" },
                    }}
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
                colorScheme={accent}
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
          {isStaff ? (
            <>
              Not staff?{" "}
              <Text
                as={RouterLink}
                to="/login"
                color="purple.500"
                fontWeight="bold"
                _hover={{ textDecoration: "underline" }}
              >
                Go to the main sign in
              </Text>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <Text
                as={RouterLink}
                to="/register"
                color="red.500"
                fontWeight="bold"
                _hover={{ textDecoration: "underline" }}
              >
                Register here
              </Text>
            </>
          )}
        </Text>
      </Flex>
    </Box>
  );
}
