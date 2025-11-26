import { 
  Box, 
  Heading, 
  VStack, 
  Button, 
  HStack, 
  Grid, 
  GridItem, 
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  useToast,
  Spinner,
  Center,
  ButtonGroup,
  Select,
} from "@chakra-ui/react";
import { MdAdd, MdDelete, MdEdit, MdRefresh, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  getAllocations, 
  getDrivers, 
  getVehicles, 
  deleteAllocation,
  type Allocation,
  type Driver,
  type Vehicle,
} from "../../../services/api";
import { AllocationModal } from "./AllocationModal";

export const VehicleAllocationPage = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [filterVehicle, setFilterVehicle] = useState<string>('');
  const [filterDriver, setFilterDriver] = useState<string>('');
  const [expandedCalendarDates, setExpandedCalendarDates] = useState<Set<string>>(new Set());
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Ref for virtualization container
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allocationsData, driversData, vehiclesData] = await Promise.all([
        getAllocations(),
        getDrivers(),
        getVehicles(),
      ]);
      setAllocations(allocationsData);
      setDrivers(driversData);
      setVehicles(vehiclesData);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load allocations, drivers, or vehicles",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAllocation(id);
      setAllocations(allocations.filter((a) => a.id !== id));
      toast({
        title: "Allocation deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting allocation",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddNew = () => {
    setSelectedAllocation(null);
    onOpen();
  };

  const handleEdit = (allocation: Allocation) => {
    setSelectedAllocation(allocation);
    onOpen();
  };

  const handleModalClose = () => {
    setSelectedAllocation(null);
    onClose();
  };

  const handleSave = () => {
    fetchData();
    handleModalClose();
  };

  const getDriverName = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    return driver?.name || "Unknown Driver";
  };

  const getVehicleRegistration = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle?.registration || "Unknown Vehicle";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "allocated":
        return "blue";
      case "completed":
        return "green";
      case "pending":
        return "yellow";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  // Calendar helper functions
  const getWeekDates = (date: Date): Date[] => {
    const week: Date[] = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getMonthDates = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dates: Date[] = [];
    
    // Add dates from previous month to fill the first week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(firstDay);
      prevDate.setDate(firstDay.getDate() - (i + 1));
      dates.push(prevDate);
    }
    
    // Add all dates in current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      dates.push(new Date(year, month, d));
    }
    
    // Add dates from next month to fill the last week
    const remainingDays = 7 - (dates.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const nextDate = new Date(lastDay);
        nextDate.setDate(lastDay.getDate() + i);
        dates.push(nextDate);
      }
    }
    
    return dates;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to format date string (YYYY-MM-DD) to localized date string without timezone issues
  const formatDateString = (dateString: string): string => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Create date in local timezone
    return date.toLocaleDateString();
  };

  const getAllocationsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    let filtered = allocations.filter((a) => a.date === dateStr);
    
    if (filterVehicle) {
      filtered = filtered.filter((a) => a.vehicleId === filterVehicle);
    }
    
    if (filterDriver) {
      filtered = filtered.filter((a) => a.driverId === filterDriver);
    }
    
    return filtered;
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  const handleToggleCalendarCard = (date: Date) => {
    const dateStr = formatDate(date);
    const newExpanded = new Set(expandedCalendarDates);
    if (newExpanded.has(dateStr)) {
      newExpanded.delete(dateStr);
    } else {
      newExpanded.add(dateStr);
    }
    setExpandedCalendarDates(newExpanded);
  };

  const dates = viewMode === 'week' ? getWeekDates(currentDate) : getMonthDates(currentDate);
  
  // Max allocations to show in calendar cell before "show more"
  const MAX_VISIBLE_ALLOCATIONS = viewMode === 'week' ? 3 : 2;

  // Get sorted allocations for table display
  const sortedAllocations = [...allocations].sort(
    (a, b) => new Date(b.date + 'T00:00:00').getTime() - new Date(a.date + 'T00:00:00').getTime()
  );

  // TanStack Virtual setup
  const rowVirtualizer = useVirtualizer({
    count: sortedAllocations.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 45, // Estimated row height in pixels
    overscan: 5, // Number of items to render outside of the visible area
  });

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="purple.500" />
      </Center>
    );
  }

  return (
    <Box>
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        {/* Page Header */}
        <HStack justify="space-between" flexWrap={{ base: "wrap", sm: "nowrap" }} gap={{ base: 3, md: 0 }}>
          <Heading size={{ base: "md", md: "lg" }} color="text.primary">
            Vehicle Allocation
          </Heading>
          <Button
            colorScheme="purple"
            leftIcon={<MdAdd />}
            size={{ base: "sm", md: "md" }}
            onClick={handleAddNew}
            width={{ base: "full", sm: "auto" }}
          >
            New Allocation
          </Button>
        </HStack>

        {/* Calendar Controls */}
        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={{ base: 3, md: 4 }}
        >
          <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
            <HStack spacing={{ base: 1, md: 2 }}>
              <IconButton
                aria-label="Previous"
                icon={<MdChevronLeft />}
                onClick={navigatePrevious}
                variant="ghost"
                size={{ base: "sm", md: "md" }}
              />
              <Button 
                onClick={navigateToday} 
                variant="ghost" 
                size={{ base: "sm", md: "md" }}
              >
                <Text 
                  fontWeight="semibold" 
                  fontSize={{ base: "sm", md: "md" }} 
                  color="text.primary"
                >
                  {viewMode === 'week' 
                    ? `Week of ${currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                    : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  }
                </Text>
              </Button>
              <IconButton
                aria-label="Next"
                icon={<MdChevronRight />}
                onClick={navigateNext}
                variant="ghost"
                size={{ base: "sm", md: "md" }}
              />
            </HStack>
            
            <ButtonGroup size="sm" isAttached variant="outline">
              <Button
                colorScheme={viewMode === 'week' ? 'purple' : 'gray'}
                onClick={() => setViewMode('week')}
                bg={viewMode === 'week' ? 'purple.500' : 'transparent'}
                color={viewMode === 'week' ? 'white' : 'text.primary'}
                _hover={{
                  bg: viewMode === 'week' ? 'purple.600' : 'bg.hover',
                }}
              >
                Week
              </Button>
              <Button
                colorScheme={viewMode === 'month' ? 'purple' : 'gray'}
                onClick={() => setViewMode('month')}
                bg={viewMode === 'month' ? 'purple.500' : 'transparent'}
                color={viewMode === 'month' ? 'white' : 'text.primary'}
                _hover={{
                  bg: viewMode === 'month' ? 'purple.600' : 'bg.hover',
                }}
              >
                Month
              </Button>
            </ButtonGroup>
          </HStack>

          {/* Filters */}
          <HStack mb={4} spacing={4} flexWrap="wrap">
            <Select
              placeholder="All Vehicles"
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              w={{ base: "full", sm: "200px" }}
              size="sm"
            >
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registration}
                </option>
              ))}
            </Select>
            
            <Select
              placeholder="All Drivers"
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
              w={{ base: "full", sm: "200px" }}
              size="sm"
            >
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </Select>
            
            {(filterVehicle || filterDriver) && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => {
                  setFilterVehicle('');
                  setFilterDriver('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </HStack>

          {/* Calendar Grid */}
          <Box overflowX={{ base: "auto", md: "visible" }} pb={2}>
            <Grid 
              templateColumns={viewMode === 'week' ? 'repeat(7, 1fr)' : 'repeat(7, 1fr)'} 
              gap={{ base: 1, md: 2 }}
              minW={{ base: "700px", md: "auto" }}
            >
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <GridItem key={day}>
                  <Text 
                    textAlign="center" 
                    fontWeight="bold" 
                    py={{ base: 1, md: 2 }}
                    color="text.secondary"
                    fontSize={{ base: "xs", md: "sm" }}
                  >
                    {day}
                  </Text>
                </GridItem>
              ))}
            
              {/* Date cells */}
              {dates.map((date, index) => {
                const dayAllocations = getAllocationsForDate(date);
                const today = isToday(date);
                const currentMonth = isCurrentMonth(date);
                const dateStr = formatDate(date);
                const isExpanded = expandedCalendarDates.has(dateStr);
                const remainingCount = dayAllocations.length - MAX_VISIBLE_ALLOCATIONS;
                
                // Calculate heights for animation
                const ALLOCATION_HEIGHT = 42; // Approximate height of each allocation item in px
                const collapsedHeight = 94; // Fixed max height for collapsed state
                const expandedHeight = 430; // Fixed max height for expanded state
                
                return (
                  <GridItem key={index}>
                    <Box
                      border="1px solid"
                      borderColor={today ? "purple.500" : "border.default"}
                      bg={today ? "purple.50" : "bg.surface"}
                      borderRadius="md"
                      minH={viewMode === 'week' ? { base: "140px", md: "180px" } : { base: "100px", md: "120px" }}
                      p={{ base: 2, md: 3 }}
                    opacity={viewMode === 'month' && !currentMonth ? 0.5 : 1}
                    display="flex"
                    flexDirection="column"
                    cursor="pointer"
                    transition="box-shadow 0.2s"
                    _hover={{ borderColor: "purple.300", boxShadow: "md" }}
                    _dark={{
                      bg: today ? "purple.900" : "bg.surface",
                      borderColor: today ? "purple.400" : "whiteAlpha.300",
                    }}
                      onClick={() => handleToggleCalendarCard(date)}
                    >
                      <HStack justify="space-between" align="flex-start" mb={{ base: 1, md: 2 }} pb={{ base: 1, md: 2 }}>
                        <Text 
                          fontSize={{ base: "xs", md: "sm" }}
                          fontWeight={today ? "bold" : "normal"}
                          color={today ? "purple.600" : "text.secondary"}
                          _dark={{
                            color: today ? "purple.300" : "whiteAlpha.800",
                          }}
                        >
                          {date.getDate()}
                        </Text>
                        {dayAllocations.length > 0 && (
                          <Badge fontSize="2xs" colorScheme="purple" flexShrink={0} display={{ base: "none", sm: "inline-flex" }}>
                            {dayAllocations.length}
                          </Badge>
                        )}
                      </HStack>
                    
                    <VStack 
                      align="stretch" 
                      spacing={1} 
                      flex="1"
                      maxH={isExpanded ? `${expandedHeight}px` : `${collapsedHeight}px`}
                      overflowY={isExpanded && (dayAllocations.length * ALLOCATION_HEIGHT > expandedHeight) ? "auto" : "hidden"}
                      transition="max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      sx={{
                        '&::-webkit-scrollbar': {
                          width: '4px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: 'purple.300',
                          borderRadius: '2px',
                        },
                      }}
                    >
                      {dayAllocations.map((allocation) => (
                        <Box
                          key={allocation.id}
                          bg={`${getStatusColor(allocation.status)}.100`}
                          borderLeft="3px solid"
                          borderColor={`${getStatusColor(allocation.status)}.500`}
                          p={1}
                          fontSize="xs"
                          borderRadius="sm"
                          cursor="pointer"
                          _hover={{ bg: `${getStatusColor(allocation.status)}.200` }}
                          _dark={{
                            bg: `${getStatusColor(allocation.status)}.800`,
                            borderColor: `${getStatusColor(allocation.status)}.400`,
                            _hover: { bg: `${getStatusColor(allocation.status)}.700` }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(allocation);
                          }}
                        >
                          <Text 
                            fontWeight="semibold" 
                            noOfLines={1}
                            color={`${getStatusColor(allocation.status)}.900`}
                            _dark={{
                              color: `${getStatusColor(allocation.status)}.100`
                            }}
                          >
                            {getVehicleRegistration(allocation.vehicleId)}
                          </Text>
                          <Text 
                            noOfLines={1} 
                            color={`${getStatusColor(allocation.status)}.800`}
                            _dark={{
                              color: `${getStatusColor(allocation.status)}.200`
                            }}
                          >
                            {getDriverName(allocation.driverId)}
                          </Text>
                        </Box>
                        ))}
                      </VStack>
                      
                      {!isExpanded && remainingCount > 0 && (
                        <Box
                          mt={{ base: 1, md: 2 }}
                          pt={1}
                          fontSize={{ base: "2xs", md: "xs" }}
                          color="purple.600"
                          fontWeight="semibold"
                          textAlign="center"
                          _dark={{ color: "purple.300" }}
                        >
                          +{remainingCount} more
                        </Box>
                      )}
                    </Box>
                  </GridItem>
                );
              })}
            </Grid>
          </Box>
        </Box>

        {/* Allocations List */}
        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={{ base: 3, md: 6 }}
        >
          <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" color="text.primary">
              All Allocations
            </Text>
            <Button
              leftIcon={<MdRefresh />}
              size="sm"
              variant="ghost"
              onClick={fetchData}
            >
              Refresh
            </Button>
          </HStack>

          {/* Desktop Table View */}
          <Box 
            ref={tableContainerRef}
            overflowY="auto"
            overflowX="auto"
            maxH="600px"
            position="relative"
            display={{ base: "none", md: "block" }}
          >
            {sortedAllocations.length === 0 ? (
              <Center py={8}>
                <Text color="text.secondary">No allocations found</Text>
              </Center>
            ) : (
              <Table variant="simple" size="sm" style={{ tableLayout: 'fixed' }} w="100%">
                <Thead 
                  position="sticky" 
                  top={0} 
                  bg="bg.card" 
                  zIndex={1}
                  _dark={{ bg: "gray.800" }}
                >
                  <Tr>
                    <Th width="15%">Date</Th>
                    <Th width="20%">Vehicle</Th>
                    <Th width="25%">Driver</Th>
                    <Th width="20%">Status</Th>
                    <Th width="20%">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td colSpan={5} p={0} border="none">
                      <Box
                        position="relative"
                        h={`${rowVirtualizer.getTotalSize()}px`}
                      >
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                          const allocation = sortedAllocations[virtualRow.index];
                          return (
                            <Box
                              key={allocation.id}
                              position="absolute"
                              top={0}
                              left={0}
                              w="100%"
                              h={`${virtualRow.size}px`}
                              transform={`translateY(${virtualRow.start}px)`}
                            >
                              <Table variant="simple" size="sm" style={{ tableLayout: 'fixed' }} w="100%">
                                <Tbody>
                                  <Tr>
                                    <Td width="15%">{formatDateString(allocation.date)}</Td>
                                    <Td width="20%">{getVehicleRegistration(allocation.vehicleId)}</Td>
                                    <Td width="25%">{getDriverName(allocation.driverId)}</Td>
                                    <Td width="20%">
                                      <Badge colorScheme={getStatusColor(allocation.status)}>
                                        {allocation.status}
                                      </Badge>
                                    </Td>
                                    <Td width="20%">
                                      <HStack spacing={2}>
                                        <IconButton
                                          aria-label="Edit"
                                          icon={<MdEdit />}
                                          size="sm"
                                          variant="ghost"
                                          colorScheme="blue"
                                          onClick={() => handleEdit(allocation)}
                                        />
                                        <IconButton
                                          aria-label="Delete"
                                          icon={<MdDelete />}
                                          size="sm"
                                          variant="ghost"
                                          colorScheme="red"
                                          onClick={() => handleDelete(allocation.id)}
                                        />
                                      </HStack>
                                    </Td>
                                  </Tr>
                                </Tbody>
                              </Table>
                            </Box>
                          );
                        })}
                      </Box>
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            )}
          </Box>

          {/* Mobile Card View */}
          <VStack spacing={3} display={{ base: "flex", md: "none" }} align="stretch">
            {sortedAllocations.length === 0 ? (
              <Center py={8}>
                <Text color="text.secondary">No allocations found</Text>
              </Center>
            ) : (
              sortedAllocations.map((allocation) => (
                <Box
                  key={allocation.id}
                  p={4}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="border.default"
                  bg="bg.surface"
                >
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between" align="flex-start">
                      <Box flex="1">
                        <HStack spacing={2} mb={1} flexWrap="wrap">
                          <Text fontWeight="bold" color="text.primary" fontSize="md">
                            {getVehicleRegistration(allocation.vehicleId)}
                          </Text>
                          <Badge colorScheme={getStatusColor(allocation.status)}>
                            {allocation.status}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="text.secondary">
                          {getDriverName(allocation.driverId)}
                        </Text>
                      </Box>
                      <HStack spacing={1}>
                        <IconButton
                          aria-label="Edit"
                          icon={<MdEdit size={"18px"} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleEdit(allocation)}
                        />
                        <IconButton
                          aria-label="Delete"
                          icon={<MdDelete size={"18px"} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(allocation.id)}
                        />
                      </HStack>
                    </HStack>
                    
                    <Box>
                      <Text color="text.secondary" fontSize="xs">Date</Text>
                      <Text color="text.primary" fontSize="sm">
                        {formatDateString(allocation.date)}
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              ))
            )}
          </VStack>
        </Box>
      </VStack>

      {/* Allocation Modal */}
      <AllocationModal
        isOpen={isOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        allocation={selectedAllocation}
        drivers={drivers}
        vehicles={vehicles}
        existingAllocations={allocations}
      />

    </Box>
  );
};
