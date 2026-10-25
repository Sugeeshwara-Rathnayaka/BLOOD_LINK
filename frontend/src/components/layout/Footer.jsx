import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Container,
  Divider,
  Link as ChakraLink,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import {
  FaHeartbeat,
  FaTwitter,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";

export default function Footer() {
  return (
    <Box bg="gray.900" color="gray.300" py={12} px={[4, 8, 16]}>
      <Container
        as={Flex}
        maxW="7xl"
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        spacing={8}
      >
        <VStack align="start" maxW="sm" mb={{ base: 8, md: 0 }}>
          <HStack spacing={2}>
            <Icon as={FaHeartbeat} w={6} h={6} color="red.500" />
            <Heading size="md" color="white">
              Blood-Link
            </Heading>
          </HStack>
          <Text fontSize="sm" mt={4} color="gray.400">
            A centralized nationwide network bridging Donors, Blood Banks, and
            Hospitals to ensure lifesaving supply reaches those in need.
          </Text>
        </VStack>

        <HStack spacing={16} align="start">
          <VStack align="start" spacing={3}>
            <Heading size="sm" color="white" mb={2}>
              Platform
            </Heading>
            <ChakraLink fontSize="sm" _hover={{ color: "red.400" }}>
              Find a Blood Drive
            </ChakraLink>
            <ChakraLink fontSize="sm" _hover={{ color: "red.400" }}>
              Hospital Portal
            </ChakraLink>
            <ChakraLink fontSize="sm" _hover={{ color: "red.400" }}>
              Donor Guidelines
            </ChakraLink>
          </VStack>
          <VStack align="start" spacing={3}>
            <Heading size="sm" color="white" mb={2}>
              Support
            </Heading>
            <ChakraLink fontSize="sm" _hover={{ color: "red.400" }}>
              Contact Us
            </ChakraLink>
            <ChakraLink fontSize="sm" _hover={{ color: "red.400" }}>
              FAQs
            </ChakraLink>
            <ChakraLink fontSize="sm" _hover={{ color: "red.400" }}>
              Privacy Policy
            </ChakraLink>
          </VStack>
        </HStack>
      </Container>

      <Divider borderColor="gray.700" my={8} />

      <Container
        as={Flex}
        maxW="7xl"
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align="center"
      >
        <Text fontSize="sm">
          © {new Date().getFullYear()} Blood-Link. All rights reserved.
        </Text>
        <HStack spacing={4} mt={{ base: 4, md: 0 }}>
          <IconButton
            as="a"
            href="#"
            aria-label="Twitter"
            icon={<FaTwitter />}
            size="sm"
            colorScheme="gray"
            variant="ghost"
          />
          <IconButton
            as="a"
            href="#"
            aria-label="Facebook"
            icon={<FaFacebook />}
            size="sm"
            colorScheme="gray"
            variant="ghost"
          />
          <IconButton
            as="a"
            href="#"
            aria-label="Instagram"
            icon={<FaInstagram />}
            size="sm"
            colorScheme="gray"
            variant="ghost"
          />
        </HStack>
      </Container>
    </Box>
  );
}
