import { Box, Grid, GridItem, Heading, VStack } from "@chakra-ui/react";
import { MdDirectionsCar, MdLocalShipping, MdInventory, MdMap } from "react-icons/md";
import { StatCard } from "../../../components/dashboard/StatCard.tsx";

export const AdminDashboard = () => {
  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Page Title */}
        <Heading size="lg" color="text.primary">
          Admin Dashboard
        </Heading>

        {/* Stats Grid */}
        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <StatCard
              title="Active Vehicles"
              value="45"
              icon={MdDirectionsCar}
              color="blue.400"
              subtitle="Currently on route"
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <StatCard
              title="Pending Orders"
              value="128"
              icon={MdLocalShipping}
              color="orange.400"
              subtitle="Awaiting allocation"
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <StatCard
              title="Inventory Items"
              value="2,456"
              icon={MdInventory}
              color="green.400"
              subtitle="In stock"
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <StatCard
              title="Active Routes"
              value="32"
              icon={MdMap}
              color="purple.400"
              subtitle="Live tracking"
            />
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

