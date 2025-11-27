import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Button,
  VStack,
  HStack,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Grid,
  GridItem,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../store.ts";
import {
  getShifts,
  updateShift,
  getDeliveries,
  getVehicles,
  getOrders,
  getTerminals,
  getProducts,
  type Shift,
  type Delivery,
  type Vehicle,
  type Order,
  type Terminal,
  type Product,
} from "../../../services/api.ts";
import { FaTruck, FaPlayCircle, FaBox, FaMapMarkerAlt, FaClock, FaMap } from "react-icons/fa";

interface DeliveryWithDetails extends Delivery {
  order?: Order;
  terminal?: Terminal;
  product?: Product;
}

export const ShiftViewPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const userId = useSelector((state: RootState) => state.user.userId);
  const userRole = useSelector((state: RootState) => state.user.role);
  
  const [loading, setLoading] = useState(true);
  const [todayShift, setTodayShift] = useState<Shift | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryWithDetails[]>([]);
  const [startingShift, setStartingShift] = useState(false);

  const today = (() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  useEffect(() => {
    fetchShiftData();
  }, [userId]);

  const fetchShiftData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const allShifts = await getShifts();
      const shift = allShifts.find(
        (s) => s.driverId === userId && s.date === today
      );

      setTodayShift(shift || null);

      if (shift) {
        const allVehicles = await getVehicles();
        const vehicleData = allVehicles.find((v) => v.id === shift.vehicleId);
        setVehicle(vehicleData || null);

        const allDeliveries = await getDeliveries();
        const shiftDeliveries = allDeliveries.filter((d) => d.shiftId === shift.id);

        const [allOrders, allTerminals, allProducts] = await Promise.all([
          getOrders(),
          getTerminals(),
          getProducts(),
        ]);

        const enrichedDeliveries: DeliveryWithDetails[] = shiftDeliveries.map((delivery) => {
          const order = allOrders.find((o) => o.id === delivery.orderId);
          const terminal = order ? allTerminals.find((t) => t.id === order.destinationId) : undefined;
          const product = order ? allProducts.find((p) => p.id === order.productId) : undefined;

          return {
            ...delivery,
            order,
            terminal,
            product,
          };
        });

        setDeliveries(enrichedDeliveries);
      } else {
        setVehicle(null);
        setDeliveries([]);
      }
    } catch (error) {
      console.error("Error fetching shift data:", error);
      toast({
        title: "Error loading shift data",
        description: "Failed to fetch shift information. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartShift = async () => {
    if (!todayShift) return;

    try {
      setStartingShift(true);
      
      const updatedShift = await updateShift(todayShift.id, {
        status: "active",
        startTime: new Date().toISOString(),
      });

      setTodayShift(updatedShift);
      
      toast({
        title: "Shift started",
        description: "Your shift has been successfully started. Stay safe!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error starting shift:", error);
      toast({
        title: "Error starting shift",
        description: "Failed to start shift. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setStartingShift(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "yellow";
      case "active":
      case "in-progress":
        return "blue";
      case "completed":
        return "green";
      case "failed":
        return "red";
      default:
        return "gray";
    }
  };

  if (userRole !== "driver") {
    return null;
  }

  if (loading) {
    return (
      <Box p={{ base: 4, md: 6 }} display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="text.secondary" fontSize={{ base: "sm", md: "md" }}>Loading shift information...</Text>
        </VStack>
      </Box>
    );
  }

  if (!userId) {
    return (
      <Box p={{ base: 4, md: 6 }}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize={{ base: "md", md: "lg" }}>No Driver ID</AlertTitle>
            <AlertDescription fontSize={{ base: "sm", md: "md" }}>
              Please log in to view your shift information.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  if (!todayShift) {
    return (
      <Box p={{ base: 4, md: 6 }}>
        <Heading size={{ base: "md", md: "lg" }} mb={4}>Shift View</Heading>
        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          minH="200px"
          borderRadius="md"
        >
          <AlertIcon boxSize={{ base: "32px", md: "40px" }} mr={0} />
          <AlertTitle mt={4} mb={1} fontSize={{ base: "md", md: "lg" }}>
            No Shift Allocated
          </AlertTitle>
          <AlertDescription maxWidth="sm" fontSize={{ base: "sm", md: "md" }}>
            You don't have a shift allocated for today ({today}). Please contact your
            supervisor or check back later.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 6 }}>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        {/* Header */}
        <Box>
          <Heading size={{ base: "md", md: "lg" }} mb={2}>Today's Shift</Heading>
          <Text color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </Box>

        {/* Shift Details Card */}
        <Card>
          <CardHeader>
            <VStack spacing={3} align="stretch">
              <HStack spacing={3}>
                <Icon as={FaTruck} boxSize={{ base: 5, md: 6 }} color="blue.500" />
                <Heading size={{ base: "sm", md: "md" }}>Shift Details</Heading>
              </HStack>
              <Badge 
                colorScheme={getStatusColor(todayShift.status)} 
                fontSize={{ base: "sm", md: "md" }} 
                px={3} 
                py={1}
                width="fit-content"
              >
                {todayShift.status.toUpperCase()}
              </Badge>
            </VStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <GridItem>
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      <Text fontSize="sm" color="text.secondary" mb={1}>
                        Vehicle
                      </Text>
                      <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                        {vehicle?.registration || "N/A"}
                      </Text>
                      <Text fontSize="sm" color="text.secondary">
                        {vehicle?.type} • Capacity: {vehicle?.capacity.toLocaleString()} L
                      </Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" color="text.secondary" mb={1}>
                        <Icon as={FaClock} mr={1} />
                        Shift Times
                      </Text>
                      {todayShift.startTime ? (
                        <VStack align="stretch" spacing={1}>
                          <Text fontSize="sm">
                            Started: {new Date(todayShift.startTime).toLocaleTimeString()}
                          </Text>
                          {todayShift.endTime && (
                            <Text fontSize="sm">
                              Ended: {new Date(todayShift.endTime).toLocaleTimeString()}
                            </Text>
                          )}
                        </VStack>
                      ) : (
                        <Text fontSize="sm" color="text.secondary">Not started yet</Text>
                      )}
                    </Box>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      <Text fontSize="sm" color="text.secondary" mb={1}>
                        Assigned Deliveries
                      </Text>
                      <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="blue.500">
                        {deliveries.length}
                      </Text>
                    </Box>
                    
                    <Divider />
                    
                    <Box>
                      <Text fontSize="sm" color="text.secondary" mb={2}>
                        Delivery Status
                      </Text>
                      <VStack align="stretch" spacing={1}>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Pending:</Text>
                          <Badge colorScheme="yellow">
                            {deliveries.filter((d) => d.status === "pending").length}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">In Progress:</Text>
                          <Badge colorScheme="blue">
                            {deliveries.filter((d) => d.status === "in-progress").length}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm">Completed:</Text>
                          <Badge colorScheme="green">
                            {deliveries.filter((d) => d.status === "completed").length}
                          </Badge>
                        </HStack>
                      </VStack>
                    </Box>
                  </VStack>
                </GridItem>
              </Grid>

              {todayShift.status === "pending" && (
                <Box>
                  <Button
                    colorScheme="blue"
                    size={{ base: "md", md: "lg" }}
                    leftIcon={<FaPlayCircle />}
                    onClick={handleStartShift}
                    isLoading={startingShift}
                    loadingText="Starting shift..."
                    width={{ base: "100%", md: "auto" }}
                  >
                    Start Shift
                  </Button>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="text.secondary" mt={2}>
                    Click to begin your shift and start accepting deliveries
                  </Text>
                </Box>
              )}
              
              {todayShift.status === "active" && (
                <Box>
                  <Button
                    colorScheme="green"
                    size={{ base: "md", md: "lg" }}
                    leftIcon={<FaMap />}
                    onClick={() => navigate("/driver/live-map")}
                    width={{ base: "100%", md: "auto" }}
                  >
                    Open Live Map
                  </Button>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="text.secondary" mt={2}>
                    Navigate to your delivery destinations with real-time GPS tracking
                  </Text>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Assigned Deliveries List */}
        <Card>
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={FaBox} boxSize={{ base: 4, md: 5 }} color="purple.500" />
              <Heading size={{ base: "sm", md: "md" }}>Assigned Deliveries</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            {deliveries.length === 0 ? (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize={{ base: "sm", md: "md" }}>No deliveries assigned to this shift yet.</Text>
              </Alert>
            ) : (
              <VStack spacing={4} align="stretch">
                {deliveries.map((delivery, index) => (
                  <Box
                    key={delivery.id}
                    p={{ base: 3, md: 4 }}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor="gray.200"
                    _hover={{ borderColor: "blue.400", shadow: "sm" }}
                    transition="all 0.2s"
                  >
                    <VStack align="stretch" spacing={3}>
                      <HStack flexWrap="wrap" gap={2}>
                        <Badge colorScheme="purple" fontSize="xs">
                          Delivery #{index + 1}
                        </Badge>
                        <Badge colorScheme={getStatusColor(delivery.status)} fontSize="xs">
                          {delivery.status}
                        </Badge>
                      </HStack>
                      
                      <VStack align="start" spacing={2}>
                        <HStack spacing={2} align="start">
                          <Icon as={FaMapMarkerAlt} color="red.500" mt={1} />
                          <Box flex="1">
                            <Text fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>
                              {delivery.terminal?.name || "Unknown Terminal"}
                            </Text>
                            <Text fontSize={{ base: "xs", md: "sm" }} color="text.secondary">
                              {delivery.terminal?.address || "Address not available"}
                            </Text>
                          </Box>
                        </HStack>

                        <HStack spacing={2} align="start" pl={{ base: 0, md: 6 }}>
                          <Icon as={FaBox} color="blue.500" boxSize={4} mt={1} />
                          <Box flex="1">
                            <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                              {delivery.product?.name || `Product (${delivery.order?.productId || "Unknown"})`}
                            </Text>
                            <Text fontSize={{ base: "xs", md: "sm" }} color="text.secondary">
                              Quantity: {delivery.order?.quantity.toLocaleString() || 0} {delivery.product?.unit || "units"}
                            </Text>
                          </Box>
                        </HStack>

                        {delivery.failureReason && (
                          <Alert status="error" size="sm" borderRadius="md">
                            <AlertIcon />
                            <AlertDescription fontSize={{ base: "xs", md: "sm" }}>
                              {delivery.failureReason}
                            </AlertDescription>
                          </Alert>
                        )}
                      </VStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

