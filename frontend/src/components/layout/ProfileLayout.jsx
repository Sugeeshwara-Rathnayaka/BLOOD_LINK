import {
  Avatar,
  Badge,
  Box,
  Flex,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

export default function ProfileLayout({
  title = "My Profile",
  subtitle = "View and manage your profile information.",
  name,
  email,
  role,
  children,
  actions,
}) {
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");

  return (
    <Box minH="100vh" bg={pageBg} p={{ base: 4, md: 8 }}>
      <Box maxW="6xl" mx="auto">
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
          mb={6}
        >
          <Box>
            <Heading size="lg">{title}</Heading>
            <Text color={mutedText} mt={1}>
              {subtitle}
            </Text>
          </Box>

          {actions}
        </Flex>

        <Box
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          overflow="hidden"
          mb={6}
        >
          <Box h="110px" bgGradient="linear(to-r, red.700, red.400)" />

          <Flex
            px={{ base: 4, md: 7 }}
            pb={6}
            mt="-36px"
            align={{ base: "flex-start", md: "flex-end" }}
            direction={{ base: "column", md: "row" }}
            gap={4}
          >
            <Avatar
              size="xl"
              name={name || "BloodLink User"}
              border="4px solid"
              borderColor={cardBg}
              bg="red.500"
              color="white"
            />

            <Box flex="1" pt={{ base: 0, md: 9 }}>
              <Heading size="md">{name || "BloodLink User"}</Heading>

              <Text color={mutedText} fontSize="sm" mt={1}>
                {email || "No email available"}
              </Text>

              {role && (
                <Badge colorScheme="red" mt={3}>
                  {role}
                </Badge>
              )}
            </Box>
          </Flex>
        </Box>

        {children}
      </Box>
    </Box>
  );
}
