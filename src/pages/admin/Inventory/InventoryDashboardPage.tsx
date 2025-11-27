import { useState, useEffect, useMemo, useRef } from "react";
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
  Skeleton,
} from "@chakra-ui/react";
import { MdInventory, MdWarning, MdLocalShipping, MdSearch, MdRemoveCircleOutline, MdArrowUpward, MdArrowDownward } from "react-icons/md";
import { useVirtualizer } from '@tanstack/react-virtual';
import { StatCard } from "../../../components/dashboard/StatCard";
import { getHubs, getTerminals, Hub, Terminal } from "../../../services/api";

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
  const [sortField, setSortField] = useState<"locationName" | "locationType" | "product" | "quantity" | "status">("locationName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isScrolling, setIsScrolling] = useState(false);

  const tableBg = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const alertBorderColor = useColorModeValue("red.500", "red.400");
  const lowStockBorderColor = useColorModeValue("orange.400", "orange.300");
  const inputTextColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const selectTextColor = useColorModeValue("gray.800", "whiteAlpha.900");

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolling(true);
      
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
      }, 150); // Show skeletons for 150ms after scroll stops
    };

    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
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

  const handleSort = (field: "locationName" | "locationType" | "product" | "quantity" | "status") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusValue = (quantity: number): string => {
    if (quantity === 0) return "empty";
    if (quantity < CRITICAL_STOCK_THRESHOLD) return "critical";
    if (quantity < LOW_STOCK_THRESHOLD) return "low";
    return "normal";
  };

  const inventoryItems = useMemo(() => {
    const items: InventoryItem[] = [];

    hubs.forEach((hub) => {
      if (hub.products && hub.products.length > 0) {
        hub.products.forEach((product) => {
          items.push({
            locationId: hub.id || "",
            locationName: hub.name || "Unknown Hub",
            locationType: "hub",
            address: hub.address || "No address",
            productId: product.productId || "",
            productName: product.productName || "Unknown Product",
            quantity: product.quantity || 0,
          });
        });
      } else {
        items.push({
          locationId: hub.id || "",
          locationName: hub.name || "Unknown Hub",
          locationType: "hub",
          address: hub.address || "No address",
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
            locationId: terminal.id || "",
            locationName: terminal.name || "Unknown Terminal",
            locationType: "terminal",
            address: terminal.address || "No address",
            productId: product.productId || "",
            productName: product.productName || "Unknown Product",
            quantity: product.quantity || 0,
          });
        });
      } else {
        items.push({
          locationId: terminal.id || "",
          locationName: terminal.name || "Unknown Terminal",
          locationType: "terminal",
          address: terminal.address || "No address",
          productId: "",
          productName: "No products",
          quantity: 0,
        });
      }
    });

    return items;
  }, [hubs, terminals]);

  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      if (filterType !== "all" && item.locationType !== filterType) {
        return false;
      }

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

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          (item.locationName || "").toLowerCase().includes(search) ||
          (item.productName || "").toLowerCase().includes(search) ||
          (item.address || "").toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [inventoryItems, searchTerm, filterType, filterStockStatus]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "locationName":
          aValue = a.locationName.toLowerCase();
          bValue = b.locationName.toLowerCase();
          break;
        case "locationType":
          aValue = a.locationType.toLowerCase();
          bValue = b.locationType.toLowerCase();
          break;
        case "product":
          aValue = a.productName.toLowerCase();
          bValue = b.productName.toLowerCase();
          break;
        case "quantity":
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case "status":
          aValue = getStatusValue(a.quantity);
          bValue = getStatusValue(b.quantity);
          break;
        default:
          aValue = a.locationName.toLowerCase();
          bValue = b.locationName.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortField, sortDirection]);

  const rowVirtualizer = useVirtualizer({
    count: sortedItems.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 53, // Estimated row height in pixels
    overscan: 5,
  });

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
            justifyContent="space-between"
          >
            <InputGroup flex={1} maxW="600px">
              <InputLeftElement pointerEvents="none">
                <MdSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by location, product, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                color={inputTextColor}
              />
            </InputGroup>
            <Flex gap={4} direction={{ base: "column", md: "row" }}>
              <Select
                w={{ base: "100%", md: "200px" }}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                color={selectTextColor}
              >
                <option value="all">All Locations</option>
                <option value="hub">Hubs Only</option>
                <option value="terminal">Terminals Only</option>
              </Select>
              <Select
                w={{ base: "100%", md: "200px" }}
                value={filterStockStatus}
                onChange={(e) => setFilterStockStatus(e.target.value as any)}
                color={selectTextColor}
              >
                <option value="all">All Stock Levels</option>
                <option value="normal">Normal Stock</option>
                <option value="low">Low Stock</option>
                <option value="critical">Critical Stock</option>
                <option value="empty">Empty Stock</option>
              </Select>
            </Flex>
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
          ) : sortedItems.length === 0 ? (
            <Center p={10}>
              <Text color="text.secondary">No inventory items found</Text>
            </Center>
          ) : (
            <Box 
              ref={tableContainerRef}
              overflowY="auto"
              overflowX="auto"
              maxH="600px"
              position="relative"
            >
              <Table variant="simple" style={{ tableLayout: 'fixed' }} w="100%">
                <Thead 
                  position="sticky" 
                  top={0} 
                  bg={tableBg} 
                  zIndex={1}
                >
                  <Tr>
                    <Th 
                      width="18%"
                      cursor="pointer" 
                      onClick={() => handleSort("locationName")}
                      _hover={{ color: "purple.400" }}
                    >
                      <Flex align="center" gap={1}>
                        <Text>Location Name</Text>
                        {sortField === "locationName" && (
                          sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                        )}
                      </Flex>
                    </Th>
                    <Th 
                      width="10%"
                      cursor="pointer" 
                      onClick={() => handleSort("locationType")}
                      _hover={{ color: "purple.400" }}
                    >
                      <Flex align="center" gap={1}>
                        <Text>Type</Text>
                        {sortField === "locationType" && (
                          sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                        )}
                      </Flex>
                    </Th>
                    <Th width="25%">Address</Th>
                    <Th 
                      width="17%"
                      cursor="pointer" 
                      onClick={() => handleSort("product")}
                      _hover={{ color: "purple.400" }}
                    >
                      <Flex align="center" gap={1}>
                        <Text>Product</Text>
                        {sortField === "product" && (
                          sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                        )}
                      </Flex>
                    </Th>
                    <Th 
                      width="15%"
                      isNumeric 
                      cursor="pointer" 
                      onClick={() => handleSort("quantity")}
                      _hover={{ color: "purple.400" }}
                    >
                      <Flex align="center" gap={1} justify="flex-end">
                        <Text>Quantity</Text>
                        {sortField === "quantity" && (
                          sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                        )}
                      </Flex>
                    </Th>
                    <Th 
                      width="15%"
                      cursor="pointer" 
                      onClick={() => handleSort("status")}
                      _hover={{ color: "purple.400" }}
                    >
                      <Flex align="center" gap={1}>
                        <Text>Status</Text>
                        {sortField === "status" && (
                          sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                        )}
                      </Flex>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td colSpan={6} p={0} border="none">
                      <Box
                        position="relative"
                        h={`${rowVirtualizer.getTotalSize()}px`}
                      >
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                          const item = sortedItems[virtualRow.index];
                          const virtualItems = rowVirtualizer.getVirtualItems();
                          const isInLastTwoVisibleRows = virtualItems.indexOf(virtualRow) >= virtualItems.length - 2;
                          const showSkeleton = isScrolling && isInLastTwoVisibleRows;
                          
                          return (
                            <Box
                              key={`${item.locationId}-${item.productId}-${virtualRow.index}`}
                              position="absolute"
                              top={0}
                              left={0}
                              w="100%"
                              h={`${virtualRow.size}px`}
                              transform={`translateY(${virtualRow.start}px)`}
                            >
                              {showSkeleton ? (
                                <Table variant="simple" style={{ tableLayout: 'fixed' }} w="100%">
                                  <Tbody>
                                    <Tr>
                                      <Td width="18%">
                                        <Skeleton height="16px" width="100px" startColor="gray.200" endColor="gray.300" _dark={{ startColor: "gray.600", endColor: "gray.500" }} />
                                      </Td>
                                      <Td width="10%">
                                        <Skeleton height="20px" width="60px" borderRadius="md" startColor="gray.200" endColor="gray.300" _dark={{ startColor: "gray.600", endColor: "gray.500" }} />
                                      </Td>
                                      <Td width="25%">
                                        <Skeleton height="16px" width="150px" startColor="gray.200" endColor="gray.300" _dark={{ startColor: "gray.600", endColor: "gray.500" }} />
                                      </Td>
                                      <Td width="17%">
                                        <Skeleton height="16px" width="90px" startColor="gray.200" endColor="gray.300" _dark={{ startColor: "gray.600", endColor: "gray.500" }} />
                                      </Td>
                                      <Td width="15%" isNumeric>
                                        <Skeleton height="16px" width="60px" ml="auto" startColor="gray.200" endColor="gray.300" _dark={{ startColor: "gray.600", endColor: "gray.500" }} />
                                      </Td>
                                      <Td width="15%">
                                        <Skeleton height="20px" width="70px" borderRadius="md" startColor="gray.200" endColor="gray.300" _dark={{ startColor: "gray.600", endColor: "gray.500" }} />
                                      </Td>
                                    </Tr>
                                  </Tbody>
                                </Table>
                              ) : (
                                <Table variant="simple" style={{ tableLayout: 'fixed' }} w="100%">
                                  <Tbody>
                                    <Tr
                                      {...getRowBorderStyle(item.quantity)}
                                      _hover={{ bg: hoverBg }}
                                      transition="all 0.2s"
                                    >
                                      <Td width="18%" fontWeight="medium">{item.locationName}</Td>
                                      <Td width="10%">
                                        <Badge colorScheme={item.locationType === "hub" ? "blue" : "purple"}>
                                          {item.locationType.toUpperCase()}
                                        </Badge>
                                      </Td>
                                      <Td width="25%" color="text.secondary" fontSize="sm">
                                        {item.address}
                                      </Td>
                                      <Td width="17%">{item.productName}</Td>
                                      <Td width="15%" isNumeric>
                                        <Text
                                          fontWeight="bold"
                                          color={getStockStatusColor(item.quantity)}
                                        >
                                          {item.quantity.toLocaleString()}
                                        </Text>
                                      </Td>
                                      <Td width="15%">{getStockStatusBadge(item.quantity)}</Td>
                                    </Tr>
                                  </Tbody>
                                </Table>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>

        {/* Results Count */}
        {!loading && (
          <Text color="text.secondary" fontSize="sm">
            Showing {sortedItems.length} of {inventoryItems.length} items
          </Text>
        )}
      </VStack>
    </Box>
  );
};

