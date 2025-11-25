import { Box, Text, VStack, HStack, Progress, Circle, useToken } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { type RootState } from "../../store";

export const SupportTrackerCard = () => {
  const { supportTickets, totalTickets, completionRate } = useSelector(
    (state: RootState) => state.dashboard
  );

  const [circleTrackColor] = useToken("colors", ["circle.track"]);

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
            Last 7 Days
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="text.primary">
            Support Tracker
          </Text>
        </Box>

        {/* Circular Progress */}
        <Box position="relative" alignSelf="center">
          {/* Outer Circle */}
          <Box position="relative" w="160px" h="160px">
            <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
              {/* Background Circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={circleTrackColor}
                strokeWidth="12"
              />
              {/* Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - completionRate / 100)}`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center Text */}
            <VStack
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              spacing={0}
            >
              <Text fontSize="3xl" fontWeight="bold" color="text.primary">
                {completionRate}%
              </Text>
              <Text fontSize="xs" color="text.secondary">
                Completed
              </Text>
            </VStack>
          </Box>
        </Box>

        {/* Total Tickets */}
        <VStack spacing={0} align="center">
          <Text fontSize="2xl" fontWeight="bold" color="text.primary">
            {totalTickets}
          </Text>
          <Text fontSize="sm" color="text.secondary">
            Tickets
          </Text>
        </VStack>

        {/* Ticket Breakdown */}
        <VStack align="stretch" spacing={3}>
          {supportTickets.map((ticket, index) => (
            <HStack key={index} justify="space-between">
              <HStack spacing={3}>
                <Circle size="10px" bg={ticket.color} />
                <Text fontSize="sm" color="text.menu">
                  {ticket.type}
                </Text>
              </HStack>
              <Text fontSize="sm" fontWeight="medium" color="text.primary">
                {ticket.count}
              </Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};

