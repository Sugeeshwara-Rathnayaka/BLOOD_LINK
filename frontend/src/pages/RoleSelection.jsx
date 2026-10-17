import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  useColorModeValue,
  VStack,
  Button,
} from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  FaHeartbeat,
  FaProcedures,
  FaBuilding,
  FaHospital,
  FaArrowLeft,
} from "react-icons/fa";

// Accept the 'mode' prop (defaults to "register" to ensure backward compatibility)
export default function RoleSelection({ mode = "register" }) {
  const navigate = useNavigate();

  // 1. ALL HOOKS EXTRACTED TO THE TOP LEVEL
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.900", "white");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const iconFlexBg = useColorModeValue("gray.50", "gray.700");

  // Specific hover backgrounds for the cards
  const donorHover = useColorModeValue("red.50", "rgba(229, 62, 62, 0.1)");
  const requesterHover = useColorModeValue(
    "orange.50",
    "rgba(221, 107, 32, 0.1)",
  );
  const orgHover = useColorModeValue("blue.50", "rgba(49, 130, 206, 0.1)");
  const hospitalHover = useColorModeValue("teal.50", "rgba(49, 151, 149, 0.1)");

  // 2. Define dynamic text based on the 'mode'
  const isLogin = mode === "login";
  const headerTitle = isLogin ? "Welcome Back" : "Join Blood-Link";
  const headerSubtitle = isLogin
    ? "Select your account type to sign in to your dashboard."
    : "Select how you would like to participate in the nationwide blood grid. Your dashboard and features will be customized based on your selection.";

  const bottomText = isLogin
    ? "Don't have an account?"
    : "Already have an account?";
  const bottomLinkText = isLogin ? "Sign up here" : "Sign in here";
  const bottomLinkTarget = isLogin ? "/register" : "/login";

  // 2. ARRAY USES THE PRE-CALCULATED VARIABLES
  const roles = [
    {
      id: "Donor",
      title: "Blood Donor",
      description:
        "Donate whole blood, platelets, or stem cells to save lives in your community.",
      icon: FaHeartbeat,
      color: "red.500",
      hoverBg: donorHover,
    },
    {
      id: "Requester",
      title: "Patient / Requester",
      description:
        "Register to request emergency blood packets for yourself or a family member.",
      icon: FaProcedures,
      color: "orange.500",
      hoverBg: requesterHover,
    },
    {
      id: "Organization",
      title: "Organization",
      description:
        "Host mobile blood drives and coordinate community donor events with local blood banks.",
      icon: FaBuilding,
      color: "blue.500",
      hoverBg: orgHover,
    },
    {
      id: "Hospital",
      title: "Hospital",
      description:
        "Broadcast emergency inventory requests and track live fleet dispatch to your wards.",
      icon: FaHospital,
      color: "teal.500",
      hoverBg: hospitalHover,
    },
  ];

  const handleRoleSelection = (roleId) => {
    // Dynamically route to either /login/:roleId or /register/:roleId
    navigate(`/${mode}/${roleId}`);
  };

  // 3. JSX USES THE VARIABLES INSTEAD OF INLINE HOOKS
  return (
    <Box minH="100vh" bg={bg} py={12} px={[4, 8, 16]}>
      <Flex maxW="5xl" mx="auto" direction="column">
        <Button
          as={RouterLink}
          to="/"
          variant="ghost"
          alignSelf="flex-start"
          leftIcon={<FaArrowLeft />}
          mb={8}
          color={textColor}
          _hover={{ bg: "transparent", color: "red.500" }}
        >
          Back to Home
        </Button>

        <VStack spacing={4} textAlign="center" mb={12}>
          <Heading size="2xl" color={headingColor}>
            {headerTitle}
          </Heading>
          <Text fontSize="lg" color={textColor} maxW="2xl">
            {headerSubtitle}
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          {roles.map((role) => (
            <Box
              key={role.id}
              as="button"
              onClick={() => handleRoleSelection(role.id)}
              w="full"
              textAlign="left"
              p={8}
              bg={cardBg}
              borderWidth="2px"
              borderColor={borderColor}
              borderRadius="2xl"
              boxShadow="sm"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                borderColor: role.color,
                transform: "translateY(-4px)",
                boxShadow: "xl",
                bg: role.hoverBg,
              }}
            >
              <Flex
                align="center"
                justify="center"
                w={16}
                h={16}
                rounded="xl"
                bg={iconFlexBg}
                mb={6}
                transition="all 0.3s"
              >
                <Icon as={role.icon} w={8} h={8} color={role.color} />
              </Flex>
              <Heading size="md" mb={3} color={headingColor}>
                {role.title}
              </Heading>
              <Text color={textColor} lineHeight="tall">
                {role.description}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        <Text textAlign="center" mt={12} color={textColor}>
          {bottomText}{" "}
          <Text
            as={RouterLink}
            to={bottomLinkTarget}
            color="red.500"
            fontWeight="bold"
            _hover={{ textDecoration: "underline" }}
          >
            {bottomLinkText}
          </Text>
        </Text>
      </Flex>
    </Box>
  );
}
