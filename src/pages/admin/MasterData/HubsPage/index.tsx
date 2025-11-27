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
import { HubModal } from "./HubModal";
import { useEffect, useState } from "react";
import { getHubs, createHub, updateHub, deleteHub, type Hub } from "../../../../services/api";

export const HubsPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [productsFilter, setProductsFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"name" | "address" | "products">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const toast = useToast();
  const inputTextColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const selectTextColor = useColorModeValue("gray.800", "whiteAlpha.900");

  useEffect(() => {
    fetchHubs();
  }, []);

  const fetchHubs = async () => {
    try {
      setLoading(true);
      const data = await getHubs();
      setHubs(data);
    } catch (error) {
      toast({
        title: "Error fetching hubs",
        description: error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHubSubmit = async (data: any) => {
    try {
      if (mode === "create") {
        const { id, ...hubData } = data;
        await createHub(hubData);
        toast({
          title: "Hub created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await updateHub(data.id, data);
        toast({
          title: "Hub updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      fetchHubs();
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

  const handleEdit = (hub: Hub) => {
    setSelectedHub(hub);
    setMode("edit");
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this hub?")) {
      try {
        await deleteHub(id);
        toast({
          title: "Hub deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchHubs();
      } catch (error) {
        toast({
          title: "Error deleting hub",
          description: error instanceof Error ? error.message : "An error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleAddNew = () => {
    setSelectedHub(null);
    setMode("create");
    onOpen();
  };

  const handleSort = (field: "name" | "address" | "products") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredHubs = hubs.filter((hub) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      hub.name.toLowerCase().includes(query) ||
      hub.address.toLowerCase().includes(query)
    );
    
    let matchesProducts = true;
    if (productsFilter === "with_products") {
      matchesProducts = !!hub.products && hub.products.length > 0;
    } else if (productsFilter === "without_products") {
      matchesProducts = !hub.products || hub.products.length === 0;
    }
    
    return matchesSearch && matchesProducts;
  });

  const sortedHubs = [...filteredHubs].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    if (sortField === "products") {
      aValue = a.products ? a.products.length : 0;
      bValue = b.products ? b.products.length : 0;
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
            Hubs Management
          </Heading>
          <Button
            colorScheme="purple"
            leftIcon={<MdAdd />}
            size={{ base: "sm", md: "md" }}
            onClick={handleAddNew}
            width={{ base: "full", sm: "auto" }}
          >
            Add Hub
          </Button>
        </HStack>

        {/* Search Bar and Filters */}
        <HStack spacing={4} justifyContent="space-between" flexDirection={{ base: "column", md: "row" }} align="stretch">
          <InputGroup flex={{ base: "1", md: "1" }} maxW={{ md: "600px" }} minW={{ md: "300px" }}>
            <InputLeftElement pointerEvents="none">
              <MdSearch color="gray" size="20px" />
            </InputLeftElement>
            <Input
              placeholder="Search hubs by name or address..."
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
            value={productsFilter}
            onChange={(e) => setProductsFilter(e.target.value)}
            bg="bg.card"
            borderColor="border.default"
            color={selectTextColor}
            _hover={{ borderColor: "purple.400" }}
            _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
            width={{ base: "100%", md: "220px" }}
          >
            <option value="all">All Hubs</option>
            <option value="with_products">With Products</option>
            <option value="without_products">Without Products</option>
          </Select>
        </HStack>

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
                        <Th color="text.secondary">Address</Th>
                        <Th color="text.secondary">Coordinates</Th>
                        <Th color="text.secondary">Products</Th>
                        <Th color="text.secondary">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {[...Array(5)].map((_, index) => (
                        <Tr key={index}>
                          <Td>
                            <Skeleton height="20px" width="120px" />
                          </Td>
                          <Td>
                            <Skeleton height="20px" width="200px" />
                          </Td>
                          <Td>
                            <Skeleton height="20px" width="150px" />
                          </Td>
                          <Td>
                            <Skeleton height="20px" width="80px" />
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
                          <Skeleton height="20px" width="140px" mb={2} />
                          <Skeleton height="16px" width="200px" />
                        </Box>
                        <HStack spacing={1}>
                          <Skeleton height="32px" width="32px" borderRadius="md" />
                          <Skeleton height="32px" width="32px" borderRadius="md" />
                        </HStack>
                      </HStack>
                      
                      <HStack spacing={4}>
                        <Box>
                          <Skeleton height="14px" width="70px" mb={1} />
                          <Skeleton height="16px" width="90px" />
                        </Box>
                        <Box>
                          <Skeleton height="14px" width="60px" mb={1} />
                          <Skeleton height="16px" width="70px" />
                        </Box>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </>
          ) : sortedHubs.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="300px">
              <Text color="text.secondary" textAlign="center" px={4}>
                {searchQuery ? "No hubs found matching your search." : "No hubs found. Add your first hub!"}
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
                          onClick={() => handleSort("address")}
                          _hover={{ color: "purple.400" }}
                        >
                          <HStack spacing={1}>
                            <Text>Address</Text>
                            {sortField === "address" && (
                              sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                            )}
                          </HStack>
                        </Th>
                        <Th color="text.secondary">Coordinates</Th>
                        <Th 
                          color="text.secondary" 
                          cursor="pointer" 
                          onClick={() => handleSort("products")}
                          _hover={{ color: "purple.400" }}
                        >
                          <HStack spacing={1}>
                            <Text>Products</Text>
                            {sortField === "products" && (
                              sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                            )}
                          </HStack>
                        </Th>
                        <Th color="text.secondary">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {sortedHubs.map((hub) => (
                        <Tr key={hub.id}>
                          <Td color="text.primary" fontWeight="medium">{hub.name}</Td>
                          <Td color="text.primary">{hub.address}</Td>
                          <Td color="text.primary">
                            {hub.coordinates.lat.toFixed(4)}, {hub.coordinates.lng.toFixed(4)}
                          </Td>
                          <Td color="text.primary">
                            {hub.products && hub.products.length > 0 ? (
                              <Text fontSize="sm">
                                {hub.products.length} product{hub.products.length > 1 ? 's' : ''}
                              </Text>
                            ) : (
                              <Text fontSize="sm" color="text.secondary">None</Text>
                            )}
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Edit hub"
                                icon={<MdEdit size={"20px"}/>}
                                size="md"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleEdit(hub)}
                              />
                              <IconButton
                                aria-label="Delete hub"
                                icon={<MdDelete size={"20px"}/>}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDelete(hub.id)}
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
                {sortedHubs.map((hub) => (
                  <Box
                    key={hub.id}
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
                            {hub.name}
                          </Text>
                          <Text fontSize="sm" color="text.secondary" mt={1}>
                            {hub.address}
                          </Text>
                        </Box>
                        <HStack spacing={1}>
                          <IconButton
                            aria-label="Edit hub"
                            icon={<MdEdit size={"18px"}/>}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEdit(hub)}
                          />
                          <IconButton
                            aria-label="Delete hub"
                            icon={<MdDelete size={"18px"}/>}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDelete(hub.id)}
                          />
                        </HStack>
                      </HStack>
                      
                      <HStack spacing={4} fontSize="sm">
                        <Box>
                          <Text color="text.secondary" fontSize="xs">Coordinates</Text>
                          <Text color="text.primary">
                            {hub.coordinates.lat.toFixed(2)}, {hub.coordinates.lng.toFixed(2)}
                          </Text>
                        </Box>
                        <Box>
                          <Text color="text.secondary" fontSize="xs">Products</Text>
                          <Text color="text.primary">
                            {hub.products && hub.products.length > 0 
                              ? `${hub.products.length} product${hub.products.length > 1 ? 's' : ''}`
                              : 'None'
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

      {/* Hub Modal */}
      <HubModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleHubSubmit}
        initialData={selectedHub || undefined}
        mode={mode}
      />
    </Box>
  );
};

