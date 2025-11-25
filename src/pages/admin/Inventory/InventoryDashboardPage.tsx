import { Box, Heading, VStack, Grid, GridItem } from "@chakra-ui/react";
import { MdInventory, MdWarning, MdCheckCircle, MdLocalShipping } from "react-icons/md";
import { StatCard } from "../../../components/dashboard/StatCard";

export const InventoryDashboardPage = () => {
  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Page Title */}
        <Heading size="lg" color="text.primary">
          Inventory Dashboard
        </Heading>

        {/* Stats Grid */}
        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <StatCard
              title="Total Items"
              value="2,456"
              icon={MdInventory}
              color="blue.400"
              subtitle="In all warehouses"
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <StatCard
              title="Low Stock"
              value="23"
              icon={MdWarning}
              color="orange.400"
              subtitle="Needs restock"
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <StatCard
              title="In Stock"
              value="2,401"
              icon={MdCheckCircle}
              color="green.400"
              subtitle="Available"
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <StatCard
              title="In Transit"
              value="32"
              icon={MdLocalShipping}
              color="purple.400"
              subtitle="Being delivered"
            />
          </GridItem>
        </Grid>

        {/* Inventory Details */}
        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={6}
          minH="400px"
        >
          {/* Inventory table or charts will go here */}
        </Box>
      </VStack>
    </Box>
  );
};

