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
  const [sortField, setSortField] = useState<"name" | "license" | "phone" | "email" | "status">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const toast = useToast();
  const inputTextColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const selectTextColor = useColorModeValue("gray.800", "whiteAlpha.900");

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

  const handleSort = (field: "name" | "license" | "phone" | "email" | "status") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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

  const sortedDrivers = [...filteredDrivers].sort((a, b) => {
    let aValue: string;
    let bValue: string;

    if (sortField === "status") {
      aValue = (a.status || "active").toLowerCase();
      bValue = (b.status || "active").toLowerCase();
    } else if (sortField === "email") {
      aValue = (a.email || "").toLowerCase();
      bValue = (b.email || "").toLowerCase();
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
            Drivers Management
          </Heading>
          <Button
            colorScheme="purple"
            leftIcon={<MdAdd />}
            size={{ base: "sm", md: "md" }}
            onClick={handleAddNew}
            width={{ base: "full", sm: "auto" }}
          >
            Add Driver
          </Button>
        </HStack>

        {/* Search Bar and Filters */}
        <HStack spacing={4} justifyContent="space-between" flexDirection={{ base: "column", md: "row" }} align="stretch">
          <InputGroup flex={{ base: "1", md: "1" }} maxW={{ md: "600px" }} minW={{ md: "300px" }}>
            <InputLeftElement pointerEvents="none">
              <MdSearch color="gray" size="20px" />
            </InputLeftElement>
            <Input
              placeholder="Search drivers by name, license, phone..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            bg="bg.card"
            borderColor="border.default"
            color={selectTextColor}
            _hover={{ borderColor: "purple.400" }}
            _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
            width={{ base: "100%", md: "200px" }}
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
                        <Th color="text.secondary">Name</Th>
                        <Th color="text.secondary">License</Th>
                        <Th color="text.secondary">Phone</Th>
                        <Th color="text.secondary">Email</Th>
                        <Th color="text.secondary">Status</Th>
                        <Th color="text.secondary">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {[...Array(5)].map((_, index) => (
                        <Tr key={index}>
                          <Td>
                            <Skeleton height="20px" width="130px" />
                          </Td>
                          <Td>
                            <Skeleton height="20px" width="100px" />
                          </Td>
                          <Td>
                            <Skeleton height="20px" width="120px" />
                          </Td>
                          <Td>
                            <Skeleton height="20px" width="150px" />
                          </Td>
                          <Td>
                            <Skeleton height="20px" width="70px" borderRadius="md" />
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
                          <HStack spacing={2} mb={1}>
                            <Skeleton height="20px" width="120px" />
                            <Skeleton height="20px" width="60px" borderRadius="md" />
                          </HStack>
                          <Skeleton height="16px" width="140px" />
                        </Box>
                        <HStack spacing={1}>
                          <Skeleton height="32px" width="32px" borderRadius="md" />
                          <Skeleton height="32px" width="32px" borderRadius="md" />
                        </HStack>
                      </HStack>
                      
                      <VStack align="stretch" spacing={1}>
                        <HStack>
                          <Skeleton height="14px" width="50px" />
                          <Skeleton height="16px" width="110px" />
                        </HStack>
                        <HStack>
                          <Skeleton height="14px" width="50px" />
                          <Skeleton height="16px" width="140px" />
                        </HStack>
                      </VStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </>
          ) : sortedDrivers.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="300px">
              <Text color="text.secondary" textAlign="center" px={4}>
                {searchQuery ? "No drivers found matching your search." : "No drivers found. Add your first driver!"}
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
                          onClick={() => handleSort("name")}
                          _hover={{ color: "purple.400" }}
                        >
                          <HStack spacing={1}>
                            <Text>Name</Text>
                            {sortField === "name" && (
                              sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                            )}
                          </HStack>
                        </Th>
                        <Th 
                          color="text.secondary" 
                          cursor="pointer" 
                          onClick={() => handleSort("license")}
                          _hover={{ color: "purple.400" }}
                        >
                          <HStack spacing={1}>
                            <Text>License</Text>
                            {sortField === "license" && (
                              sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                            )}
                          </HStack>
                        </Th>
                        <Th 
                          color="text.secondary" 
                          cursor="pointer" 
                          onClick={() => handleSort("phone")}
                          _hover={{ color: "purple.400" }}
                        >
                          <HStack spacing={1}>
                            <Text>Phone</Text>
                            {sortField === "phone" && (
                              sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                            )}
                          </HStack>
                        </Th>
                        <Th 
                          color="text.secondary" 
                          cursor="pointer" 
                          onClick={() => handleSort("email")}
                          _hover={{ color: "purple.400" }}
                        >
                          <HStack spacing={1}>
                            <Text>Email</Text>
                            {sortField === "email" && (
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
                      {sortedDrivers.map((driver) => (
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
              </Box>

              {/* Mobile Card View */}
              <VStack spacing={3} display={{ base: "flex", md: "none" }} align="stretch">
                {sortedDrivers.map((driver) => (
                  <Box
                    key={driver.id}
                    p={4}
                    borderRadius="md"
                    border="1px solid"
                    borderColor="border.default"
                    bg="bg.surface"
                  >
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between" align="flex-start">
                        <Box flex="1">
                          <HStack spacing={2} mb={1}>
                            <Text fontWeight="bold" color="text.primary" fontSize="md">
                              {driver.name}
                            </Text>
                            <Badge colorScheme={(driver.status || "active") === "active" ? "green" : "gray"}>
                              {driver.status || "active"}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="text.secondary">
                            License: {driver.license}
                          </Text>
                        </Box>
                        <HStack spacing={1}>
                          <IconButton
                            aria-label="Edit driver"
                            icon={<MdEdit size={"18px"}/>}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEdit(driver)}
                          />
                          <IconButton
                            aria-label="Delete driver"
                            icon={<MdDelete size={"18px"}/>}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDelete(driver.id)}
                          />
                        </HStack>
                      </HStack>
                      
                      <VStack align="stretch" fontSize="sm" spacing={1}>
                        <HStack>
                          <Text color="text.secondary" fontSize="xs" minW="60px">Phone:</Text>
                          <Text color="text.primary">{driver.phone}</Text>
                        </HStack>
                        <HStack>
                          <Text color="text.secondary" fontSize="xs" minW="60px">Email:</Text>
                          <Text color="text.primary">{driver.email || "N/A"}</Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </>
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

