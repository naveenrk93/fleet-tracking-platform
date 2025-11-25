import { Box, Heading, VStack, Button, HStack, Grid, GridItem, Text } from "@chakra-ui/react";
import { MdRefresh } from "react-icons/md";

export const VehicleAllocationPage = () => {
  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Page Header */}
        <HStack justify="space-between">
          <Heading size="lg" color="text.primary">
            Vehicle Allocation
          </Heading>
          <Button
            colorScheme="purple"
            leftIcon={<MdRefresh />}
            size="md"
          >
            Auto Allocate
          </Button>
        </HStack>

        {/* Content */}
        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          {/* Pending Orders */}
          <GridItem colSpan={{ base: 12, lg: 6 }}>
            <Box
              bg="bg.card"
              borderRadius="lg"
              border="1px solid"
              borderColor="border.default"
              p={6}
              minH="500px"
            >
              <Text fontSize="lg" fontWeight="semibold" mb={4} color="text.primary">
                Pending Orders
              </Text>
              {/* List of pending orders */}
            </Box>
          </GridItem>

          {/* Available Vehicles */}
          <GridItem colSpan={{ base: 12, lg: 6 }}>
            <Box
              bg="bg.card"
              borderRadius="lg"
              border="1px solid"
              borderColor="border.default"
              p={6}
              minH="500px"
            >
              <Text fontSize="lg" fontWeight="semibold" mb={4} color="text.primary">
                Available Vehicles
              </Text>
              {/* List of available vehicles */}
            </Box>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

