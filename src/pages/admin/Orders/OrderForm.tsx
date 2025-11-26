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
  Alert,
  AlertIcon,
  AlertDescription,
  Link,
} from "@chakra-ui/react";
import { MdSave, MdCancel } from "react-icons/md";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  createOrder,
  updateOrder,
  getOrder,
  getDrivers,
  getVehicles,
  getTerminals,
  getHubs,
  getDriverVehicleAllocation,
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
  const [allocationWarning, setAllocationWarning] = useState<string>("");
  const [allocatedVehicleId, setAllocatedVehicleId] = useState<string>("");
  const [availableProducts, setAvailableProducts] = useState<Array<{ id: string; name: string; availableQty: number }>>([]);
  const [maxQuantity, setMaxQuantity] = useState<number>(0);
  const [showNoVehicleWarning, setShowNoVehicleWarning] = useState<boolean>(false);
  
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
      const [driversData, vehiclesData, terminalsData, hubsData] = await Promise.all([
        getDrivers(),
        getVehicles(),
        getTerminals(),
        getHubs(),
      ]);

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

  const handleInputChange = async (field: string, value: string | number) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Update available products when destination changes
    if (field === 'destinationId') {
      updateAvailableProductsMemo(value as string);
      // Reset product and quantity when destination changes
      setFormData(prev => ({ ...prev, productId: "", quantity: 0 }));
      setMaxQuantity(0);
    }
    
    // Update max quantity when product changes
    if (field === 'productId' && value) {
      const selectedProduct = availableProducts.find(p => p.id === value);
      setMaxQuantity(selectedProduct?.availableQty || 0);
    }
    
    // Check vehicle allocation when driver or delivery date changes
    if ((field === 'assignedDriverId' || field === 'deliveryDate') && newFormData.assignedDriverId && newFormData.deliveryDate) {
      await checkDriverVehicleAllocation(newFormData.assignedDriverId, newFormData.deliveryDate);
    } else if (field === 'assignedDriverId' && !value) {
      // Clear warning if driver is unassigned
      setAllocationWarning("");
      setAllocatedVehicleId("");
      setShowNoVehicleWarning(false);
    }
    
    // Clear warnings if delivery date is cleared
    if (field === 'deliveryDate' && !value) {
      setAllocationWarning("");
      setAllocatedVehicleId("");
      setShowNoVehicleWarning(false);
      // Also clear driver selection if date is removed
      setFormData(prev => ({ ...prev, assignedDriverId: "", vehicleId: "" }));
    }
  };
  
  const checkDriverVehicleAllocation = async (driverId: string, date: string) => {
    try {
      const allocation = await getDriverVehicleAllocation(driverId, date);
      
      if (allocation) {
        const vehicle = vehicles.find(v => v.id === allocation.vehicleId);
        setAllocationWarning("");
        setAllocatedVehicleId(allocation.vehicleId);
        setShowNoVehicleWarning(false);
        
        // Auto-populate vehicle field
        setFormData(prev => ({ ...prev, vehicleId: allocation.vehicleId }));
        
        toast({
          title: "Vehicle allocation found",
          description: `Driver has ${vehicle?.registration || 'a vehicle'} allocated on this date. A shift will be created automatically.`,
          status: "success",
          duration: 4000,
          isClosable: true,
        });
      } else {
        const driver = drivers.find(d => d.id === driverId);
        setAllocationWarning(`${driver?.name || 'This driver'} does not have a vehicle allocated on ${new Date(date).toLocaleDateString()}.`);
        setAllocatedVehicleId("");
        setShowNoVehicleWarning(true);
      }
    } catch (error) {
      console.error("Error checking vehicle allocation:", error);
    }
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

    if (availableProducts.length === 0) {
      toast({
        title: "Validation Error",
        description: "The selected destination has no products available. Please choose a different destination.",
        status: "error",
        duration: 4000,
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

    if (maxQuantity > 0 && formData.quantity > maxQuantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${maxQuantity.toLocaleString()} units available at this location. Please reduce the order quantity.`,
        status: "error",
        duration: 5000,
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

    // Check if delivery date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (formData.deliveryDate < today) {
      toast({
        title: "Invalid Date",
        description: "Delivery date cannot be in the past. Please select today or a future date.",
        status: "error",
        duration: 4000,
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
  
  // Memoize the update function to avoid unnecessary re-renders
  const updateAvailableProductsMemo = useCallback((destinationId: string) => {
    if (!destinationId) {
      setAvailableProducts([]);
      return;
    }
    
    // Find the selected destination (hub or terminal)
    const destination = allDestinations.find(d => d.id === destinationId);
    
    if (destination && destination.products && destination.products.length > 0) {
      const productsWithQty = destination.products.map((p) => ({
        id: p.productId,
        name: p.productName,
        availableQty: p.quantity,
      }));
      setAvailableProducts(productsWithQty);
    } else {
      setAvailableProducts([]);
    }
  }, [terminals, hubs]);
  
  // Update available products when destinations load or formData.destinationId is set
  useEffect(() => {
    if (formData.destinationId && (terminals.length > 0 || hubs.length > 0)) {
      updateAvailableProductsMemo(formData.destinationId);
    }
  }, [formData.destinationId, terminals, hubs, updateAvailableProductsMemo]);

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
                  <FormLabel color="text.primary">
                    Product
                    {!formData.destinationId && (
                      <Text as="span" fontSize="xs" color="orange.500" ml={2}>
                        (Select destination first)
                      </Text>
                    )}
                  </FormLabel>
                  <Select
                    placeholder={
                      !formData.destinationId 
                        ? "Select destination first" 
                        : availableProducts.length === 0 
                          ? "No products available at this location"
                          : "Select product"
                    }
                    value={formData.productId}
                    onChange={(e) => handleInputChange("productId", e.target.value)}
                    bg="bg.surface"
                    borderColor="border.default"
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                    isDisabled={!formData.destinationId || availableProducts.length === 0}
                  >
                    {availableProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Available: {product.availableQty.toLocaleString()})
                      </option>
                    ))}
                  </Select>
                  {availableProducts.length === 0 && formData.destinationId && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      ⚠️ No products available at selected destination
                    </Text>
                  )}
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="text.primary">
                    Quantity
                    {maxQuantity > 0 && (
                      <Badge ml={2} colorScheme={formData.quantity > maxQuantity ? "red" : "blue"}>
                        Max: {maxQuantity.toLocaleString()}
                      </Badge>
                    )}
                  </FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    value={formData.quantity || ""}
                    onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 0)}
                    bg="bg.surface"
                    borderColor={formData.quantity > maxQuantity && maxQuantity > 0 ? "red.400" : "border.default"}
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                    color="text.primary"
                    _dark={{
                      color: "white",
                      bg: "whiteAlpha.100",
                      borderColor: formData.quantity > maxQuantity && maxQuantity > 0 ? "red.400" : "whiteAlpha.300",
                      _hover: {
                        borderColor: "purple.400"
                      },
                      _focus: {
                        borderColor: "purple.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)"
                      }
                    }}
                    min={0}
                    max={maxQuantity > 0 ? maxQuantity : undefined}
                  />
                  {formData.quantity > maxQuantity && maxQuantity > 0 && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      ⚠️ Quantity exceeds available stock ({maxQuantity.toLocaleString()} units)
                    </Text>
                  )}
                  {formData.productId && maxQuantity > 0 && formData.quantity <= maxQuantity && formData.quantity > 0 && (
                    <Text fontSize="xs" color="green.600" mt={1}>
                      ✓ {(maxQuantity - formData.quantity).toLocaleString()} units will remain after this order
                    </Text>
                  )}
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="text.primary">Delivery Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    bg="bg.surface"
                    borderColor="border.default"
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                    color="text.primary"
                    _dark={{
                      color: "white",
                      bg: "whiteAlpha.100",
                      borderColor: "whiteAlpha.300",
                      _hover: {
                        borderColor: "purple.400"
                      },
                      _focus: {
                        borderColor: "purple.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)"
                      }
                    }}
                    sx={{
                      colorScheme: "light",
                      _dark: {
                        colorScheme: "dark",
                        "&::-webkit-calendar-picker-indicator": {
                          filter: "brightness(0) invert(1)",
                          cursor: "pointer",
                          opacity: 0.9
                        },
                        "&::-webkit-datetime-edit": {
                          color: "white"
                        },
                        "&::-webkit-datetime-edit-fields-wrapper": {
                          color: "white"
                        },
                        "&::-webkit-datetime-edit-text": {
                          color: "whiteAlpha.700"
                        },
                        "&::-webkit-datetime-edit-month-field": {
                          color: "white"
                        },
                        "&::-webkit-datetime-edit-day-field": {
                          color: "white"
                        },
                        "&::-webkit-datetime-edit-year-field": {
                          color: "white"
                        }
                      }
                    }}
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
              
              {showNoVehicleWarning && allocationWarning && (
                <Alert status="warning" mb={4} borderRadius="md" display={"flex"} alignItems={"center"}>
                  <AlertIcon />
                  <Box flex="1">
                    <AlertDescription fontSize="sm">
                      {allocationWarning}
                    </AlertDescription>
                    <AlertDescription fontSize="sm" mt={2}>
                      <Link 
                        as={RouterLink} 
                        to="/admin/vehicle-allocation" 
                        color="blue.500" 
                        fontWeight="semibold"
                        textDecoration="underline"
                        _hover={{ color: "blue.600" }}
                        marginLeft={"4px"}
                      >
                        Go to Vehicle Allocation
                      </Link>
                      {" "}to assign a vehicle, or the shift will not be created.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel color="text.primary">
                    Assign Driver
                    {!formData.deliveryDate && (
                      <Text as="span" fontSize="xs" color="orange.500" ml={2}>
                        (Select delivery date first)
                      </Text>
                    )}
                  </FormLabel>
                  <Select
                    placeholder={!formData.deliveryDate ? "Select delivery date first" : "Select driver (optional)"}
                    value={formData.assignedDriverId}
                    onChange={(e) => handleInputChange("assignedDriverId", e.target.value)}
                    bg="bg.surface"
                    borderColor="border.default"
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                    isDisabled={!formData.deliveryDate}
                  >
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} - {driver.license}
                      </option>
                    ))}
                  </Select>
                  {!formData.deliveryDate && (
                    <Text fontSize="xs" color="orange.500" mt={1}>
                      Please select a delivery date to assign a driver
                    </Text>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel color="text.primary">
                    Vehicle {allocatedVehicleId && <Badge ml={2} colorScheme="green">Auto-assigned</Badge>}
                  </FormLabel>
                  <Select
                    placeholder="Select vehicle (optional)"
                    value={formData.vehicleId}
                    onChange={(e) => handleInputChange("vehicleId", e.target.value)}
                    bg="bg.surface"
                    borderColor="border.default"
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
                    isDisabled={!!allocatedVehicleId}
                  >
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.registration} - {vehicle.type}
                      </option>
                    ))}
                  </Select>
                  {allocatedVehicleId && (
                    <Text fontSize="xs" color="green.600" mt={1}>
                      Vehicle automatically assigned based on driver allocation
                    </Text>
                  )}
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

