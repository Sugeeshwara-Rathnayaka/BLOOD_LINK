import { useState } from "react";
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
  StatHelpText,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  HStack,
  Icon,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  FaTint,
  FaExclamationTriangle,
  FaTruckLoading,
  FaUsers,
  FaPlus,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function BloodBankDashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();

  // Top-level hooks for theme colors
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textMuted = useColorModeValue("gray.600", "gray.400");
  const tableHoverBg = useColorModeValue("gray.50", "gray.750");

  // Mock initial inventory state (units available per blood group)
  const [inventory] = useState([
    { group: "A+", units: 48, capacity: 60, status: "Normal" },
    { group: "A-", units: 8, capacity: 30, status: "Low" },
    { group: "B+", units: 52, capacity: 60, status: "Normal" },
    { group: "B-", units: 14, capacity: 30, status: "Low" },
    { group: "AB+", units: 22, capacity: 40, status: "Normal" },
    { group: "AB-", units: 4, capacity: 20, status: "Critical" },
    { group: "O+", units: 35, capacity: 70, status: "Low" },
    { group: "O-", units: 3, capacity: 50, status: "Critical" },
  ]);

  // Mock pending hospital requests
  const [requests, setRequests] = useState([
    {
      id: "REQ-1042",
      hospital: "General Hospital, Anuradhapura",
      bloodGroup: "O-",
      unitsRequested: 2,
      urgency: "Emergency",
      timestamp: "10 mins ago",
    },
    {
      id: "REQ-1043",
      hospital: "Base Hospital, Eppawala",
      bloodGroup: "A+",
      unitsRequested: 4,
      urgency: "Standard",
      timestamp: "25 mins ago",
    },
    {
      id: "REQ-1044",
      hospital: "Teaching Hospital, Kurunegala",
      bloodGroup: "AB-",
      unitsRequested: 1,
      urgency: "Urgent",
      timestamp: "1 hour ago",
    },
  ]);

  const handleAction = (requestId, action) => {
    setRequests((prev) => prev.filter((req) => req.id !== requestId));
    toast({
      title: `Request ${action === "approve" ? "Approved & Dispatched" : "Rejected"}`,
      description: `Request ${requestId} has been updated.`,
      status: action === "approve" ? "success" : "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const getStatusColor = (status) => {
    if (status === "Critical") return "red";
    if (status === "Low") return "orange";
    return "green";
  };

  const totalUnits = inventory.reduce((acc, curr) => acc + curr.units, 0);
  const criticalGroups = inventory.filter(
    (item) => item.status === "Critical",
  ).length;

  return (
    <Box minH="100vh" bg={bg} py={8} px={[4, 6, 10]}>
      <Flex maxW="7xl" mx="auto" direction="column" gap={8}>
        {/* Top Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <HStack spacing={3}>
              <Heading size="lg">Blood Bank Inventory Hub</Heading>
              <Badge
                colorScheme="purple"
                fontSize="sm"
                px={2}
                py={0.5}
                rounded="md"
              >
                Admin Station
              </Badge>
            </HStack>
            <Text color={textMuted} mt={1}>
              Operating Center: Central Regional Blood Center | Officer:{" "}
              {user?.name || "Admin"}
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button colorScheme="red" leftIcon={<FaPlus />}>
              Log Donation Unit
            </Button>
            <Button variant="outline" colorScheme="gray" onClick={logout}>
              Sign Out
            </Button>
          </HStack>
        </Flex>

        {/* Overview Stats */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5}>
          <Box
            bg={cardBg}
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel color={textMuted} fontWeight="semibold">
                    Total Reserves
                  </StatLabel>
                  <StatNumber fontSize="3xl">{totalUnits} Units</StatNumber>
                </Box>
                <Icon as={FaTint} w={8} h={8} color="red.500" />
              </Flex>
              <StatHelpText mb={0}>Across all 8 blood groups</StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={cardBg}
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel color={textMuted} fontWeight="semibold">
                    Critical Deficits
                  </StatLabel>
                  <StatNumber
                    fontSize="3xl"
                    color={criticalGroups > 0 ? "red.500" : "green.500"}
                  >
                    {criticalGroups} Types
                  </StatNumber>
                </Box>
                <Icon
                  as={FaExclamationTriangle}
                  w={8}
                  h={8}
                  color="orange.500"
                />
              </Flex>
              <StatHelpText mb={0}>Immediate drives required</StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={cardBg}
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel color={textMuted} fontWeight="semibold">
                    Active Requests
                  </StatLabel>
                  <StatNumber fontSize="3xl">{requests.length}</StatNumber>
                </Box>
                <Icon as={FaTruckLoading} w={8} h={8} color="blue.500" />
              </Flex>
              <StatHelpText mb={0}>Pending triage/dispatch</StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={cardBg}
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel color={textMuted} fontWeight="semibold">
                    Today's Donors
                  </StatLabel>
                  <StatNumber fontSize="3xl">19</StatNumber>
                </Box>
                <Icon as={FaUsers} w={8} h={8} color="teal.500" />
              </Flex>
              <StatHelpText mb={0}>Walk-in & scheduled units</StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* Blood Stock Inventory Grid */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="sm"
        >
          <Heading size="md" mb={6}>
            Current Stock Matrix
          </Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
            {inventory.map((item) => (
              <Box
                key={item.group}
                p={4}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <Heading size="md">{item.group}</Heading>
                  <Badge
                    colorScheme={getStatusColor(item.status)}
                    rounded="full"
                    px={2}
                  >
                    {item.status}
                  </Badge>
                </Flex>
                <Text fontSize="2xl" fontWeight="bold">
                  {item.units}{" "}
                  <Text
                    as="span"
                    fontSize="sm"
                    fontWeight="normal"
                    color={textMuted}
                  >
                    / {item.capacity} units
                  </Text>
                </Text>
                <Progress
                  value={(item.units / item.capacity) * 100}
                  colorScheme={getStatusColor(item.status)}
                  size="sm"
                  borderRadius="full"
                  mt={3}
                />
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Incoming Hospital Requests Table */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" mb={6}>
            <Heading size="md">Urgent Hospital Dispatches</Heading>
            <Badge colorScheme="red" variant="subtle">
              Live Queue
            </Badge>
          </Flex>

          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Request ID</Th>
                  <Th>Hospital</Th>
                  <Th>Type</Th>
                  <Th>Qty</Th>
                  <Th>Priority</Th>
                  <Th>Time</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {requests.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={6} color={textMuted}>
                      No pending emergency requests.
                    </Td>
                  </Tr>
                ) : (
                  requests.map((req) => (
                    <Tr key={req.id} _hover={{ bg: tableHoverBg }}>
                      <Td fontWeight="bold">{req.id}</Td>
                      <Td>{req.hospital}</Td>
                      <Td>
                        <Badge
                          colorScheme="red"
                          variant="solid"
                          px={2}
                          rounded="md"
                        >
                          {req.bloodGroup}
                        </Badge>
                      </Td>
                      <Td>{req.unitsRequested} units</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            req.urgency === "Emergency"
                              ? "red"
                              : req.urgency === "Urgent"
                                ? "orange"
                                : "blue"
                          }
                        >
                          {req.urgency}
                        </Badge>
                      </Td>
                      <Td color={textMuted} fontSize="sm">
                        {req.timestamp}
                      </Td>
                      <Td textAlign="right">
                        <HStack spacing={2} justify="flex-end">
                          <Button
                            size="sm"
                            colorScheme="green"
                            leftIcon={<FaCheck />}
                            onClick={() => handleAction(req.id, "approve")}
                          >
                            Dispatch
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            leftIcon={<FaTimes />}
                            onClick={() => handleAction(req.id, "reject")}
                          >
                            Decline
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
