import { Box, Heading, VStack, Button, HStack } from "@chakra-ui/react";
import { MdAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export const OrdersPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Page Header */}
        <HStack justify="space-between">
          <Heading size="lg" color="text.primary">
            Orders Management
          </Heading>
          <Button
            colorScheme="purple"
            leftIcon={<MdAdd />}
            size="md"
            onClick={() => navigate("/admin/orders/new")}
          >
            Create Order
          </Button>
        </HStack>

        {/* Content */}
        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={6}
          minH="400px"
        >
          {/* Orders table or list will go here */}
        </Box>
      </VStack>
    </Box>
  );
};

