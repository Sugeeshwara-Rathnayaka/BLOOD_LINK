import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Select,
} from "@chakra-ui/react";
import { FaUserShield, FaEye, FaEyeSlash } from "react-icons/fa"; // Changed icon
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BloodBankAdmin"); // Default to standard admin
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const routeUserToDashboard = (userRole) => {
    if (userRole === "SuperAdmin") navigate("/superadmin/dashboard");
    else if (userRole === "BloodBankAdmin") navigate("/bloodbank/dashboard");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", {
        identifier,
        password,
        role,
      });
      login(data.user, data.token);
      toast({ title: "Authorized", status: "success", duration: 3000 });
      routeUserToDashboard(role);
    } catch (error) {
      toast({
        title: "Access Denied",
        description: error.response?.data?.message || "Invalid credentials.",
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg={bg} py={16} px={[4, 8, 16]}>
      <Flex maxW="md" mx="auto" direction="column">
        <VStack spacing={4} textAlign="center" mb={10}>
          {/* Using a shield icon to indicate a secure internal portal */}
          <Icon as={FaUserShield} w={12} h={12} color="blue.600" />
          <Heading size="xl">Staff Portal</Heading>
          <Text fontSize="md" color="gray.500">
            Authorized personnel only.
          </Text>
        </VStack>

        <Box
          bg={cardBg}
          p={8}
          borderRadius="2xl"
          borderWidth="1px"
          boxShadow="lg"
        >
          <form onSubmit={handleLogin}>
            <VStack spacing={5}>
              <FormControl isRequired>
                <FormLabel>Admin Level</FormLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  focusBorderColor="blue.500"
                >
                  <option value="BloodBankAdmin">Blood Bank Admin</option>
                  <option value="SuperAdmin">System Super Admin</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Admin ID / Username</FormLabel>
                <Input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  focusBorderColor="blue.500"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    focusBorderColor="blue.500"
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w="full"
                mt={4}
                isLoading={isLoading}
              >
                Secure Login
              </Button>
            </VStack>
          </form>
        </Box>
      </Flex>
    </Box>
  );
}
