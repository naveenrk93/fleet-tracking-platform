import { Box, Heading, Text } from "@chakra-ui/react";

export const DeliveryManagementPage = () => {
  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Delivery Management</Heading>
      <Text color="text.secondary">Manage your assigned deliveries and update their status</Text>
    </Box>
  );
};

