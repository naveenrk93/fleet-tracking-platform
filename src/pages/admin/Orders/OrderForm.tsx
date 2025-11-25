import { 
  Box, 
  Heading, 
  VStack, 
  Button, 
  HStack, 
  FormControl, 
  FormLabel, 
  Input, 
  Select, 
  useToast,
  Spinner,
  Text,
  SimpleGrid,
  Divider,
  Badge,
} from "@chakra-ui/react";
import { MdSave, MdCancel } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  createOrder,
  updateOrder,
  getOrder,
  getProducts,
  getDrivers,
  getVehicles,
  getTerminals,
  getHubs,
  type Order,
  type Product,
  type Driver,
  type Vehicle,
  type Terminal,
  type Hub,
} from "../../../services/api";

export const OrderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    destinationId: "",
    productId: "",
    quantity: 0,
    deliveryDate: "",
    assignedDriverId: "",
    vehicleId: "",
    status: "pending",
  });

  // Master data lists
  const [products, setProducts] = useState<Product[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);

  // Load master data and existing order (if editing)
  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all master data
      const [productsData, driversData, vehiclesData, terminalsData, hubsData] = await Promise.all([
        getProducts(),
        getDrivers(),
        getVehicles(),
        getTerminals(),
        getHubs(),
      ]);

      setProducts(productsData);
      setDrivers(driversData);
      setVehicles(vehiclesData);
      setTerminals(terminalsData);
      setHubs(hubsData);

      // If editing, load the order data
      if (isEditMode && id) {
        const orderData = await getOrder(id);
        setFormData({
          destinationId: orderData.destinationId,
          productId: orderData.productId,
          quantity: orderData.quantity,
          deliveryDate: orderData.deliveryDate,
          assignedDriverId: orderData.assignedDriverId || "",
          vehicleId: orderData.vehicleId || "",
          status: orderData.status,
        });
      } else {
        // Set default date to today for new orders
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, deliveryDate: today }));
      }
    } catch (error) {
      toast({
        title: "Error loading data",
        description: error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.destinationId) {
      toast({
        title: "Validation Error",
        description: "Please select a destination",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!formData.productId) {
      toast({
        title: "Validation Error",
        description: "Please select a product",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (formData.quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid quantity",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!formData.deliveryDate) {
      toast({
        title: "Validation Error",
        description: "Please select a delivery date",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      if (isEditMode && id) {
        await updateOrder(id, formData);
        toast({
          title: "Order updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        const newOrder = {
          ...formData,
          id: `order-${Date.now()}`,
        };
        await createOrder(newOrder);
        toast({
          title: "Order created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      navigate("/admin/orders");
    } catch (error) {
      toast({
        title: isEditMode ? "Error updating order" : "Error creating order",
        description: error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
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

  // Get all destinations (terminals + hubs)
  const allDestinations = [
    ...terminals.map(t => ({ ...t, type: 'Terminal' as const })),
    ...hubs.map(h => ({ ...h, type: 'Hub' as const })),
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" color="purple.500" />
      </Box>
    );
  }

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Page Header */}
        <HStack justify="space-between">
          <Heading size="lg" color="text.primary">
            {isEditMode ? "Edit Order" : "Create New Order"}
          </Heading>
          <HStack>
            <Button
              variant="outline"
              leftIcon={<MdCancel />}
              onClick={() => navigate("/admin/orders")}
              isDisabled={saving}
            >
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              leftIcon={<MdSave />}
              onClick={handleSave}
              isLoading={saving}
              loadingText="Saving..."
            >
              {isEditMode ? "Update Order" : "Create Order"}
            </Button>
          </HStack>
        </HStack>

        {/* Form */}
        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={6}
        >
          <VStack spacing={6} align="stretch">
            {/* Order Details Section */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" color="text.primary" mb={4}>
                Order Details
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel color="text.primary">Destination</FormLabel>
                  <Select
                    placeholder="Select destination"
                    value={formData.destinationId}
                    onChange={(e) => handleInputChange("destinationId", e.target.value)}
                    bg="bg.surface"
                    borderColor="border.default"
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                  >
                    {allDestinations.map((dest) => (
                      <option key={dest.id} value={dest.id}>
                        {dest.name} ({dest.type})
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="text.primary">Product</FormLabel>
                  <Select
                    placeholder="Select product"
                    value={formData.productId}
                    onChange={(e) => handleInputChange("productId", e.target.value)}
                    bg="bg.surface"
                    borderColor="border.default"
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                  >
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.sku}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="text.primary">Quantity</FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    value={formData.quantity || ""}
                    onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 0)}
                    bg="bg.surface"
                    borderColor="border.default"
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="text.primary">Delivery Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
                    bg="bg.surface"
                    borderColor="border.default"
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                  />
                </FormControl>
              </SimpleGrid>
            </Box>

            <Divider borderColor="border.default" />

            {/* Assignment Section */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" color="text.primary" mb={4}>
                Assignment (Optional)
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel color="text.primary">Assign Driver</FormLabel>
                  <Select
                    placeholder="Select driver (optional)"
                    value={formData.assignedDriverId}
                    onChange={(e) => handleInputChange("assignedDriverId", e.target.value)}
                    bg="bg.surface"
                    borderColor="border.default"
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                  >
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} - {driver.license}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color="text.primary">Assign Vehicle</FormLabel>
                  <Select
                    placeholder="Select vehicle (optional)"
                    value={formData.vehicleId}
                    onChange={(e) => handleInputChange("vehicleId", e.target.value)}
                    bg="bg.surface"
                    borderColor="border.default"
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                  >
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.registration} - {vehicle.type}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
            </Box>

            <Divider borderColor="border.default" />

            {/* Status Section */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" color="text.primary" mb={4}>
                Order Status
              </Text>
              <FormControl>
                <FormLabel color="text.primary">Status</FormLabel>
                <HStack spacing={4}>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    bg="bg.surface"
                    borderColor="border.default"
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                    maxW="300px"
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                  <Badge colorScheme={getStatusColor(formData.status)} fontSize="md" px={3} py={1}>
                    {formData.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </HStack>
              </FormControl>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

