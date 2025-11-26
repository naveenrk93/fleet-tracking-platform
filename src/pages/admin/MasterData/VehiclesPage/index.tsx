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
import { MdAdd, MdEdit, MdDelete, MdSearch } from "react-icons/md";
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
  const toast = useToast();

  // Fetch vehicles on mount
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

  // Handle form submission
  const handleVehicleSubmit = async (data: VehicleData) => {
    try {
      if (mode === "create") {
        await createVehicle(data);
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

  // Get unique vehicle types for filter
  const vehicleTypes = Array.from(new Set(vehicles.map(v => v.type)));

  // Filter vehicles based on search query and type filter
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
              _hover={{ borderColor: "purple.400" }}
              _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
            />
          </InputGroup>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            bg="bg.card"
            borderColor="border.default"
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
            <Box display="flex" justifyContent="center" alignItems="center" minH="300px">
              <Spinner size="xl" color="purple.500" />
            </Box>
          ) : filteredVehicles.length === 0 ? (
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
                        <Th color="text.secondary">Registration</Th>
                        <Th color="text.secondary">Type</Th>
                        <Th color="text.secondary">Capacity (L)</Th>
                        <Th color="text.secondary">Location</Th>
                        <Th color="text.secondary">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredVehicles.map((vehicle) => (
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
                {filteredVehicles.map((vehicle) => (
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

