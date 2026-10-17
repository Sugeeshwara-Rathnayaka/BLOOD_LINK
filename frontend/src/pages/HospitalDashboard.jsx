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
import {
  FaAmbulance,
  FaSyringe,
  FaPlus,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function HospitalDashboard() {
  const { user, logout } = useAuth();

  // 1. ALL HOOKS AT THE TOP
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textMuted = useColorModeValue("gray.600", "gray.400");
  const tableHoverBg = useColorModeValue("gray.50", "gray.750");

  // Mock Active Requests Data
  const myRequests = [
    {
      id: "REQ-1042",
      type: "O-",
      qty: 2,
      status: "Pending",
      urgency: "Emergency",
      date: "Today, 09:30 AM",
    },
    {
      id: "REQ-0988",
      type: "B+",
      qty: 5,
      status: "Dispatched",
      urgency: "Standard",
      date: "Yesterday, 02:15 PM",
    },
    {
      id: "REQ-0901",
      type: "A+",
      qty: 3,
      status: "Fulfilled",
      urgency: "Urgent",
      date: "Oct 10, 2026",
    },
  ];

  return (
    <Box minH="100vh" bg={bg} py={8} px={[4, 6, 10]}>
      <Flex maxW="7xl" mx="auto" direction="column" gap={8}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <HStack spacing={3}>
              <Heading size="lg">Hospital Command Center</Heading>
              <Badge colorScheme="teal" px={2} py={0.5} rounded="md">
                Healthcare Provider
              </Badge>
            </HStack>
            <Text color={textMuted} mt={1}>
              {user?.organizationName || "General Hospital"} | Logged in as
              Admin
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button colorScheme="red" leftIcon={<FaPlus />}>
              Request Blood
            </Button>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
          <Box
            bg={cardBg}
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Stat>
              <StatLabel color={textMuted}>Active Emergency Requests</StatLabel>
              <Flex justify="space-between" align="center">
                <StatNumber fontSize="3xl">1</StatNumber>
                <Icon as={FaAmbulance} w={8} h={8} color="red.500" />
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
              <StatLabel color={textMuted}>Total Units Received</StatLabel>
              <Flex justify="space-between" align="center">
                <StatNumber fontSize="3xl">124</StatNumber>
                <Icon as={FaSyringe} w={8} h={8} color="teal.500" />
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
            Request History & Tracking
          </Heading>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Request ID</Th>
                  <Th>Blood Type</Th>
                  <Th>Qty</Th>
                  <Th>Priority</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {myRequests.map((req) => (
                  <Tr key={req.id} _hover={{ bg: tableHoverBg }}>
                    <Td fontWeight="bold">{req.id}</Td>
                    <Td>
                      <Badge colorScheme="red">{req.type}</Badge>
                    </Td>
                    <Td>{req.qty} Units</Td>
                    <Td>{req.urgency}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          req.status === "Pending"
                            ? "orange"
                            : req.status === "Dispatched"
                              ? "blue"
                              : "green"
                        }
                      >
                        {req.status === "Pending" && (
                          <Icon as={FaClock} mr={1} mb={-0.5} />
                        )}
                        {req.status === "Fulfilled" && (
                          <Icon as={FaCheckCircle} mr={1} mb={-0.5} />
                        )}
                        {req.status}
                      </Badge>
                    </Td>
                    <Td color={textMuted}>{req.date}</Td>
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
