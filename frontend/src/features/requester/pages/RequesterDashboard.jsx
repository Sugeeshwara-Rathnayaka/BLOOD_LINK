import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaHeartbeat, FaCalendarCheck, FaTint } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function RequesterDashboard() {
  const { user, logout } = useAuth();

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textMuted = useColorModeValue("gray.600", "gray.400");
  const tableHoverBg = useColorModeValue("gray.50", "gray.750");

  const donations = [
    {
      id: "DON-881",
      date: "May 12, 2026",
      location: "Base Hospital, Eppawala",
      type: "Whole Blood",
      status: "Processed",
    },
    {
      id: "DON-402",
      date: "Jan 05, 2026",
      location: "Central Blood Bank",
      type: "Whole Blood",
      status: "Processed",
    },
  ];

  return (
    <Box minH="100vh" bg={bg} py={8} px={[4, 6, 10]}>
      <Flex maxW="7xl" mx="auto" direction="column" gap={8}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <HStack spacing={3}>
              <Heading size="lg">Donor Dashboard</Heading>
              <Badge colorScheme="red" px={2} py={0.5} rounded="md">
                Active Donor
              </Badge>
            </HStack>
            <Text color={textMuted} mt={1}>
              Welcome back, {user?.name || "Life Saver"}!
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button colorScheme="red" leftIcon={<FaHeartbeat />}>
              Find a Blood Drive
            </Button>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
          <Box
            bgGradient="linear(to-r, red.500, orange.500)"
            color="white"
            p={5}
            borderRadius="xl"
            boxShadow="md"
          >
            <Stat>
              <StatLabel opacity={0.8} fontWeight="bold">
                My Blood Group
              </StatLabel>
              <Flex justify="space-between" align="center">
                <StatNumber fontSize="4xl">O+</StatNumber>
                <Icon as={FaTint} w={10} h={10} opacity={0.8} />
              </Flex>
            </Stat>
          </Box>
          <Box
            bg={cardBg}
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Stat>
              <StatLabel color={textMuted}>Total Donations</StatLabel>
              <Flex justify="space-between" align="center">
                <StatNumber fontSize="3xl">2</StatNumber>
                <Icon as={FaHeartbeat} w={8} h={8} color="red.500" />
              </Flex>
            </Stat>
          </Box>
          <Box
            bg={cardBg}
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Stat>
              <StatLabel color={textMuted}>Next Eligible Date</StatLabel>
              <Flex justify="space-between" align="center">
                <StatNumber fontSize="2xl">Sept 12, 2026</StatNumber>
                <Icon as={FaCalendarCheck} w={8} h={8} color="green.500" />
              </Flex>
            </Stat>
          </Box>
        </SimpleGrid>

        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Heading size="md" mb={6}>
            My Donation History
          </Heading>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Donation ID</Th>
                  <Th>Date</Th>
                  <Th>Location</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {donations.map((don) => (
                  <Tr key={don.id} _hover={{ bg: tableHoverBg }}>
                    <Td fontWeight="bold">{don.id}</Td>
                    <Td>{don.date}</Td>
                    <Td>{don.location}</Td>
                    <Td>{don.type}</Td>
                    <Td>
                      <Badge colorScheme="green">{don.status}</Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
