import { Box, Text, HStack, VStack, Flex } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { type RootState } from "../../store";

export const EarningReportsCard = () => {
  const { earningReports, totalEarnings, earningsTrend } = useSelector(
    (state: RootState) => state.dashboard
  );

  const maxEarning = Math.max(...earningReports.map((r) => r.earnings));

  return (
    <Box
      bg="bg.surface"
      borderRadius="xl"
      p={6}
      border="1px solid"
      borderColor="border.default"
    >
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <Box>
          <Text fontSize="sm" color="text.secondary" mb={1}>
            Weekly Earnings Stats
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="text.primary">
            Earning Reports
          </Text>
        </Box>

        {/* Earnings Amount */}
        <HStack spacing={2}>
          <Text fontSize="3xl" fontWeight="bold" color="text.primary">
            {totalEarnings}
          </Text>
          <HStack
            spacing={1}
            bg="bg.trend.up"
            color="green.400"
            px={2}
            py={1}
            borderRadius="md"
            fontSize="sm"
            fontWeight="medium"
          >
            <Text>{earningsTrend}</Text>
          </HStack>
        </HStack>

        <Text fontSize="xs" color="text.secondary">
          Compared to last week
        </Text>

        {/* Bar Chart */}
        <Flex justify="space-between" align="end" h="120px" gap={2}>
          {earningReports.map((report, index) => {
            const height = (report.earnings / maxEarning) * 100;
            const isHighest = report.earnings === maxEarning;

            return (
              <VStack key={index} spacing={2} flex={1}>
                <Box
                  w="100%"
                  h={`${height}%`}
                  bg={isHighest ? "purple.500" : "purple.700"}
                  borderRadius="md"
                  position="relative"
                  transition="all 0.3s"
                  _hover={{
                    bg: isHighest ? "purple.400" : "purple.600",
                    transform: "scaleY(1.05)",
                  }}
                />
                <Text fontSize="xs" color="text.secondary">
                  {report.week}
                </Text>
              </VStack>
            );
          })}
        </Flex>

        {/* Legend */}
        <HStack spacing={6} fontSize="xs">
          <HStack spacing={2}>
            <Box w="10px" h="10px" bg="purple.500" borderRadius="sm" />
            <Text color="text.muted">Earnings</Text>
            <Text color="text.primary" fontWeight="medium">
              $545.69
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Box w="10px" h="10px" bg="cyan.400" borderRadius="sm" />
            <Text color="text.muted">Profit</Text>
            <Text color="text.primary" fontWeight="medium">
              $256.34
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Box w="10px" h="10px" bg="gray.500" borderRadius="sm" />
            <Text color="text.muted">Expense</Text>
            <Text color="text.primary" fontWeight="medium">
              $74.19
            </Text>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
};

