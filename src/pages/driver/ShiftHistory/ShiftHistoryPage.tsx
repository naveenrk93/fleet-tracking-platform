import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  SimpleGrid,
  Divider,
  Icon,
  Spinner,
  Center,
  useColorModeValue,
  Collapse,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store.ts";
import {
  getShifts,
  getVehicle,
  getShiftDeliveriesWithDetails,
  type Shift,
  type Vehicle,
} from "../../../services/api.ts";
import { DeliveryWithDetails } from "../../../store/deliveriesSlice.ts";
import { FiCalendar, FiClock, FiTruck, FiPackage, FiCheckCircle, FiXCircle, FiChevronDown, FiChevronUp } from "react-icons/fi";

interface ShiftWithDetails extends Shift {
  vehicle?: Vehicle;
  deliveries: DeliveryWithDetails[];
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  duration?: string;
}

const ShiftCard = ({ shift }: { shift: ShiftWithDetails }) => {
  const { isOpen, onToggle } = useDisclosure();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const successColor = useColorModeValue("green.500", "green.300");
  const failColor = useColorModeValue("red.500", "red.300");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "N/A";
    const time = new Date(timeString);
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      mb={4}
      bg={cardBg}
      overflow="hidden"
    >
      <Box
        as="button"
        onClick={onToggle}
        py={4}
        px={6}
        w="100%"
        textAlign="left"
        _hover={{ bg: hoverBg }}
        transition="background-color 0.2s"
        cursor="pointer"
      >
        <HStack flex="1" spacing={6} align="center">
          <Icon as={FiCalendar} boxSize={5} color="blue.500" />
          <VStack align="start" spacing={0} flex="1">
            <Text fontWeight="bold" fontSize="lg">
              {formatDate(shift.date)}
            </Text>
            <HStack spacing={4} fontSize="sm" color="gray.500">
              <HStack>
                <Icon as={FiTruck} />
                <Text>{shift.vehicle?.registration || "Vehicle N/A"}</Text>
              </HStack>
              <HStack>
                <Icon as={FiClock} />
                <Text>{shift.duration}</Text>
              </HStack>
            </HStack>
          </VStack>

          <HStack spacing={4}>
            <VStack spacing={0}>
              <Text fontSize="xs" color="gray.500">
                Total
              </Text>
              <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                {shift.totalDeliveries}
              </Badge>
            </VStack>
            <VStack spacing={0}>
              <Text fontSize="xs" color="gray.500">
                Completed
              </Text>
              <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                {shift.completedDeliveries}
              </Badge>
            </VStack>
            {shift.failedDeliveries > 0 && (
              <VStack spacing={0}>
                <Text fontSize="xs" color="gray.500">
                  Failed
                </Text>
                <Badge colorScheme="red" fontSize="md" px={3} py={1}>
                  {shift.failedDeliveries}
                </Badge>
              </VStack>
            )}
          </HStack>

          <Icon
            as={isOpen ? FiChevronUp : FiChevronDown}
            boxSize={6}
            transition="transform 0.2s"
          />
        </HStack>
      </Box>

      <Collapse in={isOpen} animateOpacity>
        <Box px={6} pb={4} pt={2}>
          <VStack align="stretch" spacing={4}>
            {/* Shift Details */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>
                  Start Time
                </Text>
                <Text fontWeight="semibold">{formatTime(shift.startTime)}</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>
                  End Time
                </Text>
                <Text fontWeight="semibold">{formatTime(shift.endTime)}</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.500" mb={1}>
                  Vehicle Type
                </Text>
                <Text fontWeight="semibold">
                  {shift.vehicle?.type || "N/A"}
                </Text>
              </Box>
            </SimpleGrid>

            <Divider />

            {/* Deliveries List */}
            <Box>
              <Text fontWeight="bold" mb={3}>
                Deliveries ({shift.totalDeliveries})
              </Text>
              <VStack align="stretch" spacing={3}>
                {shift.deliveries.map((delivery) => (
                  <Card
                    key={delivery.id}
                    size="sm"
                    borderWidth={1}
                    borderColor={borderColor}
                  >
                    <CardBody>
                      <HStack spacing={4} align="start">
                        <Icon
                          as={
                            delivery.status === "completed"
                              ? FiCheckCircle
                              : FiXCircle
                          }
                          boxSize={5}
                          color={
                            delivery.status === "completed"
                              ? successColor
                              : failColor
                          }
                          mt={1}
                        />
                        <VStack align="start" flex="1" spacing={1}>
                          <HStack justify="space-between" w="100%">
                            <Text fontWeight="semibold">
                              {delivery.destination?.name || "Unknown"}
                            </Text>
                            <Badge
                              colorScheme={
                                delivery.status === "completed"
                                  ? "green"
                                  : "red"
                              }
                            >
                              {delivery.status}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {delivery.destination?.address}
                          </Text>
                          <HStack spacing={4} fontSize="sm">
                            <HStack>
                              <Icon as={FiPackage} color="gray.500" />
                              <Text color="gray.600">
                                {delivery.product?.name || "Unknown"}
                              </Text>
                            </HStack>
                            <Text color="gray.500">
                              Qty: {delivery.order?.quantity || 0}{" "}
                              {delivery.product?.unit || ""}
                            </Text>
                          </HStack>
                          {delivery.status === "failed" &&
                            delivery.failureReason && (
                              <Text
                                fontSize="sm"
                                color={failColor}
                                fontStyle="italic"
                              >
                                Reason: {delivery.failureReason}
                              </Text>
                            )}
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Collapse>
    </Card>
  );
};

export const ShiftHistoryPage = () => {
  const [shifts, setShifts] = useState<ShiftWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state: RootState) => state.user.userId);
  const userRole = useSelector((state: RootState) => state.user.role);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    loadShiftHistory();
  }, [userId]);

  const loadShiftHistory = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      // Get all shifts for this driver that are completed
      const allShifts = await getShifts();
      const driverShifts = allShifts.filter(
        (shift) => shift.driverId === userId && shift.status === "completed"
      );

      // Sort by date (most recent first)
      driverShifts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Load details for each shift
      const shiftsWithDetails = await Promise.all(
        driverShifts.map(async (shift) => {
          const [vehicle, deliveries] = await Promise.all([
            getVehicle(shift.vehicleId).catch(() => null),
            getShiftDeliveriesWithDetails(shift.id),
          ]);

          const totalDeliveries = deliveries.length;
          const completedDeliveries = deliveries.filter(
            (d) => d.status === "completed"
          ).length;
          const failedDeliveries = deliveries.filter(
            (d) => d.status === "failed"
          ).length;

          // Calculate duration
          let duration = "N/A";
          if (shift.startTime && shift.endTime) {
            const start = new Date(shift.startTime);
            const end = new Date(shift.endTime);
            const durationMs = end.getTime() - start.getTime();
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
            duration = `${hours}h ${minutes}m`;
          }

          return {
            ...shift,
            vehicle: vehicle || undefined,
            deliveries,
            totalDeliveries,
            completedDeliveries,
            failedDeliveries,
            duration,
          };
        })
      );

      setShifts(shiftsWithDetails);
    } catch (error) {
      console.error("Error loading shift history:", error);
    } finally {
      setLoading(false);
    }
  };

  // If not in driver role, don't show anything (prevents flash of content when switching modes)
  if (userRole !== "driver") {
    return null;
  }

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  if (shifts.length === 0) {
    return (
      <Box p={6}>
        <Heading size="lg" mb={4}>
          Shift History
        </Heading>
        <Card>
          <CardBody>
            <Center py={8}>
              <VStack spacing={3}>
                <Icon as={FiCalendar} boxSize={12} color="gray.400" />
                <Text color="gray.500" fontSize="lg">
                  No completed shifts found
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Your completed shifts will appear here
                </Text>
              </VStack>
            </Center>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading size="lg" mb={2}>
            Shift History
          </Heading>
          <Text color="gray.500">
            Review your past shifts and delivery performance
          </Text>
        </Box>

        {/* Summary Stats */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <StatGroup>
              <Stat>
                <StatLabel>Total Shifts</StatLabel>
                <StatNumber>{shifts.length}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Total Deliveries</StatLabel>
                <StatNumber>
                  {shifts.reduce((sum, s) => sum + s.totalDeliveries, 0)}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Completed</StatLabel>
                <StatNumber color="green.500">
                  {shifts.reduce((sum, s) => sum + s.completedDeliveries, 0)}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Failed</StatLabel>
                <StatNumber color="red.500">
                  {shifts.reduce((sum, s) => sum + s.failedDeliveries, 0)}
                </StatNumber>
              </Stat>
            </StatGroup>
          </CardBody>
        </Card>

        {/* Shift List */}
        <Box>
          {shifts.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} />
          ))}
        </Box>
      </VStack>
    </Box>
  );
};

