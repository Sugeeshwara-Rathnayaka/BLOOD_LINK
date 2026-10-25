import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Grid,
  Icon,
  useColorModeValue,
  HStack,
  VStack,
  Divider,
  Badge,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  FaHeartbeat,
  FaHandsHelping,
  FaCalendarAlt,
  FaUsers,
  FaMapMarkerAlt,
  FaClock,
  FaTint,
  FaHospital,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  // 1. ALL HOOKS EXTRACTED TO THE TOP LEVEL
  const bgGradient = useColorModeValue(
    "linear(to-r, red.50, orange.50)",
    "linear(to-r, red.900, orange.900)",
  );
  const navBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Text Colors
  const heroDescColor = useColorModeValue("gray.700", "gray.200");
  const sectionSubText = useColorModeValue("gray.600", "gray.400");
  const sectionHeading = useColorModeValue("gray.800", "white");
  const cardIconColor = useColorModeValue("gray.600", "gray.300");

  // Background Colors
  const pillBg = useColorModeValue("red.100", "red.900");
  const pillColor = useColorModeValue("red.700", "red.200");
  const btnOutlineHoverBg = useColorModeValue("red.50", "red.900");
  const featuresSectionBg = useColorModeValue("gray.50", "gray.800");
  const campaignCardBg = useColorModeValue("white", "gray.800");
  const featureCardBg = useColorModeValue("white", "gray.700");

  const getDashboardRoute = () => {
    if (!user) return "/login";
    return `/${user.role.toLowerCase()}/dashboard`;
  };

  const todaysCampaigns = [
    {
      id: 1,
      title: "Community Blood Drive",
      organization: "Lions Club & General Hospital",
      location: "Eppawala Maha Vidyalaya Main Hall",
      time: "09:00 AM - 04:00 PM",
      urgentTypes: ["O-", "AB-", "B-"],
      status: "Active Now",
    },
    {
      id: 2,
      title: "North Central Mega Drive",
      organization: "Red Cross Society",
      location: "Anuradhapura Town Hall",
      time: "10:00 AM - 03:00 PM",
      urgentTypes: ["A+", "O+"],
      status: "Active Now",
    },
  ];

  const notifications = [
    {
      id: 1,
      type: "urgent",
      title: "BLOOD DONATION INVITATION",
      text: "Eligible donors in the North Central Province are encouraged to visit the nearest blood bank. Urgent shortage of O- negative blood.",
      date: "Updated 15 mins ago",
    },
    {
      id: 2,
      type: "info",
      title: "NBTS INTEGRATION ACTIVE",
      text: "Blood-Link is now routing emergency regional requests. Hospitals can track fleet dispatch in real-time.",
      date: "Updated Today, 08:00 AM",
    },
  ];

  const features = [
    {
      icon: FaHeartbeat,
      title: "Life-Saving Donations",
      description:
        "Join our network of donors to help save lives in your community.",
    },
    {
      icon: FaHandsHelping,
      title: "Easy Registration",
      description: "Quick and simple process to become a blood donor.",
    },
    {
      icon: FaCalendarAlt,
      title: "Schedule Donations",
      description: "Book appointments at your convenience.",
    },
    {
      icon: FaUsers,
      title: "Find Donors",
      description: "Connect with compatible donors when in need.",
    },
  ];

  return (
    <Box>
      {/* 1. HERO SECTION */}
      <Flex
        direction="column"
        align="center"
        pt={{ base: "140px", md: "180px" }}
        pb={{ base: 24, md: 32 }}
        bgGradient={bgGradient}
        px={[4, 8, 16]}
        textAlign="center"
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: "url(/blood-drops-pattern.svg)",
          opacity: 0.05,
          zIndex: 0,
        }}
      >
        <Box position="relative" zIndex={1} maxW="4xl" mx="auto">
          <Box
            display="inline-block"
            px={4}
            py={1.5}
            mb={6}
            bg={pillBg}
            color={pillColor}
            fontWeight="bold"
            fontSize="sm"
            borderRadius="full"
          >
            Nationwide Blood Grid Active
          </Box>
          <Heading
            as="h1"
            size={["2xl", "3xl", "4xl"]}
            mb={6}
            fontWeight="extrabold"
            lineHeight="1.2"
            bgGradient="linear(to-r, red.500, orange.500)"
            bgClip="text"
          >
            Welcome to Blood-Link: <br /> Donate Blood & Save Lives
          </Heading>
          <Text
            fontSize={["lg", "xl", "2xl"]}
            mb={10}
            color={heroDescColor}
            maxW="3xl"
            mx="auto"
          >
            <b>Volunteer blood donation</b> is a safe and simple procedure that
            involves a donor giving{" "}
            <b>Whole Blood, Apheresis Platelets, or Stem Cells</b>. Join our
            nationwide grid to help those in emergency need.
          </Text>

          <Flex justify="center" gap={4} flexWrap="wrap">
            {user ? (
              <Button
                as={RouterLink}
                to={getDashboardRoute()}
                size="lg"
                colorScheme="red"
                px={10}
                py={7}
                fontSize="lg"
                fontWeight="bold"
                boxShadow="lg"
                _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
                transition="all 0.2s"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  as={RouterLink}
                  to="/role-selection"
                  size="lg"
                  colorScheme="red"
                  px={8}
                  py={7}
                  fontSize="md"
                  fontWeight="bold"
                  boxShadow="lg"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
                  rightIcon={<FaHeartbeat />}
                  transition="all 0.2s"
                >
                  Become a Blood Donor
                </Button>
                <Button
                  as={RouterLink}
                  to="/role-selection"
                  size="lg"
                  bg="white"
                  color="red.600"
                  border="2px solid"
                  borderColor="red.100"
                  px={8}
                  py={7}
                  fontSize="md"
                  fontWeight="bold"
                  boxShadow="md"
                  _hover={{
                    bg: "red.50",
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  rightIcon={<FaHandsHelping />}
                  transition="all 0.2s"
                >
                  Host a Blood Drive
                </Button>
                <Button
                  as={RouterLink}
                  to="/locations"
                  size="lg"
                  bg="pink.100"
                  color="pink.700"
                  px={8}
                  py={7}
                  fontSize="md"
                  fontWeight="bold"
                  boxShadow="md"
                  _hover={{
                    bg: "pink.200",
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  rightIcon={<FaHospital />}
                  transition="all 0.2s"
                >
                  Find Nearest Blood Bank
                </Button>
              </>
            )}
          </Flex>
        </Box>
      </Flex>

      {/* 2. LIVE GRID: CAMPAIGNS & NOTIFICATIONS */}
      <Box
        py={16}
        px={[4, 8, 16]}
        bg={navBg}
        borderTop="1px solid"
        borderColor={borderColor}
      >
        <Box maxW="7xl" mx="auto">
          <Grid templateColumns={{ base: "1fr", lg: "7fr 3fr" }} gap={12}>
            {/* Left Side: Mobile Campaigns */}
            <Box>
              <Flex
                justify="space-between"
                align="flex-end"
                mb={8}
                wrap="wrap"
                gap={4}
              >
                <Box>
                  <Heading
                    as="h2"
                    size="xl"
                    mb={2}
                    display="flex"
                    alignItems="center"
                    gap={3}
                  >
                    Today's Mobile Campaigns{" "}
                    <Badge
                      colorScheme="red"
                      variant="solid"
                      rounded="full"
                      px={3}
                      py={1}
                      animation="pulse 2s infinite"
                    >
                      LIVE
                    </Badge>
                  </Heading>
                  <Text color={sectionSubText}>
                    Find a mobile blood drive near you and drop in to donate.
                  </Text>
                </Box>
                <Button
                  variant="ghost"
                  colorScheme="red"
                  rightIcon={<FaMapMarkerAlt />}
                >
                  View All
                </Button>
              </Flex>

              <Grid templateColumns={["1fr", "1fr", "repeat(2, 1fr)"]} gap={6}>
                {todaysCampaigns.map((campaign) => (
                  <Box
                    key={campaign.id}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="2xl"
                    p={6}
                    bg={campaignCardBg}
                    boxShadow="sm"
                    transition="all 0.3s"
                    _hover={{
                      transform: "translateY(-4px)",
                      boxShadow: "lg",
                      borderColor: "red.200",
                    }}
                  >
                    <Badge
                      colorScheme={
                        campaign.status === "Active Now" ? "green" : "orange"
                      }
                      mb={4}
                      rounded="md"
                      px={2}
                    >
                      {campaign.status}
                    </Badge>
                    <Heading size="md" mb={1}>
                      {campaign.title}
                    </Heading>
                    <Text
                      fontSize="sm"
                      color="gray.500"
                      mb={4}
                      fontWeight="medium"
                    >
                      By {campaign.organization}
                    </Text>
                    <VStack align="start" spacing={3} mb={6}>
                      <HStack color={cardIconColor}>
                        <Icon as={FaMapMarkerAlt} color="red.500" />
                        <Text fontSize="sm">{campaign.location}</Text>
                      </HStack>
                      <HStack color={cardIconColor}>
                        <Icon as={FaClock} color="red.500" />
                        <Text fontSize="sm">{campaign.time}</Text>
                      </HStack>
                    </VStack>
                    <Divider mb={4} />
                    <Box mb={4}>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        color="gray.500"
                        mb={2}
                      >
                        Urgent Need
                      </Text>
                      <HStack wrap="wrap" gap={2}>
                        {campaign.urgentTypes.map((type) => (
                          <Badge
                            key={type}
                            colorScheme="red"
                            variant="subtle"
                            px={2}
                            py={0.5}
                            rounded="md"
                          >
                            <Icon as={FaTint} mr={1} />
                            {type}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                    <Button
                      w="full"
                      colorScheme="red"
                      variant="outline"
                      _hover={{ bg: btnOutlineHoverBg }}
                    >
                      I'll Be There
                    </Button>
                  </Box>
                ))}
              </Grid>
            </Box>

            {/* Right Side: NBTS Style Notifications */}
            <Box>
              <Heading as="h2" size="xl" mb={8} color={sectionHeading}>
                Notifications
              </Heading>
              <Box
                h="420px"
                overflow="hidden"
                position="relative"
                borderRadius="xl"
              >
                <VStack
                  spacing={5}
                  align="stretch"
                  w="full"
                  position="absolute"
                  animation="slideUp 12s linear infinite"
                  _hover={{ animationPlayState: "paused" }}
                >
                  {notifications.map((notif) => (
                    <Box
                      key={notif.id}
                      p={6}
                      bg={notif.type === "urgent" ? "#2B5B84" : "#2E7D32"}
                      color="white"
                      borderRadius="xl"
                      boxShadow="md"
                      transition="all 0.2s"
                      cursor="pointer"
                    >
                      <HStack mb={3}>
                        <Icon
                          as={
                            notif.type === "urgent"
                              ? FaExclamationCircle
                              : FaInfoCircle
                          }
                          w={5}
                          h={5}
                        />
                        <Heading
                          size="sm"
                          textTransform="uppercase"
                          letterSpacing="wide"
                        >
                          {notif.title}
                        </Heading>
                      </HStack>
                      <Text
                        fontSize="sm"
                        mb={4}
                        opacity={0.95}
                        lineHeight="tall"
                      >
                        {notif.text}
                      </Text>
                      <Text fontSize="xs" fontWeight="bold" opacity={0.7}>
                        {notif.date}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </Box>
          </Grid>
        </Box>
      </Box>

      {/* 3. FEATURES SECTION */}
      <Box py={20} px={[4, 8, 16]} bg={featuresSectionBg}>
        <Box maxW="7xl" mx="auto">
          <Heading
            as="h2"
            textAlign="center"
            mb={16}
            fontSize={["3xl", "4xl"]}
            fontWeight="extrabold"
          >
            Why Donate With Us?
          </Heading>
          <Grid templateColumns={["1fr", "1fr 1fr", "repeat(4, 1fr)"]} gap={8}>
            {features.map((feature, index) => (
              <Box
                key={index}
                p={8}
                bg={featureCardBg}
                borderRadius="xl"
                boxShadow="md"
                textAlign="center"
                transition="all 0.3s"
                _hover={{ transform: "translateY(-5px)", boxShadow: "xl" }}
              >
                <Icon as={feature.icon} w={12} h={12} mb={6} color="red.500" />
                <Heading as="h3" size="lg" mb={4}>
                  {feature.title}
                </Heading>
                <Text color={cardIconColor}>{feature.description}</Text>
              </Box>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* 4. CALL TO ACTION SECTION */}
      <Box
        py={20}
        px={[4, 8, 16]}
        bgGradient="linear(to-r, red.500, orange.500)"
        color="white"
        textAlign="center"
      >
        <Box maxW="4xl" mx="auto">
          <Heading as="h2" size="xl" mb={6}>
            Ready to Make a Difference?
          </Heading>
          <Text fontSize="xl" mb={10}>
            Every donation can save up to 3 lives. Join our community of
            life-savers today.
          </Text>
          <Button
            as={RouterLink}
            to={user ? getDashboardRoute() : "/role-selection"}
            size="lg"
            colorScheme="whiteAlpha"
            px={10}
            py={6}
            fontSize="xl"
            fontWeight="bold"
            _hover={{ bg: "whiteAlpha.800", color: "red.500" }}
            rightIcon={<FaHeartbeat />}
            boxShadow="0 4px 20px rgba(0,0,0,0.2)"
          >
            {user ? "Go to Dashboard" : "Join Now"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
