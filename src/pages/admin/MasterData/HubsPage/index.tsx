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
  IconButton,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from "@chakra-ui/react";
import { MdAdd, MdEdit, MdDelete, MdSearch } from "react-icons/md";
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
  const toast = useToast();

  // Fetch hubs on mount
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

  // Handle form submission
  const handleHubSubmit = async (data: any) => {
    try {
      if (mode === "create") {
        // For create, don't include ID
        const { id, ...hubData } = data;
        await createHub(hubData);
        toast({
          title: "Hub created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // For update, include all data
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

  // Filter hubs based on search query and products filter
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

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Page Header */}
        <HStack justify="space-between">
          <Heading size="lg" color="text.primary">
            Hubs Management
          </Heading>
          <Button
            colorScheme="purple"
            leftIcon={<MdAdd />}
            size="md"
            onClick={handleAddNew}
          >
            Add Hub
          </Button>
        </HStack>

        {/* Search Bar and Filters */}
        <HStack spacing={4} justifyContent="space-between">
          <InputGroup flex={1} maxW="600px" minW="300px">
            <InputLeftElement pointerEvents="none">
              <MdSearch color="gray" size="20px" />
            </InputLeftElement>
            <Input
              placeholder="Search hubs by name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="bg.card"
              borderColor="border.default"
              _hover={{ borderColor: "purple.400" }}
              _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
            />
          </InputGroup>
          <Select
            value={productsFilter}
            onChange={(e) => setProductsFilter(e.target.value)}
            bg="bg.card"
            borderColor="border.default"
            _hover={{ borderColor: "purple.400" }}
            _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
            width="220px"
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
          p={6}
          minH="400px"
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="300px">
              <Spinner size="xl" color="purple.500" />
            </Box>
          ) : filteredHubs.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="300px">
              <Text color="text.secondary">
                {searchQuery ? "No hubs found matching your search." : "No hubs found. Add your first hub!"}
              </Text>
            </Box>
          ) : (
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
                  {filteredHubs.map((hub) => (
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

