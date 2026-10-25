import { useState } from "react";
import {
  useParams,
  useNavigate,
  Navigate,
  Link as RouterLink,
} from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Text,
  VStack,
  useColorModeValue,
  Icon,
  useToast,
  Textarea,
  SimpleGrid,
  GridItem,
} from "@chakra-ui/react";
import { FaArrowLeft, FaUserPlus } from "react-icons/fa";
import api from "../../../services/api";

// Standard Sri Lankan Districts for Schema Enums
const SRI_LANKAN_DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Moneragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Register() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textSecondary = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.900", "white");

  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    optionalPhone: "",
    password: "",
    confirmPassword: "",
    userName: "",
    firstName: "",
    lastName: "",
    name: "",
    nic: "",
    gender: "",
    dob: "",
    bloodGroup: "",
    street: "",
    city: "",
    district: "",
    organizationName: "",
    presidentName: "",
    purpose: "",
    registrationNumber: "",
    chiefDoctorName: "", // Added for NormalHospital Schema
  });

  const validRoles = ["Donor", "Requester", "Organization", "Hospital"];
  if (!validRoles.includes(roleId)) {
    return <Navigate to="/role-selection" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    let apiPayload = {};

    if (roleId === "Donor") {
      apiPayload = {
        role: "Donor",
        name: { firstName: formData.firstName, lastName: formData.lastName },
        email: formData.email,
        nic: formData.nic,
        dob: formData.dob,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        address: {
          street: formData.street,
          city: formData.city,
          district: formData.district,
        },
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };
      if (formData.optionalPhone)
        apiPayload.optionalPhone = formData.optionalPhone;
    } else if (roleId === "Requester") {
      apiPayload = {
        role: "Requester",
        name: formData.name,
        email: formData.email,
        nic: formData.nic,
        dob: formData.dob,
        gender: formData.gender,
        address: {
          street: formData.street,
          city: formData.city,
          district: formData.district,
        },
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };
      if (formData.optionalPhone)
        apiPayload.optionalPhone = formData.optionalPhone;
    } else if (roleId === "Organization") {
      apiPayload = {
        role: "Organization",
        organizationName: formData.organizationName,
        registrationNumber: formData.registrationNumber,
        userName: formData.userName,
        presidentName: formData.presidentName,
        email: formData.email,
        address: {
          street: formData.street,
          city: formData.city,
          district: formData.district,
        },
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };
      if (formData.purpose) apiPayload.purpose = formData.purpose;
      if (formData.optionalPhone)
        apiPayload.optionalPhone = formData.optionalPhone;
    } else if (roleId === "Hospital") {
      // 🚀 Adjusted exactly to NormalHospital + Base Hospital schemas
      const telephones = [{ telephoneNo: formData.phone, type: "LANDLINE" }];
      if (formData.optionalPhone) {
        telephones.push({
          telephoneNo: formData.optionalPhone,
          type: "EMERGENCY",
        });
      }

      apiPayload = {
        hospital: {
          hospitalName: formData.organizationName,
          email: formData.email, // Required by Base Hospital Schema
          chiefDoctorName: formData.chiefDoctorName, // Required by NormalHospital Schema
          address: {
            street: formData.street,
            city: formData.city,
            district: formData.district,
          },
          telephones: telephones,
        },
        account: {
          userName: formData.userName,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        },
      };
    }

    setIsLoading(true);

    try {
      const routeMap = {
        Donor: "/auth/signup/donor",
        Requester: "/auth/signup/requester",
        Organization: "/auth/signup/organization",
        Hospital: "/auth/signup/hospital",
      };

      const endpoint = routeMap[roleId];

      const response = await api.post(endpoint, apiPayload);

      toast({
        title: "Account Created!",
        description:
          response.data.message ||
          `Your ${roleId} account is ready. Please log in.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      navigate(`/login/${roleId}`);
    } catch (error) {
      console.error("Registration Error:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";

      toast({
        title: "Registration Failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg={bg} py={6} px={[4, 8, 16]}>
      <Flex maxW="3xl" mx="auto" direction="column">
        <Button
          as={RouterLink}
          to="/role-selection"
          variant="ghost"
          alignSelf="flex-start"
          leftIcon={<FaArrowLeft />}
          mb={4}
          color={textSecondary}
          _hover={{ bg: "transparent", color: "red.500" }}
        >
          Back to Role Selection
        </Button>

        <Box
          bg={cardBg}
          p={{ base: 6, md: 8 }}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="lg"
        >
          <VStack spacing={1} mb={6} textAlign="center">
            <Icon as={FaUserPlus} w={8} h={8} color="red.500" mb={1} />
            <Heading size="lg" color={headingColor}>
              {roleId} Registration
            </Heading>
            <Text color={textSecondary} fontSize="sm">
              Fill out the required information to create your account.
            </Text>
          </VStack>

          <form onSubmit={handleSubmit}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={4} spacingY={3}>
              {/* ================= IDENTITY SECTION ================= */}
              {roleId === "Donor" && (
                <>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">First Name</FormLabel>
                    <Input
                      size="sm"
                      type="text"
                      name="firstName"
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Last Name</FormLabel>
                    <Input
                      size="sm"
                      type="text"
                      name="lastName"
                      onChange={handleChange}
                    />
                  </FormControl>
                </>
              )}

              {roleId === "Requester" && (
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Full Name</FormLabel>
                    <Input
                      size="sm"
                      type="text"
                      name="name"
                      onChange={handleChange}
                      placeholder="John Doe"
                    />
                  </FormControl>
                </GridItem>
              )}

              {(roleId === "Organization" || roleId === "Hospital") && (
                <>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">
                      {roleId === "Hospital"
                        ? "Hospital Name"
                        : "Organization Name"}
                    </FormLabel>
                    <Input
                      size="sm"
                      type="text"
                      name="organizationName"
                      onChange={handleChange}
                    />
                  </FormControl>

                  {roleId === "Hospital" ? (
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">Chief Doctor Name</FormLabel>
                      <Input
                        size="sm"
                        type="text"
                        name="chiefDoctorName"
                        onChange={handleChange}
                      />
                    </FormControl>
                  ) : (
                    <>
                      <FormControl isRequired>
                        <FormLabel fontSize="sm">President Name</FormLabel>
                        <Input
                          size="sm"
                          type="text"
                          name="presidentName"
                          onChange={handleChange}
                        />
                      </FormControl>
                      <GridItem colSpan={{ base: 1, md: 2 }}>
                        <FormControl isRequired>
                          <FormLabel fontSize="sm">Registration ID</FormLabel>
                          <Input
                            size="sm"
                            type="text"
                            name="registrationNumber"
                            onChange={handleChange}
                          />
                        </FormControl>
                      </GridItem>
                    </>
                  )}
                </>
              )}

              {/* ================= DEMOGRAPHICS ================= */}
              {(roleId === "Donor" || roleId === "Requester") && (
                <>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">NIC Number</FormLabel>
                    <Input
                      size="sm"
                      type="text"
                      name="nic"
                      onChange={handleChange}
                      placeholder="e.g. 199912345678"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Gender</FormLabel>
                    <Select
                      size="sm"
                      name="gender"
                      placeholder="Select gender"
                      onChange={handleChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Date of Birth</FormLabel>
                    <Input
                      size="sm"
                      type="date"
                      name="dob"
                      onChange={handleChange}
                    />
                  </FormControl>

                  {roleId === "Donor" && (
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">Blood Group</FormLabel>
                      <Select
                        size="sm"
                        name="bloodGroup"
                        placeholder="Select blood group"
                        onChange={handleChange}
                      >
                        {BLOOD_GROUPS.map((bloodGroup) => (
                          <option key={bloodGroup} value={bloodGroup}>
                            {bloodGroup}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </>
              )}

              {/* ================= ORG SPECIFIC ================= */}
              {roleId === "Organization" && (
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl>
                    <FormLabel fontSize="sm">
                      Organization Purpose (Optional)
                    </FormLabel>
                    <Textarea
                      size="sm"
                      name="purpose"
                      onChange={handleChange}
                      placeholder="Briefly describe your organization's mission..."
                      rows={2}
                    />
                  </FormControl>
                </GridItem>
              )}

              {/* ================= ADDRESS ================= */}
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Street Address</FormLabel>
                  <Input
                    size="sm"
                    type="text"
                    name="street"
                    onChange={handleChange}
                    placeholder="123 Main St"
                  />
                </FormControl>
              </GridItem>
              <FormControl>
                <FormLabel fontSize="sm">City</FormLabel>
                <Input
                  size="sm"
                  type="text"
                  name="city"
                  onChange={handleChange}
                  placeholder="Colombo"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">District</FormLabel>
                <Select
                  size="sm"
                  name="district"
                  placeholder="Select district"
                  onChange={handleChange}
                >
                  {SRI_LANKAN_DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* ================= CONTACT & CREDENTIALS ================= */}
              {(roleId === "Organization" || roleId === "Hospital") && (
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Username</FormLabel>
                    <Input
                      size="sm"
                      type="text"
                      name="userName"
                      onChange={handleChange}
                      placeholder="org_user_123"
                    />
                  </FormControl>
                </GridItem>
              )}

              {/* Email is now correctly shown for everyone, including Hospitals */}
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Email Address</FormLabel>
                  <Input
                    size="sm"
                    type="email"
                    name="email"
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                </FormControl>
              </GridItem>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Phone Number</FormLabel>
                <Input
                  size="sm"
                  type="tel"
                  name="phone"
                  onChange={handleChange}
                  placeholder="07XXXXXXXX"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Optional Phone</FormLabel>
                <Input
                  size="sm"
                  type="tel"
                  name="optionalPhone"
                  onChange={handleChange}
                  placeholder="07XXXXXXXX"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Password</FormLabel>
                <Input
                  size="sm"
                  type="password"
                  name="password"
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Confirm Password</FormLabel>
                <Input
                  size="sm"
                  type="password"
                  name="confirmPassword"
                  onChange={handleChange}
                />
              </FormControl>

              {/* ================= SUBMIT BUTTON ================= */}
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Button
                  type="submit"
                  colorScheme="red"
                  size="md"
                  w="full"
                  mt={2}
                  isLoading={isLoading}
                  loadingText="Creating Account..."
                >
                  Create Account
                </Button>
              </GridItem>
            </SimpleGrid>
          </form>
        </Box>
      </Flex>
    </Box>
  );
}
