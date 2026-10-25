import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Divider,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react";
import { FaLock, FaBell, FaTrash } from "react-icons/fa";

export default function DonorSettings() {
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textMuted = useColorModeValue("gray.600", "gray.400");

  return (
    <Box minH="100vh" bg={bg} py={8} px={[4, 6, 10]}>
      <Flex maxW="3xl" mx="auto" direction="column" gap={8}>
        <Heading size="lg">Account Settings</Heading>

        {/* Security Section */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <HStack mb={6} color="gray.700">
            <FaLock />
            <Heading size="md">Security & Password</Heading>
          </HStack>
          <VStack spacing={4} align="start">
            <FormControl>
              <FormLabel color={textMuted}>Current Password</FormLabel>
              <Input type="password" placeholder="Enter current password" />
            </FormControl>
            <FormControl>
              <FormLabel color={textMuted}>New Password</FormLabel>
              <Input type="password" placeholder="Enter new password" />
            </FormControl>
            <Button colorScheme="red" mt={2}>
              Update Password
            </Button>
          </VStack>
        </Box>

        {/* Notifications Section */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <HStack mb={6} color="gray.700">
            <FaBell />
            <Heading size="md">Notifications</Heading>
          </HStack>
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="bold">Emergency Blood Requests</Text>
                <Text fontSize="sm" color={textMuted}>
                  Get notified when your blood type is needed urgently in your
                  province.
                </Text>
              </Box>
              <Switch colorScheme="red" defaultChecked size="lg" />
            </Flex>
            <Divider />
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="bold">Local Blood Drives</Text>
                <Text fontSize="sm" color={textMuted}>
                  Receive alerts about mobile campaigns happening near you.
                </Text>
              </Box>
              <Switch colorScheme="red" defaultChecked size="lg" />
            </Flex>
          </VStack>
        </Box>

        {/* Danger Zone */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          borderWidth="1px"
          borderColor="red.200"
        >
          <HStack mb={4} color="red.500">
            <FaTrash />
            <Heading size="md">Danger Zone</Heading>
          </HStack>
          <Text fontSize="sm" color={textMuted} mb={4}>
            Once you delete your account, there is no going back. Please be
            certain.
          </Text>
          <Button colorScheme="red" variant="outline">
            Delete Account
          </Button>
        </Box>
      </Flex>
    </Box>
  );
}
