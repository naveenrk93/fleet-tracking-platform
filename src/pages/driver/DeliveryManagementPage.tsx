import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
  Button,
  VStack,
  HStack,
  Divider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import {
  getShiftDeliveriesWithDetails,
  completeDelivery,
  failDelivery,
  endShift,
  getShifts,
  type Shift,
} from "../../services/api";
import {
  setDeliveries,
  updateDeliveryStatus,
  setDeliveriesLoading,
  setDeliveriesError,
  type DeliveryWithDetails,
} from "../../store/index";
import { FaCheck, FaTimes, FaBox, FaMapMarkerAlt, FaCalendar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export const DeliveryManagementPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const userId = useAppSelector((state) => state.user.userId);
  const userRole = useAppSelector((state) => state.user.role);
  const { deliveries, loading } = useAppSelector(
    (state) => state.deliveries
  );

  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [selectedDelivery, setSelectedDelivery] =
    useState<DeliveryWithDetails | null>(null);
  const [failureReason, setFailureReason] = useState("");
  const [processingDeliveryId, setProcessingDeliveryId] = useState<
    string | null
  >(null);
  const [endingShift, setEndingShift] = useState(false);

  // Fetch active shift and deliveries
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        dispatch(setDeliveriesLoading(true));

        // Get all shifts for the current driver
        const shifts = await getShifts();
        const driverActiveShift = shifts.find(
          (shift) => shift.driverId === userId && shift.status === "active"
        );

        if (driverActiveShift) {
          setActiveShift(driverActiveShift);

          // Fetch deliveries for this shift
          const deliveriesWithDetails = await getShiftDeliveriesWithDetails(
            driverActiveShift.id
          );
          dispatch(setDeliveries(deliveriesWithDetails));
        } else {
          setActiveShift(null);
          dispatch(setDeliveries([]));
        }

        dispatch(setDeliveriesLoading(false));
      } catch (err) {
        console.error("Error fetching deliveries:", err);
        dispatch(
          setDeliveriesError(
            err instanceof Error ? err.message : "Failed to fetch deliveries"
          )
        );
        toast({
          title: "Error",
          description: "Failed to load deliveries",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchData();
  }, [userId, dispatch, toast]);

  const handleCompleteDelivery = async (delivery: DeliveryWithDetails) => {
    if (!delivery.id) return;

    try {
      setProcessingDeliveryId(delivery.id);

      await completeDelivery(delivery.id);

      dispatch(
        updateDeliveryStatus({
          deliveryId: delivery.id,
          status: "completed",
        })
      );

      toast({
        title: "Delivery Completed",
        description: `Delivery to ${delivery.destination?.name} completed successfully! Inventory updated.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error completing delivery:", err);
      toast({
        title: "Error",
        description: "Failed to complete delivery",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setProcessingDeliveryId(null);
    }
  };

  const handleOpenFailModal = (delivery: DeliveryWithDetails) => {
    setSelectedDelivery(delivery);
    setFailureReason("");
    onOpen();
  };

  const handleFailDelivery = async () => {
    if (!selectedDelivery || !failureReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a failure reason",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setProcessingDeliveryId(selectedDelivery.id);

      await failDelivery(selectedDelivery.id, failureReason);

      dispatch(
        updateDeliveryStatus({
          deliveryId: selectedDelivery.id,
          status: "failed",
          failureReason,
        })
      );

      toast({
        title: "Delivery Marked as Failed",
        description: `Delivery to ${selectedDelivery.destination?.name} marked as failed.`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      setSelectedDelivery(null);
      setFailureReason("");
    } catch (err) {
      console.error("Error failing delivery:", err);
      toast({
        title: "Error",
        description: "Failed to mark delivery as failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setProcessingDeliveryId(null);
    }
  };

  const handleEndShift = async () => {
    if (!activeShift) return;

    const pendingDeliveries = deliveries.filter(
      (d) => d.status === "pending" || d.status === "in-progress"
    );

    if (pendingDeliveries.length > 0) {
      const confirmEnd = window.confirm(
        `You have ${pendingDeliveries.length} pending deliveries. These will be marked as failed. Do you want to continue?`
      );
      if (!confirmEnd) return;
    }

    try {
      setEndingShift(true);

      await endShift(activeShift.id);

      toast({
        title: "Shift Ended",
        description: "Your shift has been completed successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Navigate to shift view or history
      navigate("/driver/shift-view");
    } catch (err) {
      console.error("Error ending shift:", err);
      toast({
        title: "Error",
        description: "Failed to end shift",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEndingShift(false);
    }
  };

  const getStatusColor = (
    status: DeliveryWithDetails["status"]
  ): string => {
    switch (status) {
      case "completed":
        return "green";
      case "failed":
        return "red";
      case "in-progress":
        return "blue";
      case "pending":
        return "orange";
      default:
        return "gray";
    }
  };

  // If not in driver role, don't show anything (prevents flash of alerts when switching modes)
  if (userRole !== "driver") {
    return null;
  }

  if (loading) {
    return (
      <Box p={6} display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text color="text.secondary">Loading deliveries...</Text>
        </VStack>
      </Box>
    );
  }

  if (!activeShift) {
    return (
      <Box p={6}>
        <Heading size="lg" mb={4}>
          Delivery Management
        </Heading>
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>No Active Shift</AlertTitle>
            <AlertDescription>
              You don't have an active shift. Please start a shift from the Shift
              View page to manage deliveries.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  const completedCount = deliveries.filter((d) => d.status === "completed").length;
  const failedCount = deliveries.filter((d) => d.status === "failed").length;
  const pendingCount = deliveries.filter(
    (d) => d.status === "pending" || d.status === "in-progress"
  ).length;

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={6}>
        <Box>
          <Heading size="lg" mb={2}>
            Delivery Management
          </Heading>
          <Text color="text.secondary">
            Manage your assigned deliveries for today
          </Text>
        </Box>
        <Button
          colorScheme="red"
          size="lg"
          onClick={handleEndShift}
          isLoading={endingShift}
          loadingText="Ending Shift..."
        >
          End Shift
        </Button>
      </HStack>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="text.secondary">
                Total Deliveries
              </Text>
              <Text fontSize="3xl" fontWeight="bold" color="brand.500">
                {deliveries.length}
              </Text>
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="text.secondary">
                Completed
              </Text>
              <Text fontSize="3xl" fontWeight="bold" color="green.500">
                {completedCount}
              </Text>
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="text.secondary">
                Pending
              </Text>
              <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                {pendingCount}
              </Text>
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="text.secondary">
                Failed
              </Text>
              <Text fontSize="3xl" fontWeight="bold" color="red.500">
                {failedCount}
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Deliveries List */}
      {deliveries.length === 0 ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>No Deliveries</AlertTitle>
            <AlertDescription>
              You don't have any deliveries assigned for this shift.
            </AlertDescription>
          </Box>
        </Alert>
      ) : (
        <VStack spacing={4} align="stretch">
          {deliveries.map((delivery) => (
            <Card key={delivery.id} boxShadow="md">
              <CardBody>
                <HStack justify="space-between" align="start" mb={4}>
                  <VStack align="start" spacing={2} flex={1}>
                    <HStack>
                      <Badge colorScheme={getStatusColor(delivery.status)} fontSize="sm">
                        {delivery.status.toUpperCase()}
                      </Badge>
                      {delivery.destination && (
                        <Badge colorScheme="purple" fontSize="sm">
                          {delivery.destination.type.toUpperCase()}
                        </Badge>
                      )}
                    </HStack>
                    <Heading size="md">{delivery.destination?.name || "Unknown Destination"}</Heading>
                  </VStack>
                  {(delivery.status === "pending" ||
                    delivery.status === "in-progress") && (
                    <HStack>
                      <Button
                        colorScheme="green"
                        leftIcon={<Icon as={FaCheck} />}
                        onClick={() => handleCompleteDelivery(delivery)}
                        isLoading={processingDeliveryId === delivery.id}
                        loadingText="Processing..."
                        size="sm"
                      >
                        Complete
                      </Button>
                      <Button
                        colorScheme="red"
                        leftIcon={<Icon as={FaTimes} />}
                        onClick={() => handleOpenFailModal(delivery)}
                        isDisabled={processingDeliveryId === delivery.id}
                        size="sm"
                      >
                        Mark Failed
                      </Button>
                    </HStack>
                  )}
                </HStack>

                <Divider mb={4} />

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <HStack>
                    <Icon as={FaMapMarkerAlt} color="text.secondary" />
                    <Box>
                      <Text fontSize="xs" color="text.secondary">
                        Destination
                      </Text>
                      <Text fontWeight="medium">
                        {delivery.destination?.address || "N/A"}
                      </Text>
                    </Box>
                  </HStack>
                  <HStack>
                    <Icon as={FaBox} color="text.secondary" />
                    <Box>
                      <Text fontSize="xs" color="text.secondary">
                        Product
                      </Text>
                      <Text fontWeight="medium">
                        {delivery.product?.name || "N/A"}
                      </Text>
                    </Box>
                  </HStack>
                  <HStack>
                    <Icon as={FaCalendar} color="text.secondary" />
                    <Box>
                      <Text fontSize="xs" color="text.secondary">
                        Quantity
                      </Text>
                      <Text fontWeight="medium">
                        {delivery.order?.quantity || 0} {delivery.product?.unit || "units"}
                      </Text>
                    </Box>
                  </HStack>
                </SimpleGrid>

                {delivery.failureReason && (
                  <Alert status="error" mt={4} borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Failure Reason:</AlertTitle>
                      <AlertDescription fontSize="sm">
                        {delivery.failureReason}
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}

      {/* Failure Reason Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Mark Delivery as Failed</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Delivery</FormLabel>
                <Input
                  value={selectedDelivery?.destination?.name || ""}
                  isReadOnly
                  bg="gray.50"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Failure Reason</FormLabel>
                <Textarea
                  placeholder="Please provide the reason for failure..."
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleFailDelivery}
              isDisabled={!failureReason.trim()}
            >
              Mark as Failed
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

