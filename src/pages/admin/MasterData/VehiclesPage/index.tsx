import { 
  Box, 
  Heading, 
  VStack, 
  Button, 
  HStack, 
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Badge,
  IconButton,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdArrowUpward, MdArrowDownward } from "react-icons/md";
import { VehicleModal, type VehicleData } from "./VehicleModal";
import { useEffect, useState } from "react";
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, type Vehicle } from "../../../../services/api";

export const VehiclesPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"registration" | "type" | "capacity">("registration");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const toast = useToast();
  const inputTextColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const selectTextColor = useColorModeValue("gray.800", "whiteAlpha.900");

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await getVehicles();
      setVehicles(data);
    } catch (error) {
      toast({
        title: "Error fetching vehicles",
        description: error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSubmit = async (data: VehicleData) => {
    try {
      if (mode === "create") {
        await createVehicle({ ...data, currentLocation: data.currentLocation || { lat: 0, lng: 0 } });
        toast({
          title: "Vehicle created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await updateVehicle(data.id, data);
        toast({
          title: "Vehicle updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      fetchVehicles();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setMode("edit");
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await deleteVehicle(id);
        toast({
          title: "Vehicle deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchVehicles();
      } catch (error) {
        toast({
          title: "Error deleting vehicle",
          description: error instanceof Error ? error.message : "An error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleAddNew = () => {
    setSelectedVehicle(null);
    setMode("create");
    onOpen();
  };

  const handleSort = (field: "registration" | "type" | "capacity") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const vehicleTypes = Array.from(new Set(vehicles.map(v => v.type)));

  const filteredVehicles = vehicles.filter((vehicle) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      vehicle.registration.toLowerCase().includes(query) ||
      vehicle.type.toLowerCase().includes(query) ||
      vehicle.capacity.toString().includes(query)
    );
    
    const matchesType = typeFilter === "all" || vehicle.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    if (sortField === "capacity") {
      aValue = a.capacity;
      bValue = b.capacity;
    } else {
      aValue = a[sortField].toLowerCase();
      bValue = b[sortField].toLowerCase();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <Box>
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        {/* Page Header */}
        <HStack justify="space-between" flexWrap={{ base: "wrap", sm: "nowrap" }} gap={{ base: 3, md: 0 }}>
          <Heading size={{ base: "md", md: "lg" }} color="text.primary">
            Vehicles Management
          </Heading>
          <Button
            colorScheme="purple"
            leftIcon={<MdAdd />}
            size={{ base: "sm", md: "md" }}
            onClick={handleAddNew}
            width={{ base: "full", sm: "auto" }}
          >
            Add Vehicle
          </Button>
        </HStack>

        {/* Search Bar and Filters */}
        <HStack spacing={4} justifyContent="space-between" flexDirection={{ base: "column", md: "row" }} align="stretch">
          <InputGroup flex={{ base: "1", md: "1" }} maxW={{ md: "600px" }} minW={{ md: "300px" }}>
            <InputLeftElement pointerEvents="none">
              <MdSearch color="gray" size="20px" />
            </InputLeftElement>
            <Input
              placeholder="Search vehicles by registration, type, or capacity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="bg.card"
              borderColor="border.default"
              color={inputTextColor}
              _hover={{ borderColor: "purple.400" }}
              _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
            />
          </InputGroup>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            bg="bg.card"
            borderColor="border.default"
            color={selectTextColor}
            _hover={{ borderColor: "purple.400" }}
            _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
            width={{ base: "100%", md: "200px" }}
          >
            <option value="all">All Types</option>
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
        </HStack>

        {/* Content */}
        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={{ base: 3, md: 6 }}
          minH="400px"
        >
          {loading ? (
            <>
              {/* Desktop Skeleton View */}
              <Box display={{ base: "none", md: "block" }}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th color="text.secondary">Registration</Th>
                        <Th color="text.secondary">Type</Th>
                        <Th color="text.secondary">Capacity (L)</Th>
                        <Th color="text.secondary">Location</Th>
                        <Th color="text.secondary">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {[...Array(5)].map((_, index) => (
                        <Tr key={index}>
                          <Td>
                            <Skeleton height="20px" width="110px" />
                          </Td>
                          <Td>
                            <Skeleton height="20px" width="80px" borderRadius="md" />
                          </Td>
                          <Td>
                            <Skeleton height="20px" width="90px" />
                          </Td>
                          <Td>
                            <Skeleton height="20px" width="130px" />
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Skeleton height="32px" width="32px" borderRadius="md" />
                              <Skeleton height="32px" width="32px" borderRadius="md" />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Mobile Skeleton View */}
              <VStack spacing={3} display={{ base: "flex", md: "none" }} align="stretch">
                {[...Array(3)].map((_, index) => (
                  <Box
                    key={index}
                    p={4}
                    borderRadius="md"
                    border="1px solid"
                    borderColor="border.default"
                    bg="bg.surface"
                  >
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between" align="flex-start">
                        <Box flex="1">
                          <Skeleton height="20px" width="120px" mb={2} />
                          <Skeleton height="20px" width="80px" borderRadius="md" />
                        </Box>
                        <HStack spacing={1}>
                          <Skeleton height="32px" width="32px" borderRadius="md" />
                          <Skeleton height="32px" width="32px" borderRadius="md" />
                        </HStack>
                      </HStack>
                      
                      <HStack spacing={4}>
                        <Box>
                          <Skeleton height="14px" width="60px" mb={1} />
                          <Skeleton height="16px" width="80px" />
                        </Box>
                        <Box>
                          <Skeleton height="14px" width="60px" mb={1} />
                          <Skeleton height="16px" width="100px" />
                        </Box>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </>
          ) : sortedVehicles.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="300px">
              <Text color="text.secondary" textAlign="center" px={4}>
                {searchQuery ? "No vehicles found matching your search." : "No vehicles found. Add your first vehicle!"}
              </Text>
            </Box>
          ) : (
            <>
              {/* Desktop Table View */}
              <Box display={{ base: "none", md: "block" }}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th 
                          color="text.secondary" 
                          cursor="pointer" 
                          onClick={() => handleSort("registration")}
                          _hover={{ color: "purple.400" }}
                        >
                          <HStack spacing={1}>
                            <Text>Registration</Text>
                            {sortField === "registration" && (
                              sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                            )}
                          </HStack>
                        </Th>
                        <Th 
                          color="text.secondary" 
                          cursor="pointer" 
                          onClick={() => handleSort("type")}
                          _hover={{ color: "purple.400" }}
                        >
                          <HStack spacing={1}>
                            <Text>Type</Text>
                            {sortField === "type" && (
                              sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                            )}
                          </HStack>
                        </Th>
                        <Th 
                          color="text.secondary" 
                          cursor="pointer" 
                          onClick={() => handleSort("capacity")}
                          _hover={{ color: "purple.400" }}
                        >
                          <HStack spacing={1}>
                            <Text>Capacity (L)</Text>
                            {sortField === "capacity" && (
                              sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                            )}
                          </HStack>
                        </Th>
                        <Th color="text.secondary">Location</Th>
                        <Th color="text.secondary">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {sortedVehicles.map((vehicle) => (
                        <Tr key={vehicle.id}>
                          <Td color="text.primary" fontWeight="medium">{vehicle.registration}</Td>
                          <Td>
                            <Badge colorScheme="purple">{vehicle.type}</Badge>
                          </Td>
                          <Td color="text.primary">{vehicle.capacity.toLocaleString()}</Td>
                          <Td color="text.primary" fontSize="sm">
                            {vehicle.currentLocation ? 
                              `${vehicle.currentLocation.lat.toFixed(4)}, ${vehicle.currentLocation.lng.toFixed(4)}` : 
                              "N/A"
                            }
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Edit vehicle"
                                icon={<MdEdit size={"20px"}/>}
                                size="md"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleEdit(vehicle)}
                              />
                              <IconButton
                                aria-label="Delete vehicle"
                                icon={<MdDelete size={"20px"}/>}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDelete(vehicle.id)}
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Mobile Card View */}
              <VStack spacing={3} display={{ base: "flex", md: "none" }} align="stretch">
                {sortedVehicles.map((vehicle) => (
                  <Box
                    key={vehicle.id}
                    p={4}
                    borderRadius="md"
                    border="1px solid"
                    borderColor="border.default"
                    bg="bg.surface"
                  >
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between" align="flex-start">
                        <Box flex="1">
                          <Text fontWeight="bold" color="text.primary" fontSize="md">
                            {vehicle.registration}
                          </Text>
                          <Badge colorScheme="purple" mt={1}>
                            {vehicle.type}
                          </Badge>
                        </Box>
                        <HStack spacing={1}>
                          <IconButton
                            aria-label="Edit vehicle"
                            icon={<MdEdit size={"18px"}/>}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEdit(vehicle)}
                          />
                          <IconButton
                            aria-label="Delete vehicle"
                            icon={<MdDelete size={"18px"}/>}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDelete(vehicle.id)}
                          />
                        </HStack>
                      </HStack>
                      
                      <HStack spacing={4} fontSize="sm">
                        <Box>
                          <Text color="text.secondary" fontSize="xs">Capacity</Text>
                          <Text color="text.primary">{vehicle.capacity.toLocaleString()} L</Text>
                        </Box>
                        <Box>
                          <Text color="text.secondary" fontSize="xs">Location</Text>
                          <Text color="text.primary">
                            {vehicle.currentLocation 
                              ? `${vehicle.currentLocation.lat.toFixed(2)}, ${vehicle.currentLocation.lng.toFixed(2)}`
                              : 'N/A'
                            }
                          </Text>
                        </Box>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </>
          )}
        </Box>
      </VStack>

      {/* Vehicle Modal */}
      <VehicleModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleVehicleSubmit}
        initialData={selectedVehicle || undefined}
        mode={mode}
      />
    </Box>
  );
};

