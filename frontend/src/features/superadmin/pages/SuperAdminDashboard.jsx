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
import { FaBuilding, FaPlus, FaUsers } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";

export default function SuperAdminDashboard() {
  const { logout } = useAuth();

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textMuted = useColorModeValue("gray.600", "gray.400");
  const tableHoverBg = useColorModeValue("gray.50", "gray.750");

  const bloodBanks = [
    {
      id: "BB-001",
      name: "Central Regional Blood Center",
      admin: "admin@centralbb.lk",
      status: "Active",
    },
    {
      id: "BB-002",
      name: "North Central Grid - Anuradhapura",
      admin: "nc.admin@anuradhapurabb.lk",
      status: "Active",
    },
  ];

  return (
    <Box minH="100vh" bg={bg} py={8} px={[4, 6, 10]}>
      <Flex maxW="7xl" mx="auto" direction="column" gap={8}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <HStack spacing={3}>
              <Heading size="lg">System Super Admin</Heading>
              <Badge
                colorScheme="blackAlpha"
                bg="black"
                color="white"
                px={2}
                py={0.5}
                rounded="md"
              >
                Root Access
              </Badge>
            </HStack>
            <Text color={textMuted} mt={1}>
              Manage nationwide network nodes and administrator accounts
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button colorScheme="blue" leftIcon={<FaPlus />}>
              Add Blood Bank Admin
            </Button>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
          <Box
            bg={cardBg}
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Stat>
              <StatLabel color={textMuted}>Registered Blood Banks</StatLabel>
              <Flex justify="space-between" align="center">
                <StatNumber fontSize="3xl">14</StatNumber>
                <Icon as={FaBuilding} w={8} h={8} color="blue.500" />
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
              <StatLabel color={textMuted}>Total Platform Users</StatLabel>
              <Flex justify="space-between" align="center">
                <StatNumber fontSize="3xl">12,450</StatNumber>
                <Icon as={FaUsers} w={8} h={8} color="green.500" />
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
            Registered Blood Bank Nodes
          </Heading>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Node ID</Th>
                  <Th>Facility Name</Th>
                  <Th>Admin Account (Email)</Th>
                  <Th>Status</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {bloodBanks.map((bank) => (
                  <Tr key={bank.id} _hover={{ bg: tableHoverBg }}>
                    <Td fontWeight="bold">{bank.id}</Td>
                    <Td>{bank.name}</Td>
                    <Td>{bank.admin}</Td>
                    <Td>
                      <Badge colorScheme="green">{bank.status}</Badge>
                    </Td>
                    <Td textAlign="right">
                      <Button size="sm" variant="outline" colorScheme="blue">
                        Manage
                      </Button>
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
