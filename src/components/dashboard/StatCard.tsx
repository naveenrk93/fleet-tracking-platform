import { Box, Text, VStack, HStack, Icon, useColorMode } from "@chakra-ui/react";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";

interface StatCardProps {
  title: string;
  value: string;
  percentage?: string;
  trend?: "up" | "down";
  icon?: any;
  color?: string;
  subtitle?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  percentage, 
  trend = "up",
  icon,
  color = "green.400",
  subtitle
}: StatCardProps) => {
  const { colorMode } = useColorMode();
  const iconBg = colorMode === "light" ? `${color.split('.')[0]}.50` : `${color.split('.')[0]}.900`;

  return (
    <Box
      bg="bg.surface"
      borderRadius="xl"
      p={6}
      border="1px solid"
      borderColor="border.default"
      _hover={{ borderColor: "border.hover", transform: "translateY(-2px)" }}
      transition="all 0.2s"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Text fontSize="sm" color="text.secondary" fontWeight="medium">
            {title}
          </Text>
          {icon && (
            <Box
              p={2}
              bg={iconBg}
              borderRadius="lg"
            >
              <Icon as={icon} color={color} boxSize={5} />
            </Box>
          )}
        </HStack>

        <HStack justify="space-between" align="end">
          <VStack align="start" spacing={0}>
            <Text fontSize="3xl" fontWeight="bold" color="text.primary">
              {value}
            </Text>
            {subtitle && (
              <Text fontSize="xs" color="text.tertiary">
                {subtitle}
              </Text>
            )}
          </VStack>

          {percentage && (
            <HStack
              spacing={1}
              bg={trend === "up" ? "bg.trend.up" : "bg.trend.down"}
              color={trend === "up" ? "green.400" : "red.400"}
              px={2}
              py={1}
              borderRadius="md"
              fontSize="sm"
              fontWeight="medium"
            >
              <Icon as={trend === "up" ? MdTrendingUp : MdTrendingDown} />
              <Text>{percentage}</Text>
            </HStack>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

