import { 
  Box, 
  Heading, 
  VStack, 
  Button, 
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Text,
  Badge,
  IconButton,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from "@chakra-ui/react";
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdSearch } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  getOrders, 
  deleteOrder, 
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

export const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [drivers, setDrivers] = useState<Record<string, Driver>>({});
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [destinations, setDestinations] = useState<Record<string, Terminal | Hub>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const toast = useToast();

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all related data
      const [ordersData, productsData, driversData, vehiclesData, terminalsData, hubsData] = await Promise.all([
        getOrders(),
        getProducts(),
        getDrivers(),
        getVehicles(),
        getTerminals(),
        getHubs(),
      ]);

      // Create lookup maps
      const productsMap = productsData.reduce((acc: Record<string, Product>, p: Product) => ({ ...acc, [p.id]: p }), {} as Record<string, Product>);
      const driversMap = driversData.reduce((acc: Record<string, Driver>, d: Driver) => ({ ...acc, [d.id]: d }), {} as Record<string, Driver>);
      const vehiclesMap = vehiclesData.reduce((acc: Record<string, Vehicle>, v: Vehicle) => ({ ...acc, [v.id]: v }), {} as Record<string, Vehicle>);
      const destinationsMap = {
        ...terminalsData.reduce((acc: Record<string, Terminal>, t: Terminal) => ({ ...acc, [t.id]: t }), {} as Record<string, Terminal>),
        ...hubsData.reduce((acc: Record<string, Hub>, h: Hub) => ({ ...acc, [h.id]: h }), {} as Record<string, Hub>),
      };

      setOrders(ordersData);
      setProducts(productsMap);
      setDrivers(driversMap);
      setVehicles(vehiclesMap);
      setDestinations(destinationsMap);
    } catch (error) {
      toast({
        title: "Error fetching orders",
        description: error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(id);
        toast({
          title: "Order deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchAllData();
      } catch (error) {
        toast({
          title: "Error deleting order",
          description: error instanceof Error ? error.message : "An error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
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

  // Filter orders based on search query and status filter
  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const productName = products[order.productId]?.name || "";
    const destinationName = destinations[order.destinationId]?.name || "";
    const driverName = drivers[order.assignedDriverId]?.name || "";
    const vehicleReg = vehicles[order.vehicleId]?.registration || "";
    
    const matchesSearch = (
      order.id.toLowerCase().includes(query) ||
      productName.toLowerCase().includes(query) ||
      destinationName.toLowerCase().includes(query) ||
      driverName.toLowerCase().includes(query) ||
      vehicleReg.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query) ||
      order.quantity.toString().includes(query)
    );

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Page Header */}
        <HStack justify="space-between">
          <Heading size="lg" color="text.primary">
            Orders Management
          </Heading>
          <Button
            colorScheme="purple"
            leftIcon={<MdAdd />}
            size="md"
            onClick={() => navigate("/admin/orders/new")}
          >
            Create Order
          </Button>
        </HStack>

        {/* Search Bar and Filters */}
        <HStack spacing={4} justifyContent="space-between">
          <InputGroup flex={1} maxW="600px" minW="300px">
            <InputLeftElement pointerEvents="none">
              <MdSearch color="gray" size="20px" />
            </InputLeftElement>
            <Input
              placeholder="Search orders by ID, product, destination, driver, vehicle, status, or quantity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="bg.card"
              borderColor="border.default"
              _hover={{ borderColor: "purple.400" }}
              _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
            />
          </InputGroup>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            bg="bg.card"
            borderColor="border.default"
            _hover={{ borderColor: "purple.400" }}
            _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
            width="200px"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </HStack>

        {/* Content */}
        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={6}
          minH="400px"
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="300px">
              <Spinner size="xl" color="purple.500" />
            </Box>
          ) : filteredOrders.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="300px">
              <Text color="text.secondary">
                {searchQuery ? "No orders found matching your search." : "No orders found. Create your first order!"}
              </Text>
            </Box>
          ) : (
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color="text.secondary">Order ID</Th>
                    <Th color="text.secondary">Product</Th>
                    <Th color="text.secondary">Quantity</Th>
                    <Th color="text.secondary">Destination</Th>
                    <Th color="text.secondary">Driver</Th>
                    <Th color="text.secondary">Vehicle</Th>
                    <Th color="text.secondary">Delivery Date</Th>
                    <Th color="text.secondary">Status</Th>
                    <Th color="text.secondary">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredOrders.map((order) => (
                    <Tr key={order.id}>
                      <Td color="text.primary" fontWeight="medium">{order.id}</Td>
                      <Td color="text.primary">{products[order.productId]?.name || "N/A"}</Td>
                      <Td color="text.primary">{order.quantity.toLocaleString()}</Td>
                      <Td color="text.primary">{destinations[order.destinationId]?.name || "N/A"}</Td>
                      <Td color="text.primary">{drivers[order.assignedDriverId]?.name || "Unassigned"}</Td>
                      <Td color="text.primary">{vehicles[order.vehicleId]?.registration || "N/A"}</Td>
                      <Td color="text.primary">{new Date(order.deliveryDate).toLocaleDateString()}</Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="View order"
                            icon={<MdVisibility size={"20px"}/>}
                            size="md"
                            colorScheme="green"
                            variant="ghost"
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                          />
                          <IconButton
                            aria-label="Edit order"
                            icon={<MdEdit size={"20px"}/>}
                            size="md"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => navigate(`/admin/orders/edit/${order.id}`)}
                          />
                          <IconButton
                            aria-label="Delete order"
                            icon={<MdDelete size={"20px"}/>}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDelete(order.id)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

