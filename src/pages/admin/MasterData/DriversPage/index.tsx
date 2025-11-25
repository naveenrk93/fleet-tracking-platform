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
import { DriverModal, type DriverData } from "./DriverModal";
import { useEffect, useState } from "react";
import { getDrivers, createDriver, updateDriver, deleteDriver, type Driver } from "../../../../services/api";

export const DriversPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const toast = useToast();

  // Fetch drivers on mount
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await getDrivers();
      setDrivers(data);
    } catch (error) {
      toast({
        title: "Error fetching drivers",
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
  const handleDriverSubmit = async (data: DriverData) => {
    try {
      if (mode === "create") {
        await createDriver(data);
        toast({
          title: "Driver created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await updateDriver(data.id, data);
        toast({
          title: "Driver updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      fetchDrivers();
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

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver);
    setMode("edit");
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this driver?")) {
      try {
        await deleteDriver(id);
        toast({
          title: "Driver deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchDrivers();
      } catch (error) {
        toast({
          title: "Error deleting driver",
          description: error instanceof Error ? error.message : "An error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleAddNew = () => {
    setSelectedDriver(null);
    setMode("create");
    onOpen();
  };

  // Filter drivers based on search query and status filter
  const filteredDrivers = drivers.filter((driver) => {
    const query = searchQuery.toLowerCase();
    const driverStatus = driver.status || "active"; // Default to active if status is not set
    
    const matchesSearch = (
      driver.name.toLowerCase().includes(query) ||
      driver.license.toLowerCase().includes(query) ||
      driver.phone.toLowerCase().includes(query) ||
      (driver.email && driver.email.toLowerCase().includes(query)) ||
      driverStatus.toLowerCase().includes(query)
    );
    
    const matchesStatus = statusFilter === "all" || driverStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Page Header */}
        <HStack justify="space-between">
          <Heading size="lg" color="text.primary">
            Drivers Management
          </Heading>
          <Button
            colorScheme="purple"
            leftIcon={<MdAdd />}
            size="md"
            onClick={handleAddNew}
          >
            Add Driver
          </Button>
        </HStack>

        {/* Search Bar and Filters */}
        <HStack spacing={4} justifyContent="space-between">
          <InputGroup flex={1} maxW="600px" minW="300px">
            <InputLeftElement pointerEvents="none">
              <MdSearch color="gray" size="20px" />
            </InputLeftElement>
            <Input
              placeholder="Search drivers by name, license, phone, email, or status..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
          ) : filteredDrivers.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="300px">
              <Text color="text.secondary">
                {searchQuery ? "No drivers found matching your search." : "No drivers found. Add your first driver!"}
              </Text>
            </Box>
          ) : (
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color="text.secondary">Name</Th>
                    <Th color="text.secondary">License</Th>
                    <Th color="text.secondary">Phone</Th>
                    <Th color="text.secondary">Email</Th>
                    <Th color="text.secondary">Status</Th>
                    <Th color="text.secondary">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredDrivers.map((driver) => (
                    <Tr key={driver.id}>
                      <Td color="text.primary" fontWeight="medium">{driver.name}</Td>
                      <Td color="text.primary">{driver.license}</Td>
                      <Td color="text.primary">{driver.phone}</Td>
                      <Td color="text.primary">{driver.email || "N/A"}</Td>
                      <Td>
                        <Badge colorScheme={(driver.status || "active") === "active" ? "green" : "gray"}>
                          {driver.status || "active"}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Edit driver"
                            icon={<MdEdit size={"20px"}/>}
                            size="md"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEdit(driver)}
                          />
                          <IconButton
                            aria-label="Delete driver"
                            icon={<MdDelete size={"20px"}/>}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDelete(driver.id)}
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

      {/* Driver Modal */}
      <DriverModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleDriverSubmit}
        initialData={selectedDriver || undefined}
        mode={mode}
      />
    </Box>
  );
};

