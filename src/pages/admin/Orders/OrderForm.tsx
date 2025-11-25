import { Box, Heading, VStack, Button, HStack, FormControl, FormLabel, Input, Select, Textarea } from "@chakra-ui/react";
import { MdSave, MdCancel } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export const OrderForm = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Page Header */}
        <HStack justify="space-between">
          <Heading size="lg" color="text.primary">
            Create New Order
          </Heading>
          <HStack>
            <Button
              variant="outline"
              leftIcon={<MdCancel />}
              onClick={() => navigate("/admin/orders")}
            >
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              leftIcon={<MdSave />}
            >
              Save Order
            </Button>
          </HStack>
        </HStack>

        {/* Form */}
        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={6}
        >
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Order ID</FormLabel>
              <Input placeholder="Auto-generated" isReadOnly />
            </FormControl>

            <FormControl>
              <FormLabel>Customer Name</FormLabel>
              <Input placeholder="Enter customer name" />
            </FormControl>

            <FormControl>
              <FormLabel>Product</FormLabel>
              <Select placeholder="Select product">
                <option value="product1">Product 1</option>
                <option value="product2">Product 2</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Quantity</FormLabel>
              <Input type="number" placeholder="Enter quantity" />
            </FormControl>

            <FormControl>
              <FormLabel>Delivery Address</FormLabel>
              <Textarea placeholder="Enter delivery address" />
            </FormControl>

            <FormControl>
              <FormLabel>Terminal</FormLabel>
              <Select placeholder="Select terminal">
                <option value="terminal1">Terminal 1</option>
                <option value="terminal2">Terminal 2</option>
              </Select>
            </FormControl>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

