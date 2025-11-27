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
import { HubModal } from "./HubModal";
import { useEffect, useState } from "react";
import { getHubs, createHub, updateHub, deleteHub, type Hub } from "../../../../services/api";
import { 
  DataTable, 
  SearchInput, 
  PageHeader,
  ConfirmDialog,
  type Column, 
  type MobileField 
} from "../../../../components";

export const HubsPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);
  const [hubToDelete, setHubToDelete] = useState<string | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [productsFilter, setProductsFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"name" | "address" | "products">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const toast = useToast();
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
    setHubToDelete(id);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!hubToDelete) return;
    
    try {
      await deleteHub(hubToDelete);
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
    } finally {
      setHubToDelete(null);
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

  const columns: Column<Hub>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (hub) => <Text fontWeight="medium">{hub.name}</Text>,
    },
    {
      key: "address",
      label: "Address",
      sortable: true,
    },
    {
      key: "coordinates",
      label: "Coordinates",
      render: (hub) => (
        <Text>
          {hub.coordinates.lat.toFixed(4)}, {hub.coordinates.lng.toFixed(4)}
        </Text>
      ),
      skeletonWidth: "150px",
    },
    {
      key: "products",
      label: "Products",
      sortable: true,
      render: (hub) => (
        hub.products && hub.products.length > 0 ? (
          <Text fontSize="sm">
            {hub.products.length} product{hub.products.length > 1 ? 's' : ''}
          </Text>
        ) : (
          <Text fontSize="sm" color="text.secondary">None</Text>
        )
      ),
      skeletonWidth: "80px",
    },
  ];

  const mobileFields: MobileField<Hub>[] = [
    {
      label: "Coordinates",
      render: (hub) => (
        <Text color="text.primary">
          {hub.coordinates.lat.toFixed(2)}, {hub.coordinates.lng.toFixed(2)}
        </Text>
      ),
    },
    {
      label: "Products",
      render: (hub) => (
        <Text color="text.primary">
          {hub.products && hub.products.length > 0 
            ? `${hub.products.length} product${hub.products.length > 1 ? 's' : ''}`
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
          title="Hubs Management" 
          actionLabel="Add Hub"
          onActionClick={handleAddNew}
        />

        {/* Search Bar and Filters */}
        <HStack spacing={4} justifyContent="space-between" flexDirection={{ base: "column", md: "row" }} align="stretch">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search hubs by name or address..."
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
          <DataTable<Hub>
            data={sortedHubs}
            columns={columns}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={(field) => handleSort(field as "name" | "address" | "products")}
            emptyMessage={searchQuery ? "No hubs found matching your search." : "No hubs found. Add your first hub!"}
            getItemId={(hub) => hub.id}
            mobileTitle={(hub) => (
              <Text fontWeight="bold" color="text.primary" fontSize="md">
                {hub.name}
              </Text>
            )}
            mobileSubtitle={(hub) => (
              <Text fontSize="sm" color="text.secondary" mt={1}>
                {hub.address}
              </Text>
            )}
            mobileFields={mobileFields}
          />
        </Box>
      </VStack>

      <HubModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleHubSubmit}
        initialData={selectedHub || undefined}
        mode={mode}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Delete Hub"
        message="Are you sure you want to delete this hub? This action cannot be undone."
        confirmLabel="Delete"
        confirmColorScheme="red"
      />
    </Box>
  );
};

