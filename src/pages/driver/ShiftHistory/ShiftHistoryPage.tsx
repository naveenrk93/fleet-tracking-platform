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
        py={{ base: 3, md: 4 }}
        px={{ base: 4, md: 6 }}
        w="100%"
        textAlign="left"
        _hover={{ bg: hoverBg }}
        transition="background-color 0.2s"
        cursor="pointer"
      >
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between" align="start">
            <HStack spacing={{ base: 3, md: 4 }} flex="1">
              <Icon as={FiCalendar} boxSize={{ base: 4, md: 5 }} color="blue.500" flexShrink={0} />
              <VStack align="start" spacing={0} flex="1">
                <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }}>
                  {formatDate(shift.date)}
                </Text>
                <VStack align="start" spacing={1} fontSize={{ base: "xs", md: "sm" }} color="gray.500" mt={1}>
                  <HStack>
                    <Icon as={FiTruck} />
                    <Text>{shift.vehicle?.registration || "Vehicle N/A"}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiClock} />
                    <Text>{shift.duration}</Text>
                  </HStack>
                </VStack>
              </VStack>
            </HStack>
            <Icon
              as={isOpen ? FiChevronUp : FiChevronDown}
              boxSize={{ base: 5, md: 6 }}
              transition="transform 0.2s"
              flexShrink={0}
            />
          </HStack>

          <HStack spacing={{ base: 2, md: 4 }} justify="space-between" flexWrap="wrap">
            <VStack spacing={0}>
              <Text fontSize="xs" color="gray.500">
                Total
              </Text>
              <Badge colorScheme="blue" fontSize={{ base: "sm", md: "md" }} px={{ base: 2, md: 3 }} py={1}>
                {shift.totalDeliveries}
              </Badge>
            </VStack>
            <VStack spacing={0}>
              <Text fontSize="xs" color="gray.500">
                Completed
              </Text>
              <Badge colorScheme="green" fontSize={{ base: "sm", md: "md" }} px={{ base: 2, md: 3 }} py={1}>
                {shift.completedDeliveries}
              </Badge>
            </VStack>
            {shift.failedDeliveries > 0 && (
              <VStack spacing={0}>
                <Text fontSize="xs" color="gray.500">
                  Failed
                </Text>
                <Badge colorScheme="red" fontSize={{ base: "sm", md: "md" }} px={{ base: 2, md: 3 }} py={1}>
                  {shift.failedDeliveries}
                </Badge>
              </VStack>
            )}
          </HStack>
        </VStack>
      </Box>

      <Collapse in={isOpen} animateOpacity>
        <Box px={{ base: 4, md: 6 }} pb={{ base: 3, md: 4 }} pt={2}>
          <VStack align="stretch" spacing={4}>
            {/* Shift Details */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box>
                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500" mb={1}>
                  Start Time
                </Text>
                <Text fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>{formatTime(shift.startTime)}</Text>
              </Box>
              <Box>
                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500" mb={1}>
                  End Time
                </Text>
                <Text fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>{formatTime(shift.endTime)}</Text>
              </Box>
              <Box>
                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500" mb={1}>
                  Vehicle Type
                </Text>
                <Text fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>
                  {shift.vehicle?.type || "N/A"}
                </Text>
              </Box>
            </SimpleGrid>

            <Divider />

            {/* Deliveries List */}
            <Box>
              <Text fontWeight="bold" mb={3} fontSize={{ base: "sm", md: "md" }}>
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
                    <CardBody p={{ base: 3, md: 4 }}>
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between" align="start">
                          <HStack spacing={2} flex="1">
                            <Icon
                              as={
                                delivery.status === "completed"
                                  ? FiCheckCircle
                                  : FiXCircle
                              }
                              boxSize={{ base: 4, md: 5 }}
                              color={
                                delivery.status === "completed"
                                  ? successColor
                                  : failColor
                              }
                              flexShrink={0}
                            />
                            <Text fontWeight="semibold" fontSize={{ base: "sm", md: "md" }} noOfLines={1}>
                              {delivery.destination?.name || "Unknown"}
                            </Text>
                          </HStack>
                          <Badge
                            colorScheme={
                              delivery.status === "completed"
                                ? "green"
                                : "red"
                            }
                            fontSize={{ base: "xs", md: "sm" }}
                            flexShrink={0}
                          >
                            {delivery.status}
                          </Badge>
                        </HStack>
                        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" pl={{ base: 0, md: 6 }}>
                          {delivery.destination?.address}
                        </Text>
                        <VStack align="start" spacing={1} pl={{ base: 0, md: 6 }} fontSize={{ base: "xs", md: "sm" }}>
                          <HStack>
                            <Icon as={FiPackage} color="gray.500" boxSize={3} />
                            <Text color="gray.600">
                              {delivery.product?.name || "Unknown"}
                            </Text>
                          </HStack>
                          <Text color="gray.500">
                            Qty: {delivery.order?.quantity || 0}{" "}
                            {delivery.product?.unit || ""}
                          </Text>
                        </VStack>
                        {delivery.status === "failed" &&
                          delivery.failureReason && (
                            <Text
                              fontSize={{ base: "xs", md: "sm" }}
                              color={failColor}
                              fontStyle="italic"
                              pl={{ base: 0, md: 6 }}
                            >
                              Reason: {delivery.failureReason}
                            </Text>
                          )}
                      </VStack>
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
      const allShifts = await getShifts();
      const driverShifts = allShifts.filter(
        (shift) => shift.driverId === userId && shift.status === "completed"
      );

      driverShifts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  if (userRole !== "driver") {
    return null;
  }

  if (loading) {
    return (
      <Center h="400px" p={{ base: 4, md: 6 }}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="text.secondary" fontSize={{ base: "sm", md: "md" }}>Loading shift history...</Text>
        </VStack>
      </Center>
    );
  }

  if (shifts.length === 0) {
    return (
      <Box p={{ base: 4, md: 6 }}>
        <Heading size={{ base: "md", md: "lg" }} mb={4}>
          Shift History
        </Heading>
        <Card>
          <CardBody>
            <Center py={8}>
              <VStack spacing={3}>
                <Icon as={FiCalendar} boxSize={{ base: 10, md: 12 }} color="gray.400" />
                <Text color="gray.500" fontSize={{ base: "md", md: "lg" }}>
                  No completed shifts found
                </Text>
                <Text color="gray.400" fontSize={{ base: "xs", md: "sm" }}>
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
    <Box p={{ base: 4, md: 6 }}>
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        <Box>
          <Heading size={{ base: "md", md: "lg" }} mb={2}>
            Shift History
          </Heading>
          <Text color="gray.500" fontSize={{ base: "sm", md: "md" }}>
            Review your past shifts and delivery performance
          </Text>
        </Box>

        {/* Summary Stats */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }}>Total Shifts</StatLabel>
                <StatNumber fontSize={{ base: "2xl", md: "3xl" }}>{shifts.length}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }}>Total Deliveries</StatLabel>
                <StatNumber fontSize={{ base: "2xl", md: "3xl" }}>
                  {shifts.reduce((sum, s) => sum + s.totalDeliveries, 0)}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }}>Completed</StatLabel>
                <StatNumber fontSize={{ base: "2xl", md: "3xl" }} color="green.500">
                  {shifts.reduce((sum, s) => sum + s.completedDeliveries, 0)}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel fontSize={{ base: "xs", md: "sm" }}>Failed</StatLabel>
                <StatNumber fontSize={{ base: "2xl", md: "3xl" }} color="red.500">
                  {shifts.reduce((sum, s) => sum + s.failedDeliveries, 0)}
                </StatNumber>
              </Stat>
            </SimpleGrid>
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

