import { 
  Box, 
  VStack, 
  HStack, 
  useDisclosure,
  Text,
  useToast,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";
import { TerminalModal } from "./TerminalModal";
import { useEffect, useState } from "react";
import { getTerminals, createTerminal, updateTerminal, deleteTerminal, type Terminal } from "../../../../services/api";
import { 
  DataTable, 
  SearchInput, 
  PageHeader,
  ConfirmDialog,
  type Column, 
  type MobileField 
} from "../../../../components";

export const TerminalsPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [terminalToDelete, setTerminalToDelete] = useState<string | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [productsFilter, setProductsFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"name" | "address" | "products">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const toast = useToast();
  const selectTextColor = useColorModeValue("gray.800", "whiteAlpha.900");

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

  const handleTerminalSubmit = async (data: any) => {
    try {
      if (mode === "create") {
        const { id, ...terminalData } = data;
        await createTerminal(terminalData);
        toast({
          title: "Terminal created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
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
    setTerminalToDelete(id);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!terminalToDelete) return;
    
    try {
      await deleteTerminal(terminalToDelete);
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
    } finally {
      setTerminalToDelete(null);
    }
  };

  const handleAddNew = () => {
    setSelectedTerminal(null);
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

  const filteredTerminals = terminals.filter((terminal) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      terminal.name?.toLowerCase().includes(query) ||
      terminal.address?.toLowerCase().includes(query)
    );
    
    let matchesProducts = true;
    if (productsFilter === "with_products") {
      matchesProducts = !!(terminal.products && terminal.products.length > 0);
    } else if (productsFilter === "without_products") {
      matchesProducts = !terminal.products || terminal.products.length === 0;
    }
    
    return matchesSearch && matchesProducts;
  });

  const sortedTerminals = [...filteredTerminals].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    if (sortField === "products") {
      aValue = a.products ? a.products.length : 0;
      bValue = b.products ? b.products.length : 0;
    } else {
      aValue = (a[sortField] || "").toLowerCase();
      bValue = (b[sortField] || "").toLowerCase();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const columns: Column<Terminal>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (terminal) => <Text fontWeight="medium">{terminal.name}</Text>,
    },
    {
      key: "address",
      label: "Address",
      sortable: true,
    },
    {
      key: "coordinates",
      label: "Coordinates",
      render: (terminal) => (
        <Text>
          {terminal.coordinates.lat.toFixed(4)}, {terminal.coordinates.lng.toFixed(4)}
        </Text>
      ),
      skeletonWidth: "150px",
    },
    {
      key: "products",
      label: "Products",
      sortable: true,
      render: (terminal) => (
        terminal.products && terminal.products.length > 0 ? (
          <Text fontSize="sm">
            {terminal.products.length} product{terminal.products.length > 1 ? 's' : ''}
          </Text>
        ) : (
          <Text fontSize="sm" color="text.secondary">None</Text>
        )
      ),
      skeletonWidth: "80px",
    },
  ];

  const mobileFields: MobileField<Terminal>[] = [
    {
      label: "Coordinates",
      render: (terminal) => (
        <Text color="text.primary">
          {terminal.coordinates.lat.toFixed(2)}, {terminal.coordinates.lng.toFixed(2)}
        </Text>
      ),
    },
    {
      label: "Products",
      render: (terminal) => (
        <Text color="text.primary">
          {terminal.products && terminal.products.length > 0 
            ? `${terminal.products.length} product${terminal.products.length > 1 ? 's' : ''}`
            : 'None'
          }
        </Text>
      ),
    },
  ];

  return (
    <Box>
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        <PageHeader 
          title="Terminals Management" 
          actionLabel="Add Terminal"
          onActionClick={handleAddNew}
        />

        {/* Search Bar and Filters */}
        <HStack spacing={4} justifyContent="space-between" flexDirection={{ base: "column", md: "row" }} align="stretch">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search terminals by name or address..."
          />
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
          <DataTable<Terminal>
            data={sortedTerminals}
            columns={columns}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={(field) => handleSort(field as "name" | "address" | "products")}
            emptyMessage={searchQuery ? "No terminals found matching your search." : "No terminals found. Add your first terminal!"}
            getItemId={(terminal) => terminal.id}
            mobileTitle={(terminal) => (
              <Text fontWeight="bold" color="text.primary" fontSize="md">
                {terminal.name}
              </Text>
            )}
            mobileSubtitle={(terminal) => (
              <Text fontSize="sm" color="text.secondary" mt={1}>
                {terminal.address}
              </Text>
            )}
            mobileFields={mobileFields}
          />
        </Box>
      </VStack>

      <TerminalModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleTerminalSubmit}
        initialData={selectedTerminal || undefined}
        mode={mode}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Delete Terminal"
        message="Are you sure you want to delete this terminal? This action cannot be undone."
        confirmLabel="Delete"
        confirmColorScheme="red"
      />
    </Box>
  );
};

