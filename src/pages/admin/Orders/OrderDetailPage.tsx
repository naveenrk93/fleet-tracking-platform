import {
  Box,
  Heading,
  VStack,
  Button,
  HStack,
  Text,
  Spinner,
  useToast,
  SimpleGrid,
  Badge,
  Divider,
  Card,
  CardBody,
  Stack,
} from "@chakra-ui/react";
import { MdArrowBack, MdEdit } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getOrder,
  getProduct,
  getDriver,
  getVehicle,
  getTerminal,
  getHub,
  type Order,
  type Product,
  type Driver,
  type Vehicle,
  type Terminal,
  type Hub,
} from "../../../services/api";

export const OrderDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [destination, setDestination] = useState<Terminal | Hub | null>(null);

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  const loadOrderDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const orderData = await getOrder(id);
      setOrder(orderData);

      const [productData, driverData, vehicleData] = await Promise.all([
        getProduct(orderData.productId).catch(() => null),
        orderData.assignedDriverId ? getDriver(orderData.assignedDriverId).catch(() => null) : null,
        orderData.vehicleId ? getVehicle(orderData.vehicleId).catch(() => null) : null,
      ]);

      setProduct(productData);
      setDriver(driverData);
      setVehicle(vehicleData);

      try {
        const terminalData = await getTerminal(orderData.destinationId);
        setDestination(terminalData);
      } catch {
        try {
          const hubData = await getHub(orderData.destinationId);
          setDestination(hubData);
        } catch {
          setDestination(null);
        }
      }
    } catch (error) {
      toast({
        title: "Error loading order details",
        description: error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "blue";
      case "in_progress":
        return "yellow";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" color="purple.500" />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box>
        <Text color="text.secondary">Order not found</Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Page Header */}
        <HStack justify="space-between">
          <HStack>
            <Button
              variant="ghost"
              leftIcon={<MdArrowBack />}
              onClick={() => navigate("/admin/orders")}
            >
              Back
            </Button>
            <Heading size="lg" color="text.primary">
              Order Details
            </Heading>
          </HStack>
          <Button
            colorScheme="purple"
            leftIcon={<MdEdit />}
            onClick={() => navigate(`/admin/orders/edit/${id}`)}
          >
            Edit Order
          </Button>
        </HStack>

        {/* Order Information Cards */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Basic Information */}
          <Card
            bg="bg.card"
            borderRadius="lg"
            border="1px solid"
            borderColor="border.default"
          >
            <CardBody>
              <Stack spacing={4}>
                <Heading size="md" color="text.primary">
                  Basic Information
                </Heading>
                <Divider borderColor="border.default" />
                
                <HStack justify="space-between">
                  <Text color="text.secondary" fontWeight="medium">Order ID:</Text>
                  <Text color="text.primary" fontWeight="semibold">{order.id}</Text>
                </HStack>

                <HStack justify="space-between">
                  <Text color="text.secondary" fontWeight="medium">Status:</Text>
                  <Badge colorScheme={getStatusColor(order.status)} fontSize="md" px={3} py={1}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </HStack>

                <HStack justify="space-between">
                  <Text color="text.secondary" fontWeight="medium">Delivery Date:</Text>
                  <Text color="text.primary">{new Date(order.deliveryDate).toLocaleDateString()}</Text>
                </HStack>
              </Stack>
            </CardBody>
          </Card>

          {/* Product Information */}
          <Card
            bg="bg.card"
            borderRadius="lg"
            border="1px solid"
            borderColor="border.default"
          >
            <CardBody>
              <Stack spacing={4}>
                <Heading size="md" color="text.primary">
                  Product Information
                </Heading>
                <Divider borderColor="border.default" />
                
                <HStack justify="space-between">
                  <Text color="text.secondary" fontWeight="medium">Product Name:</Text>
                  <Text color="text.primary">{product?.name || "N/A"}</Text>
                </HStack>

                <HStack justify="space-between">
                  <Text color="text.secondary" fontWeight="medium">SKU:</Text>
                  <Text color="text.primary">{product?.sku || "N/A"}</Text>
                </HStack>

                <HStack justify="space-between">
                  <Text color="text.secondary" fontWeight="medium">Category:</Text>
                  <Text color="text.primary">{product?.category || "N/A"}</Text>
                </HStack>

                <HStack justify="space-between">
                  <Text color="text.secondary" fontWeight="medium">Quantity:</Text>
                  <Text color="text.primary" fontWeight="bold" fontSize="lg">
                    {order.quantity.toLocaleString()} {product?.unit || ""}
                  </Text>
                </HStack>

                {product?.price && (
                  <HStack justify="space-between">
                    <Text color="text.secondary" fontWeight="medium">Total Value:</Text>
                    <Text color="purple.500" fontWeight="bold" fontSize="lg">
                      ${(product.price * order.quantity).toLocaleString()}
                    </Text>
                  </HStack>
                )}
              </Stack>
            </CardBody>
          </Card>

          {/* Destination Information */}
          <Card
            bg="bg.card"
            borderRadius="lg"
            border="1px solid"
            borderColor="border.default"
          >
            <CardBody>
              <Stack spacing={4}>
                <Heading size="md" color="text.primary">
                  Destination Information
                </Heading>
                <Divider borderColor="border.default" />
                
                <HStack justify="space-between">
                  <Text color="text.secondary" fontWeight="medium">Destination Type:</Text>
                  <Badge colorScheme="purple">{destination?.type || "N/A"}</Badge>
                </HStack>

                <HStack justify="space-between">
                  <Text color="text.secondary" fontWeight="medium">Name:</Text>
                  <Text color="text.primary">{destination?.name || "N/A"}</Text>
                </HStack>

                <VStack align="stretch" spacing={2}>
                  <Text color="text.secondary" fontWeight="medium">Address:</Text>
                  <Text color="text.primary">{destination?.address || "N/A"}</Text>
                </VStack>

                {destination?.coordinates && (
                  <VStack align="stretch" spacing={2}>
                    <Text color="text.secondary" fontWeight="medium">Coordinates:</Text>
                    <Text color="text.primary" fontSize="sm">
                      Lat: {destination.coordinates.lat}, Lng: {destination.coordinates.lng}
                    </Text>
                  </VStack>
                )}
              </Stack>
            </CardBody>
          </Card>

          {/* Assignment Information */}
          <Card
            bg="bg.card"
            borderRadius="lg"
            border="1px solid"
            borderColor="border.default"
          >
            <CardBody>
              <Stack spacing={4}>
                <Heading size="md" color="text.primary">
                  Assignment Information
                </Heading>
                <Divider borderColor="border.default" />
                
                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text color="text.secondary" fontWeight="medium" mb={1}>Assigned Driver:</Text>
                    {driver ? (
                      <VStack align="stretch" spacing={1} pl={4}>
                        <Text color="text.primary" fontWeight="semibold">{driver.name}</Text>
                        <Text color="text.secondary" fontSize="sm">License: {driver.license}</Text>
                        <Text color="text.secondary" fontSize="sm">Phone: {driver.phone}</Text>
                        {driver.email && (
                          <Text color="text.secondary" fontSize="sm">Email: {driver.email}</Text>
                        )}
                      </VStack>
                    ) : (
                      <Text color="text.secondary" pl={4}>Not assigned yet</Text>
                    )}
                  </Box>

                  <Divider borderColor="border.default" />

                  <Box>
                    <Text color="text.secondary" fontWeight="medium" mb={1}>Assigned Vehicle:</Text>
                    {vehicle ? (
                      <VStack align="stretch" spacing={1} pl={4}>
                        <Text color="text.primary" fontWeight="semibold">{vehicle.registration}</Text>
                        <Text color="text.secondary" fontSize="sm">Type: {vehicle.type}</Text>
                        <Text color="text.secondary" fontSize="sm">Capacity: {vehicle.capacity}</Text>
                      </VStack>
                    ) : (
                      <Text color="text.secondary" pl={4}>Not assigned yet</Text>
                    )}
                  </Box>
                </VStack>
              </Stack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

