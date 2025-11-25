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
  Flex,
  Select,
  Input,
} from "@chakra-ui/react";
import { MdAdd, MdDelete, MdEdit, MdRefresh, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useState, useEffect } from "react";
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
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

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

  const dates = viewMode === 'week' ? getWeekDates(currentDate) : getMonthDates(currentDate);

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="purple.500" />
      </Center>
    );
  }

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Page Header */}
        <HStack justify="space-between">
          <Heading size="lg" color="text.primary">
            Vehicle Allocation
          </Heading>
          <HStack>
            <Button
              colorScheme="purple"
              leftIcon={<MdAdd />}
              size="md"
              onClick={handleAddNew}
            >
              New Allocation
            </Button>
          </HStack>
        </HStack>

        {/* Calendar Controls */}
        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={4}
        >
          <HStack justify="space-between" mb={4} flexWrap="wrap" gap={4}>
            <HStack>
              <IconButton
                aria-label="Previous"
                icon={<MdChevronLeft />}
                onClick={navigatePrevious}
                variant="ghost"
              />
              <Button onClick={navigateToday} variant="ghost">
                Today
              </Button>
              <IconButton
                aria-label="Next"
                icon={<MdChevronRight />}
                onClick={navigateNext}
                variant="ghost"
              />
              <Text fontWeight="semibold" fontSize="lg" ml={4} color="text.primary">
                {viewMode === 'week' 
                  ? `Week of ${currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                  : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                }
              </Text>
            </HStack>
            
            <HStack>
              <Select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'week' | 'month')}
                w="150px"
                size="sm"
              >
                <option value="week">Week View</option>
                <option value="month">Month View</option>
              </Select>
            </HStack>
          </HStack>

          {/* Filters */}
          <HStack mb={4} spacing={4}>
            <Select
              placeholder="All Vehicles"
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              w="200px"
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
              w="200px"
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
          <Grid 
            templateColumns={viewMode === 'week' ? 'repeat(7, 1fr)' : 'repeat(7, 1fr)'} 
            gap={2}
          >
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <GridItem key={day}>
                <Text 
                  textAlign="center" 
                  fontWeight="bold" 
                  py={2}
                  color="text.secondary"
                  fontSize="sm"
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
              
              return (
                <GridItem key={index}>
                  <Box
                    border="1px solid"
                    borderColor={today ? "purple.500" : "border.default"}
                    bg={today ? "purple.50" : "bg.surface"}
                    borderRadius="md"
                    minH={viewMode === 'week' ? "150px" : "100px"}
                    p={2}
                    opacity={viewMode === 'month' && !currentMonth ? 0.5 : 1}
                    _hover={{ borderColor: "purple.300", cursor: "pointer" }}
                    _dark={{
                      bg: "purple.900",
                      borderColor: today ? "purple.400" : "whiteAlpha.300",
                    }}
                  >
                    <Text 
                      fontSize="sm" 
                      fontWeight={today ? "bold" : "normal"}
                      color={today ? "purple.600" : "text.secondary"}
                      mb={1}
                      _dark={{
                        color: today ? "purple.300" : "whiteAlpha.800",
                      }}
                    >
                      {date.getDate()}
                    </Text>
                    
                    <VStack align="stretch" spacing={1}>
                      {dayAllocations.map((allocation) => (
                        <Box
                          key={allocation.id}
                          bg={`${getStatusColor(allocation.status)}.100`}
                          borderLeft="3px solid"
                          borderColor={`${getStatusColor(allocation.status)}.500`}
                          p={1}
                          fontSize="xs"
                          borderRadius="sm"
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
                  </Box>
                </GridItem>
              );
            })}
          </Grid>
        </Box>

        {/* Allocations List */}
        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={6}
        >
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="semibold" color="text.primary">
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

          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Vehicle</Th>
                  <Th>Driver</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {allocations.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={8}>
                      <Text color="text.secondary">No allocations found</Text>
                    </Td>
                  </Tr>
                ) : (
                  allocations
                    .sort((a, b) => new Date(b.date + 'T00:00:00').getTime() - new Date(a.date + 'T00:00:00').getTime())
                    .map((allocation) => (
                      <Tr key={allocation.id}>
                        <Td>{formatDateString(allocation.date)}</Td>
                        <Td>{getVehicleRegistration(allocation.vehicleId)}</Td>
                        <Td>{getDriverName(allocation.driverId)}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(allocation.status)}>
                            {allocation.status}
                          </Badge>
                        </Td>
                        <Td>
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
                    ))
                )}
              </Tbody>
            </Table>
          </Box>
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
