import { Box, Heading, VStack, HStack, Text, Badge } from "@chakra-ui/react";

export const LiveFleetMapPage = () => {
  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Page Header */}
        <HStack justify="space-between">
          <Heading size="lg" color="text.primary">
            Live Fleet Tracking
          </Heading>
          <HStack spacing={4}>
            <HStack>
              <Box w="12px" h="12px" bg="green.400" borderRadius="full" />
              <Text fontSize="sm" color="text.secondary">Active: 45</Text>
            </HStack>
            <HStack>
              <Box w="12px" h="12px" bg="orange.400" borderRadius="full" />
              <Text fontSize="sm" color="text.secondary">Idle: 8</Text>
            </HStack>
            <HStack>
              <Box w="12px" h="12px" bg="red.400" borderRadius="full" />
              <Text fontSize="sm" color="text.secondary">Offline: 2</Text>
            </HStack>
          </HStack>
        </HStack>

        {/* Map Container */}
        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={6}
          minH="600px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <VStack spacing={4}>
            <Text fontSize="xl" color="text.primary">
              🗺️ Map Integration
            </Text>
            <Text color="text.secondary">
              Live fleet tracking map will be integrated here
            </Text>
            <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
              Google Maps / Mapbox Integration
            </Badge>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

