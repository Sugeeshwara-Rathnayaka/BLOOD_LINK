import { Center, Spinner, Text, VStack } from "@chakra-ui/react";

const LoadingSpinner = ({ message = "Loading...", fullScreen = false }) => {
  return (
    <Center
      minH={fullScreen ? "100vh" : "200px"}
      w="100%"
      bg={fullScreen ? "gray.50" : "transparent"}
    >
      <VStack spacing={4}>
        <Spinner size="xl" color="red.500" thickness="4px" speed="0.65s" />

        <Text fontSize="md" color="gray.600">
          {message}
        </Text>
      </VStack>
    </Center>
  );
};

export default LoadingSpinner;
