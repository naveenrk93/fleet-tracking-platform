import { 
  Box, 
  VStack, 
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
  IconButton,
  useToast,
  useDisclosure,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdEdit, MdDelete, MdVisibility, MdArrowUpward, MdArrowDownward } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { SearchInput, PageHeader, StatusBadge, ConfirmDialog } from "../../../components";
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
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [drivers, setDrivers] = useState<Record<string, Driver>>({});
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [destinations, setDestinations] = useState<Record<string, Terminal | Hub>>({});
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"id" | "product" | "quantity" | "destination" | "driver" | "vehicle" | "deliveryDate" | "status">("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const toast = useToast();
  const selectTextColor = useColorModeValue("gray.800", "whiteAlpha.900");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [ordersData, productsData, driversData, vehiclesData, terminalsData, hubsData] = await Promise.all([
        getOrders(),
        getProducts(),
        getDrivers(),
        getVehicles(),
        getTerminals(),
        getHubs(),
      ]);

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
    setOrderToDelete(id);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    
    try {
      await deleteOrder(orderToDelete);
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
    } finally {
      setOrderToDelete(null);
    }
  };

  const handleSort = (field: "id" | "product" | "quantity" | "destination" | "driver" | "vehicle" | "deliveryDate" | "status") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };


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

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case "id":
        aValue = a.id.toLowerCase();
        bValue = b.id.toLowerCase();
        break;
      case "product":
        aValue = (products[a.productId]?.name || "").toLowerCase();
        bValue = (products[b.productId]?.name || "").toLowerCase();
        break;
      case "quantity":
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      case "destination":
        aValue = (destinations[a.destinationId]?.name || "").toLowerCase();
        bValue = (destinations[b.destinationId]?.name || "").toLowerCase();
        break;
      case "driver":
        aValue = (drivers[a.assignedDriverId]?.name || "").toLowerCase();
        bValue = (drivers[b.assignedDriverId]?.name || "").toLowerCase();
        break;
      case "vehicle":
        aValue = (vehicles[a.vehicleId]?.registration || "").toLowerCase();
        bValue = (vehicles[b.vehicleId]?.registration || "").toLowerCase();
        break;
      case "deliveryDate":
        aValue = new Date(a.deliveryDate).getTime();
        bValue = new Date(b.deliveryDate).getTime();
        break;
      case "status":
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      default:
        aValue = a.id.toLowerCase();
        bValue = b.id.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <PageHeader 
          title="Orders Management" 
          actionLabel="Create Order"
          onActionClick={() => navigate("/admin/orders/new")}
        />

        {/* Search Bar and Filters */}
        <HStack spacing={4} justifyContent="space-between">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search orders by ID, product, destination, driver, vehicle, status, or quantity..."
            flex={1}
            maxW="600px"
            minW="300px"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            bg="bg.card"
            borderColor="border.default"
            color={selectTextColor}
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
          ) : sortedOrders.length === 0 ? (
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
                    <Th 
                      color="text.secondary" 
                      cursor="pointer" 
                      onClick={() => handleSort("id")}
                      _hover={{ color: "purple.400" }}
                    >
                      <HStack spacing={1}>
                        <Text>Order ID</Text>
                        {sortField === "id" && (
                          sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                        )}
                      </HStack>
                    </Th>
                    <Th 
                      color="text.secondary" 
                      cursor="pointer" 
                      onClick={() => handleSort("product")}
                      _hover={{ color: "purple.400" }}
                    >
                      <HStack spacing={1}>
                        <Text>Product</Text>
                        {sortField === "product" && (
                          sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                        )}
                      </HStack>
                    </Th>
                    <Th 
                      color="text.secondary" 
                      cursor="pointer" 
                      onClick={() => handleSort("quantity")}
                      _hover={{ color: "purple.400" }}
                    >
                      <HStack spacing={1}>
                        <Text>Quantity</Text>
                        {sortField === "quantity" && (
                          sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                        )}
                      </HStack>
                    </Th>
                    <Th 
                      color="text.secondary" 
                      cursor="pointer" 
                      onClick={() => handleSort("destination")}
                      _hover={{ color: "purple.400" }}
                    >
                      <HStack spacing={1}>
                        <Text>Destination</Text>
                        {sortField === "destination" && (
                          sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                        )}
                      </HStack>
                    </Th>
                    <Th 
                      color="text.secondary" 
                      cursor="pointer" 
                      onClick={() => handleSort("driver")}
                      _hover={{ color: "purple.400" }}
                    >
                      <HStack spacing={1}>
                        <Text>Driver</Text>
                        {sortField === "driver" && (
                          sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                        )}
                      </HStack>
                    </Th>
                    <Th 
                      color="text.secondary" 
                      cursor="pointer" 
                      onClick={() => handleSort("vehicle")}
                      _hover={{ color: "purple.400" }}
                    >
                      <HStack spacing={1}>
                        <Text>Vehicle</Text>
                        {sortField === "vehicle" && (
                          sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                        )}
                      </HStack>
                    </Th>
                    <Th 
                      color="text.secondary" 
                      cursor="pointer" 
                      onClick={() => handleSort("deliveryDate")}
                      _hover={{ color: "purple.400" }}
                    >
                      <HStack spacing={1}>
                        <Text>Delivery Date</Text>
                        {sortField === "deliveryDate" && (
                          sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                        )}
                      </HStack>
                    </Th>
                    <Th 
                      color="text.secondary" 
                      cursor="pointer" 
                      onClick={() => handleSort("status")}
                      _hover={{ color: "purple.400" }}
                    >
                      <HStack spacing={1}>
                        <Text>Status</Text>
                        {sortField === "status" && (
                          sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                        )}
                      </HStack>
                    </Th>
                    <Th color="text.secondary">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedOrders.map((order) => (
                    <Tr key={order.id}>
                      <Td color="text.primary" fontWeight="medium">{order.id}</Td>
                      <Td color="text.primary">{products[order.productId]?.name || "N/A"}</Td>
                      <Td color="text.primary">{order.quantity.toLocaleString()}</Td>
                      <Td color="text.primary">{destinations[order.destinationId]?.name || "N/A"}</Td>
                      <Td color="text.primary">{drivers[order.assignedDriverId]?.name || "Unassigned"}</Td>
                      <Td color="text.primary">{vehicles[order.vehicleId]?.registration || "N/A"}</Td>
                      <Td color="text.primary">{new Date(order.deliveryDate).toLocaleDateString()}</Td>
                      <Td>
                        <StatusBadge status={order.status} />
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

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmLabel="Delete"
        confirmColorScheme="red"
      />
    </Box>
  );
};

