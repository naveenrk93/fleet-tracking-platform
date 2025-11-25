import { Box, Text, VStack, Grid, GridItem } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { type RootState } from "../../store";

export const WebsiteAnalyticsCard = () => {
  const analytics = useSelector((state: RootState) => state.dashboard.analytics);

  return (
    <Box
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      borderRadius="xl"
      p={6}
      color="white"
      position="relative"
      overflow="hidden"
    >
      {/* 3D Sphere Decoration */}
      <Box
        position="absolute"
        right="-20px"
        top="20px"
        w="180px"
        h="180px"
        bg="radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent)"
        borderRadius="full"
        opacity={0.6}
      >
        <Box
          position="absolute"
          top="20%"
          left="20%"
          w="60%"
          h="60%"
          bg="radial-gradient(circle at 40% 40%, rgba(255,255,255,0.4), transparent)"
          borderRadius="full"
        />
      </Box>

      <VStack align="stretch" spacing={4} position="relative" zIndex={1}>
        {/* Header */}
        <Box>
          <Text fontSize="xl" fontWeight="bold">
            Website Analytics
          </Text>
          <Text fontSize="sm" opacity={0.8}>
            Total {analytics.sessions.toLocaleString()} Sessions
          </Text>
        </Box>

        {/* Stats Grid */}
        <Grid templateColumns="repeat(4, 1fr)" gap={4} mt={2}>
          <GridItem>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold">
                {analytics.users}
              </Text>
              <Text fontSize="xs" opacity={0.9}>
                Users
              </Text>
            </VStack>
          </GridItem>
          <GridItem>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold">
                {analytics.sessions.toLocaleString()}
              </Text>
              <Text fontSize="xs" opacity={0.9}>
                Sessions
              </Text>
            </VStack>
          </GridItem>
          <GridItem>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold">
                {analytics.pageViews}
              </Text>
              <Text fontSize="xs" opacity={0.9}>
                Page Views
              </Text>
            </VStack>
          </GridItem>
          <GridItem>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold">
                {analytics.leads}
              </Text>
              <Text fontSize="xs" opacity={0.9}>
                Leads
              </Text>
            </VStack>
          </GridItem>
        </Grid>

        <Grid templateColumns="repeat(4, 1fr)" gap={4}>
          <GridItem>
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold">
                {analytics.conversions}
              </Text>
              <Text fontSize="xs" opacity={0.9}>
                Conversions
              </Text>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

