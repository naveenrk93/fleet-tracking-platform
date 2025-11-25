import { Box, Grid, GridItem, Heading, VStack } from "@chakra-ui/react";
import { MdAttachMoney, MdShoppingCart, MdVisibility } from "react-icons/md";
import { useSelector } from "react-redux";
import { type RootState } from "../store";
import { WebsiteAnalyticsCard } from "../components/dashboard/WebsiteAnalyticsCard";
import { StatCard } from "../components/dashboard/StatCard";
import { EarningReportsCard } from "../components/dashboard/EarningReportsCard";
import { SupportTrackerCard } from "../components/dashboard/SupportTrackerCard";
import { RevenueGeneratedCard } from "../components/dashboard/RevenueGeneratedCard";

export const DashboardPage = () => {
  const { revenue, orders, visits } = useSelector((state: RootState) => state.dashboard);

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Page Title */}
        <Heading size="lg" color="text.primary">
          Dashboard
        </Heading>

        {/* Top Row: Analytics + Stats */}
        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          {/* Website Analytics - Takes 8 columns */}
          <GridItem colSpan={{ base: 12, lg: 8 }}>
            <WebsiteAnalyticsCard />
          </GridItem>

          {/* Revenue Stats - Takes 4 columns */}
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <Grid templateColumns="repeat(1, 1fr)" gap={6}>
              <StatCard
                title="Revenue"
                value={revenue.amount}
                percentage={revenue.percentage}
                trend={revenue.trend}
                icon={MdAttachMoney}
                color="green.400"
              />
              <StatCard
                title={orders.label}
                value={orders.count}
                icon={MdShoppingCart}
                color="purple.400"
              />
            </Grid>
          </GridItem>
        </Grid>

        {/* Second Row: Stats */}
        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <StatCard
              title={visits.label}
              value={visits.count}
              icon={MdVisibility}
              color="blue.400"
              subtitle="Total Visits"
            />
          </GridItem>
        </Grid>

        {/* Third Row: Reports */}
        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          {/* Earning Reports */}
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <EarningReportsCard />
          </GridItem>

          {/* Support Tracker */}
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <SupportTrackerCard />
          </GridItem>

          {/* Revenue Generated */}
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <RevenueGeneratedCard />
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

