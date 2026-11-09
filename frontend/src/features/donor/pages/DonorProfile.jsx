import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Input,
  SimpleGrid,
  Spinner,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { FaArrowLeft, FaTint, FaUserEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import ProfileLayout from "../../../components/layout/ProfileLayout";

// Component for displaying and editing individual profile fields
const ProfileField = ({
  label,
  name,
  value,
  isEditing,
  onChange,
  type = "text",
  isReadOnly = false,
}) => {
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const inputBg = useColorModeValue("white", "gray.700");

  return (
    <FormControl>
      <FormLabel fontSize="sm" color={mutedText}>
        {label}
      </FormLabel>

      {isEditing && !isReadOnly ? (
        <Input
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          bg={inputBg}
        />
      ) : (
        <Text fontWeight="medium" overflowWrap="anywhere">
          {value || "Not provided"}
        </Text>
      )}
    </FormControl>
  );
};

// Helper function to create form data from the user object
const createFormData = (donor) => ({
  firstName: donor?.name?.firstName ?? "",
  lastName: donor?.name?.lastName ?? "",
  phone: donor?.phone ?? "",
  optionalPhone: donor?.optionalPhone ?? "",
  nic: donor?.nic ?? "",
  dob: donor?.dob ? donor.dob.slice(0, 10) : "",
  gender: donor?.gender ?? "",
  street: donor?.address?.street ?? "",
  city: donor?.address?.city ?? "",
  district: donor?.address?.district ?? "",
  province: donor?.address?.province ?? "",
});

export default function DonorProfile() {
  const { user, isLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState(() => createFormData(user));
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const mutedText = useColorModeValue("gray.600", "gray.400");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Keep the form synchronized with the shared authenticated profile.
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(createFormData(user));
      setLoadError(false);
    }
  }, [user]);

  // Handle input changes for form fields
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle canceling edits and reverting to the original profile data
  const handleCancel = () => {
    setFormData(createFormData(user));
    setIsEditing(false);
  };

  // Handle retrying to load the profile in case of an error
  const handleRetry = async () => {
    setIsRefreshing(true);
    setLoadError(false);
    try {
      const refreshed = await refreshUser();
      if (!refreshed) setLoadError(true); // 401: ProtectedRoute will redirect anyway
    } catch {
      setLoadError(true);
      toast({
        title: "Unable to refresh profile",
        description: "Please check your connection and try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle saving the updated profile data
  const handleSave = async (event) => {
    event.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Name is required",
        description: "Enter your first name and last name.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsSaving(true);

    // Confirm these field names against your donor update controller.
    const payload = {
      name: {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      },
      phone: formData.phone.trim(),
      optionalPhone: formData.optionalPhone.trim(),
      address: {
        street: formData.street.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        province: formData.province.trim(),
      },
    };
    try {
      // Step 1: save. A failure here is a real failure.
      try {
        await api.put("/donor/me/update", payload);
      } catch (error) {
        toast({
          title: "Unable to update profile",
          description:
            error.response?.data?.message ||
            error.message ||
            "Please try again.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      // Step 2: reload. A failure here is only a warning, because the save worked.
      try {
        // Refresh the shared user state with the latest backend data.
        const refreshed = await refreshUser();
        if (refreshed) setFormData(createFormData(refreshed));
        toast({
          title: "Profile updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch {
        toast({
          title: "Saved, but couldn't reload your profile",
          description: "Refresh the page to see the latest data.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Flex
        minH="60vh"
        align="center"
        justify="center"
        direction="column"
        gap={3}
      >
        <Spinner size="xl" color="red.500" thickness="4px" />
        <Text color={mutedText}>Loading your profile...</Text>
      </Flex>
    );
  }

  if (!user || user.role !== "Donor" || loadError) {
    return (
      <Box p={8} textAlign="center">
        <Heading size="md" mb={3}>
          Profile unavailable
        </Heading>

        <Text color={mutedText} mb={5}>
          We couldn't retrieve your donor information.
        </Text>

        <Button
          colorScheme="red"
          onClick={handleRetry}
          isLoading={isRefreshing}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  const fullName = [formData.firstName, formData.lastName]
    .filter(Boolean)
    .join(" ");

  const bloodGroup = user.bloodGroup ?? "Not provided";
  const accountStatus = user.validation ?? "Unknown";

  const statusColor =
    accountStatus === "APPROVED"
      ? "green"
      : accountStatus === "REJECTED"
        ? "red"
        : "orange";

  return (
    <ProfileLayout
      title="My Profile"
      subtitle="View and manage your donor information."
      name={fullName}
      email={user.email}
      role={user.role}
      actions={
        <HStack>
          <Button
            variant="outline"
            leftIcon={<FaArrowLeft />}
            onClick={() => navigate("/donor/dashboard")}
          >
            Dashboard
          </Button>

          {!isEditing && (
            <Button
              colorScheme="red"
              leftIcon={<FaUserEdit />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </HStack>
      }
    >
      <form onSubmit={handleSave}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Personal information */}
          <Box
            bg={cardBg}
            p={{ base: 4, md: 6 }}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
          >
            <Heading size="md" mb={6}>
              Personal Information
            </Heading>

            <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={5}>
              <GridItem>
                <ProfileField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </GridItem>

              <GridItem>
                <ProfileField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </GridItem>

              <GridItem colSpan={2}>
                <ProfileField
                  label="Email Address"
                  value={user.email}
                  isEditing={false}
                  isReadOnly
                />
              </GridItem>

              <GridItem colSpan={2}>
                <ProfileField
                  label="NIC"
                  value={user.nic}
                  isEditing={false}
                  isReadOnly
                />
              </GridItem>

              <GridItem>
                <ProfileField
                  label="Date of Birth"
                  value={formData.dob}
                  isEditing={false}
                  isReadOnly
                />
              </GridItem>

              <GridItem>
                <ProfileField
                  label="Gender"
                  value={formData.gender}
                  isEditing={false}
                  isReadOnly
                />
              </GridItem>

              <GridItem colSpan={2}>
                <ProfileField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  isEditing={isEditing}
                  onChange={handleChange}
                  type="tel"
                />
              </GridItem>

              <GridItem colSpan={2}>
                <ProfileField
                  label="Optional Phone Number"
                  name="optionalPhone"
                  value={formData.optionalPhone}
                  isEditing={isEditing}
                  onChange={handleChange}
                  type="tel"
                />
              </GridItem>
            </Grid>
          </Box>

          {/* Address information */}
          <Box
            bg={cardBg}
            p={{ base: 4, md: 6 }}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="xl"
          >
            <Heading size="md" mb={6}>
              Address Information
            </Heading>

            <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={5}>
              <GridItem colSpan={2}>
                <ProfileField
                  label="Street Address"
                  name="street"
                  value={formData.street}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </GridItem>

              <GridItem>
                <ProfileField
                  label="City"
                  name="city"
                  value={formData.city}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </GridItem>

              <GridItem>
                <ProfileField
                  label="District"
                  name="district"
                  value={formData.district}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </GridItem>

              <GridItem colSpan={2}>
                <ProfileField
                  label="Province"
                  name="province"
                  value={formData.province}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              </GridItem>
            </Grid>

            <Divider my={6} />

            <Heading size="md" mb={5}>
              Donor Information
            </Heading>

            <HStack justify="space-between" mb={4}>
              <Text color={mutedText} fontSize="sm">
                Blood Group
              </Text>

              <Badge colorScheme="red" fontSize="md" px={3} py={1}>
                <HStack spacing={1}>
                  <Icon as={FaTint} />
                  <Text>{bloodGroup}</Text>
                </HStack>
              </Badge>
            </HStack>

            <HStack justify="space-between" mb={4}>
              <Text color={mutedText} fontSize="sm">
                Verification Status
              </Text>

              <Badge colorScheme={statusColor}>{accountStatus}</Badge>
            </HStack>

            <Text color={mutedText} fontSize="sm" lineHeight="tall">
              Your NIC, date of birth, gender, and blood group are read-only on
              this page. Contact the BloodLink team if these details need
              correction.
            </Text>
          </Box>
        </SimpleGrid>

        {isEditing && (
          <Flex justify="flex-end" gap={3} mt={6}>
            <Button
              variant="outline"
              onClick={handleCancel}
              isDisabled={isSaving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              colorScheme="red"
              isLoading={isSaving}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </Flex>
        )}
      </form>
    </ProfileLayout>
  );
}
