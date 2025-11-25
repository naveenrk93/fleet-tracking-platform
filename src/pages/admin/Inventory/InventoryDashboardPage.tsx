import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Heading,
  VStack,
  Grid,
  GridItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Text,
  Spinner,
  Center,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { MdInventory, MdWarning, MdLocalShipping, MdSearch, MdRemoveCircleOutline } from "react-icons/md";
import { StatCard } from "../../../components/dashboard/StatCard";
import { getHubs, getTerminals, Hub, Terminal } from "../../../services/api";

// Define low stock threshold
const LOW_STOCK_THRESHOLD = 1000;
const CRITICAL_STOCK_THRESHOLD = 500;

interface InventoryItem {
  locationId: string;
  locationName: string;
  locationType: "hub" | "terminal";
  address: string;
  productId: string;
  productName: string;
  quantity: number;
}

export const InventoryDashboardPage = () => {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "hub" | "terminal">("all");
  const [filterStockStatus, setFilterStockStatus] = useState<"all" | "low" | "critical" | "normal" | "empty">("all");

  const tableBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const alertBorderColor = useColorModeValue("red.500", "red.400");
  const lowStockBorderColor = useColorModeValue("orange.400", "orange.300");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hubsData, terminalsData] = await Promise.all([
        getHubs(),
        getTerminals(),
      ]);
      setHubs(hubsData);
      setTerminals(terminalsData);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Transform data into inventory items
  const inventoryItems = useMemo(() => {
    const items: InventoryItem[] = [];

    hubs.forEach((hub) => {
      if (hub.products && hub.products.length > 0) {
        hub.products.forEach((product) => {
          items.push({
            locationId: hub.id,
            locationName: hub.name,
            locationType: "hub",
            address: hub.address,
            productId: product.productId,
            productName: product.productName,
            quantity: product.quantity,
          });
        });
      } else {
        // Show location with no products
        items.push({
          locationId: hub.id,
          locationName: hub.name,
          locationType: "hub",
          address: hub.address,
          productId: "",
          productName: "No products",
          quantity: 0,
        });
      }
    });

    terminals.forEach((terminal) => {
      if (terminal.products && terminal.products.length > 0) {
        terminal.products.forEach((product) => {
          items.push({
            locationId: terminal.id,
            locationName: terminal.name,
            locationType: "terminal",
            address: terminal.address,
            productId: product.productId,
            productName: product.productName,
            quantity: product.quantity,
          });
        });
      } else {
        // Show location with no products
        items.push({
          locationId: terminal.id,
          locationName: terminal.name,
          locationType: "terminal",
          address: terminal.address,
          productId: "",
          productName: "No products",
          quantity: 0,
        });
      }
    });

    return items;
  }, [hubs, terminals]);

  // Filter and search
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      // Type filter
      if (filterType !== "all" && item.locationType !== filterType) {
        return false;
      }

      // Stock status filter
      if (filterStockStatus !== "all") {
        if (filterStockStatus === "empty" && item.quantity !== 0) {
          return false;
        }
        if (filterStockStatus === "critical" && (item.quantity >= CRITICAL_STOCK_THRESHOLD || item.quantity === 0)) {
          return false;
        }
        if (filterStockStatus === "low" && (item.quantity >= LOW_STOCK_THRESHOLD || item.quantity < CRITICAL_STOCK_THRESHOLD || item.quantity === 0)) {
          return false;
        }
        if (filterStockStatus === "normal" && item.quantity < LOW_STOCK_THRESHOLD) {
          return false;
        }
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          item.locationName.toLowerCase().includes(search) ||
          item.productName.toLowerCase().includes(search) ||
          item.address.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [inventoryItems, searchTerm, filterType, filterStockStatus]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
    const emptyItems = inventoryItems.filter((item) => item.quantity === 0).length;
    const lowStockItems = inventoryItems.filter(
      (item) => item.quantity > 0 && item.quantity < LOW_STOCK_THRESHOLD && item.quantity >= CRITICAL_STOCK_THRESHOLD
    ).length;
    const criticalStockItems = inventoryItems.filter(
      (item) => item.quantity > 0 && item.quantity < CRITICAL_STOCK_THRESHOLD
    ).length;
    const normalStockItems = inventoryItems.filter(
      (item) => item.quantity >= LOW_STOCK_THRESHOLD
    ).length;

    return {
      totalItems,
      lowStockItems,
      normalStockItems,
      criticalStockItems,
      emptyItems,
    };
  }, [inventoryItems]);

  const getStockStatusBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge colorScheme="gray">Empty</Badge>;
    }
    if (quantity < CRITICAL_STOCK_THRESHOLD) {
      return <Badge colorScheme="red">Critical</Badge>;
    }
    if (quantity < LOW_STOCK_THRESHOLD) {
      return <Badge colorScheme="orange">Low Stock</Badge>;
    }
    return <Badge colorScheme="green">Normal</Badge>;
  };

  const getStockStatusColor = (quantity: number) => {
    if (quantity === 0) return "gray.400";
    if (quantity < CRITICAL_STOCK_THRESHOLD) return "red.500";
    if (quantity < LOW_STOCK_THRESHOLD) return "orange.500";
    return "green.500";
  };

  const getRowBorderStyle = (quantity: number) => {
    if (quantity === 0 || quantity < CRITICAL_STOCK_THRESHOLD) {
      return {
        borderLeft: "4px solid",
        borderLeftColor: alertBorderColor,
      };
    }
    if (quantity >= CRITICAL_STOCK_THRESHOLD && quantity < LOW_STOCK_THRESHOLD) {
      return {
        borderLeft: "4px solid",
        borderLeftColor: lowStockBorderColor,
      };
    }
    return {};
  };

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Page Title */}
        <Heading size="lg" color="text.primary">
          Inventory Dashboard
        </Heading>

        {/* Stats Grid */}
        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <StatCard
              title="Total Items"
              value={stats.totalItems.toLocaleString()}
              icon={MdInventory}
              color="blue.400"
              subtitle="In all locations"
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <StatCard
              title="Low Stock"
              value={stats.lowStockItems.toString()}
              icon={MdWarning}
              color="orange.400"
              subtitle="Needs attention"
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <StatCard
              title="Critical Stock"
              value={stats.criticalStockItems.toString()}
              icon={MdLocalShipping}
              color="red.400"
              subtitle="Urgent restock"
            />
          </GridItem>
          <GridItem colSpan={{ base: 12, md: 6, lg: 3 }}>
            <StatCard
              title="Empty Stock"
              value={stats.emptyItems.toString()}
              icon={MdRemoveCircleOutline}
              color="gray.400"
              subtitle="No products"
            />
          </GridItem>
        </Grid>

        {/* Filters and Search */}
        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={4}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={4}
            align={{ base: "stretch", md: "center" }}
          >
            <InputGroup flex={1}>
              <InputLeftElement pointerEvents="none">
                <MdSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by location, product, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Select
              w={{ base: "100%", md: "200px" }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">All Locations</option>
              <option value="hub">Hubs Only</option>
              <option value="terminal">Terminals Only</option>
            </Select>
            <Select
              w={{ base: "100%", md: "200px" }}
              value={filterStockStatus}
              onChange={(e) => setFilterStockStatus(e.target.value as any)}
            >
              <option value="all">All Stock Levels</option>
              <option value="normal">Normal Stock</option>
              <option value="low">Low Stock</option>
              <option value="critical">Critical Stock</option>
              <option value="empty">Empty Stock</option>
            </Select>
          </Flex>
        </Box>

        {/* Inventory Table */}
        <Box
          bg={tableBg}
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          overflow="hidden"
        >
          {loading ? (
            <Center p={10}>
              <Spinner size="xl" color="blue.500" />
            </Center>
          ) : filteredItems.length === 0 ? (
            <Center p={10}>
              <Text color="text.secondary">No inventory items found</Text>
            </Center>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg={headerBg}>
                  <Tr>
                    <Th>Location Name</Th>
                    <Th>Type</Th>
                    <Th>Address</Th>
                    <Th>Product</Th>
                    <Th isNumeric>Quantity</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredItems.map((item, index) => (
                    <Tr
                      key={`${item.locationId}-${item.productId}-${index}`}
                      {...getRowBorderStyle(item.quantity)}
                      _hover={{ bg: hoverBg }}
                      transition="all 0.2s"
                    >
                      <Td fontWeight="medium">{item.locationName}</Td>
                      <Td>
                        <Badge colorScheme={item.locationType === "hub" ? "blue" : "purple"}>
                          {item.locationType.toUpperCase()}
                        </Badge>
                      </Td>
                      <Td color="text.secondary" fontSize="sm">
                        {item.address}
                      </Td>
                      <Td>{item.productName}</Td>
                      <Td isNumeric>
                        <Text
                          fontWeight="bold"
                          color={getStockStatusColor(item.quantity)}
                        >
                          {item.quantity.toLocaleString()}
                        </Text>
                      </Td>
                      <Td>{getStockStatusBadge(item.quantity)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>

        {/* Results Count */}
        {!loading && (
          <Text color="text.secondary" fontSize="sm">
            Showing {filteredItems.length} of {inventoryItems.length} items
          </Text>
        )}
      </VStack>
    </Box>
  );
};

