import { Box, Text, VStack, HStack, useToken } from "@chakra-ui/react";

export const RevenueGeneratedCard = () => {
  const data = [
    { month: "Jan", value: 60 },
    { month: "Feb", value: 45 },
    { month: "Mar", value: 75 },
    { month: "Apr", value: 55 },
    { month: "May", value: 80 },
    { month: "Jun", value: 65 },
    { month: "Jul", value: 70 },
  ];

  const maxValue = Math.max(...data.map((d) => d.value));
  
  const [gridLineColor, chartStroke] = useToken("colors", ["chart.grid", "chart.stroke"]);

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
        <HStack justify="space-between">
          <Box>
            <Text fontSize="lg" fontWeight="bold" color="text.primary">
              Revenue Generated
            </Text>
            <Text fontSize="sm" color="text.secondary" mt={1}>
              Monthly Report
            </Text>
          </Box>
        </HStack>

        {/* Line Chart Area */}
        <Box h="200px" position="relative">
          <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={200 - y * 2}
                x2="400"
                y2={200 - y * 2}
                stroke={gridLineColor}
                strokeWidth="1"
                opacity="0.3"
              />
            ))}

            {/* Area Fill */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#48BB78" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#48BB78" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Area Path */}
            <path
              d={`
                M 0,${200 - (data[0].value / maxValue) * 180}
                ${data
                  .map(
                    (point, i) =>
                      `L ${(i * 400) / (data.length - 1)},${
                        200 - (point.value / maxValue) * 180
                      }`
                  )
                  .join(" ")}
                L 400,200
                L 0,200
                Z
              `}
              fill="url(#areaGradient)"
            />

            {/* Line Path */}
            <path
              d={`
                M 0,${200 - (data[0].value / maxValue) * 180}
                ${data
                  .map(
                    (point, i) =>
                      `L ${(i * 400) / (data.length - 1)},${
                        200 - (point.value / maxValue) * 180
                      }`
                  )
                  .join(" ")}
              `}
              fill="none"
              stroke="#48BB78"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {data.map((point, i) => (
              <circle
                key={i}
                cx={(i * 400) / (data.length - 1)}
                cy={200 - (point.value / maxValue) * 180}
                r="5"
                fill="#48BB78"
                stroke={chartStroke}
                strokeWidth="2"
              />
            ))}
          </svg>
        </Box>

        {/* X-Axis Labels */}
        <HStack justify="space-between" px={2}>
          {data.map((point, i) => (
            <Text key={i} fontSize="xs" color="text.secondary">
              {point.month}
            </Text>
          ))}
        </HStack>
      </VStack>
    </Box>
  );
};

