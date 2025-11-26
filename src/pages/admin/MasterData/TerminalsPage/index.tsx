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
import { TerminalModal, type TerminalData } from "./TerminalModal";
import { useEffect, useState } from "react";
import { getTerminals, createTerminal, updateTerminal, deleteTerminal, type Terminal } from "../../../../services/api";

export const TerminalsPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [productsFilter, setProductsFilter] = useState<string>("all");
  const toast = useToast();

  // Fetch terminals on mount
  useEffect(() => {
    fetchTerminals();
  }, []);

  const fetchTerminals = async () => {
    try {
      setLoading(true);
      const data = await getTerminals();
      setTerminals(data);
    } catch (error) {
      toast({
        title: "Error fetching terminals",
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
  const handleTerminalSubmit = async (data: any) => {
    try {
      if (mode === "create") {
        // For create, don't include ID
        const { id, ...terminalData } = data;
        await createTerminal(terminalData);
        toast({
          title: "Terminal created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // For update, include all data
        await updateTerminal(data.id, data);
        toast({
          title: "Terminal updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      fetchTerminals();
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

  const handleEdit = (terminal: Terminal) => {
    setSelectedTerminal(terminal);
    setMode("edit");
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this terminal?")) {
      try {
        await deleteTerminal(id);
        toast({
          title: "Terminal deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchTerminals();
      } catch (error) {
        toast({
          title: "Error deleting terminal",
          description: error instanceof Error ? error.message : "An error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleAddNew = () => {
    setSelectedTerminal(null);
    setMode("create");
    onOpen();
  };

  // Filter terminals based on search query and products filter
  const filteredTerminals = terminals.filter((terminal) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      terminal.name?.toLowerCase().includes(query) ||
      terminal.address?.toLowerCase().includes(query)
    );
    
    let matchesProducts = true;
    if (productsFilter === "with_products") {
      matchesProducts = terminal.products && terminal.products.length > 0;
    } else if (productsFilter === "without_products") {
      matchesProducts = !terminal.products || terminal.products.length === 0;
    }
    
    return matchesSearch && matchesProducts;
  });

  return (
    <Box>
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        {/* Page Header */}
        <HStack justify="space-between" flexWrap={{ base: "wrap", sm: "nowrap" }} gap={{ base: 3, md: 0 }}>
          <Heading size={{ base: "md", md: "lg" }} color="text.primary">
            Terminals Management
          </Heading>
          <Button
            colorScheme="purple"
            leftIcon={<MdAdd />}
            size={{ base: "sm", md: "md" }}
            onClick={handleAddNew}
            width={{ base: "full", sm: "auto" }}
          >
            Add Terminal
          </Button>
        </HStack>

        {/* Search Bar and Filters */}
        <HStack spacing={4} justifyContent="space-between" flexDirection={{ base: "column", md: "row" }} align="stretch">
          <InputGroup flex={{ base: "1", md: "1" }} maxW={{ md: "600px" }} minW={{ md: "300px" }}>
            <InputLeftElement pointerEvents="none">
              <MdSearch color="gray" size="20px" />
            </InputLeftElement>
            <Input
              placeholder="Search terminals by name or address..."
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
            width={{ base: "100%", md: "220px" }}
          >
            <option value="all">All Terminals</option>
            <option value="with_products">With Products</option>
            <option value="without_products">Without Products</option>
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
          ) : filteredTerminals.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="300px">
              <Text color="text.secondary" textAlign="center" px={4}>
                {searchQuery ? "No terminals found matching your search." : "No terminals found. Add your first terminal!"}
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
                        <Th color="text.secondary">Name</Th>
                        <Th color="text.secondary">Address</Th>
                        <Th color="text.secondary">Coordinates</Th>
                        <Th color="text.secondary">Products</Th>
                        <Th color="text.secondary">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredTerminals.map((terminal) => (
                        <Tr key={terminal.id}>
                          <Td color="text.primary" fontWeight="medium">{terminal.name}</Td>
                          <Td color="text.primary">{terminal.address}</Td>
                          <Td color="text.primary">
                            {terminal.coordinates.lat.toFixed(4)}, {terminal.coordinates.lng.toFixed(4)}
                          </Td>
                          <Td color="text.primary">
                            {terminal.products && terminal.products.length > 0 ? (
                              <Text fontSize="sm">
                                {terminal.products.length} product{terminal.products.length > 1 ? 's' : ''}
                              </Text>
                            ) : (
                              <Text fontSize="sm" color="text.secondary">None</Text>
                            )}
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Edit terminal"
                                icon={<MdEdit size={"20px"}/>}
                                size="md"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleEdit(terminal)}
                              />
                              <IconButton
                                aria-label="Delete terminal"
                                icon={<MdDelete size={"20px"}/>}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDelete(terminal.id)}
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
                {filteredTerminals.map((terminal) => (
                  <Box
                    key={terminal.id}
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
                            {terminal.name}
                          </Text>
                          <Text fontSize="sm" color="text.secondary" mt={1}>
                            {terminal.address}
                          </Text>
                        </Box>
                        <HStack spacing={1}>
                          <IconButton
                            aria-label="Edit terminal"
                            icon={<MdEdit size={"18px"}/>}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEdit(terminal)}
                          />
                          <IconButton
                            aria-label="Delete terminal"
                            icon={<MdDelete size={"18px"}/>}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDelete(terminal.id)}
                          />
                        </HStack>
                      </HStack>
                      
                      <HStack spacing={4} fontSize="sm">
                        <Box>
                          <Text color="text.secondary" fontSize="xs">Coordinates</Text>
                          <Text color="text.primary">
                            {terminal.coordinates.lat.toFixed(2)}, {terminal.coordinates.lng.toFixed(2)}
                          </Text>
                        </Box>
                        <Box>
                          <Text color="text.secondary" fontSize="xs">Products</Text>
                          <Text color="text.primary">
                            {terminal.products && terminal.products.length > 0 
                              ? `${terminal.products.length} product${terminal.products.length > 1 ? 's' : ''}`
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

      {/* Terminal Modal */}
      <TerminalModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleTerminalSubmit}
        initialData={selectedTerminal || undefined}
        mode={mode}
      />
    </Box>
  );
};

