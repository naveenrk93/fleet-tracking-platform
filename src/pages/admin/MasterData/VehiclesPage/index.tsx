import { 
  Box, 
  VStack, 
  HStack, 
  useDisclosure,
  Text,
  Badge,
  useToast,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";
import { VehicleModal, type VehicleData } from "./VehicleModal";
import { useEffect, useState } from "react";
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, type Vehicle } from "../../../../services/api";
import { 
  DataTable, 
  SearchInput, 
  PageHeader,
  ConfirmDialog,
  type Column, 
  type MobileField 
} from "../../../../components";

export const VehiclesPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"registration" | "type" | "capacity">("registration");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const toast = useToast();
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
    setVehicleToDelete(id);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;
    
    try {
      await deleteVehicle(vehicleToDelete);
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
    } finally {
      setVehicleToDelete(null);
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

  const columns: Column<Vehicle>[] = [
    {
      key: "registration",
      label: "Registration",
      sortable: true,
      render: (vehicle) => <Text fontWeight="medium">{vehicle.registration}</Text>,
      skeletonWidth: "110px",
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (vehicle) => <Badge colorScheme="purple">{vehicle.type}</Badge>,
      skeletonWidth: "80px",
    },
    {
      key: "capacity",
      label: "Capacity (L)",
      sortable: true,
      render: (vehicle) => <Text>{vehicle.capacity.toLocaleString()}</Text>,
      skeletonWidth: "90px",
    },
  ];

  const mobileFields: MobileField<Vehicle>[] = [
    {
      label: "Capacity",
      render: (vehicle) => (
        <Text color="text.primary">{vehicle.capacity.toLocaleString()} L</Text>
      ),
    },
  ];

  return (
    <Box>
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        <PageHeader 
          title="Vehicles Management" 
          actionLabel="Add Vehicle"
          onActionClick={handleAddNew}
        />

        {/* Search Bar and Filters */}
        <HStack spacing={4} justifyContent="space-between" flexDirection={{ base: "column", md: "row" }} align="stretch">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search vehicles by registration, type, or capacity..."
          />
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

        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={{ base: 3, md: 6 }}
          minH="400px"
        >
          <DataTable<Vehicle>
            data={sortedVehicles}
            columns={columns}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={(field) => handleSort(field as "registration" | "type" | "capacity")}
            emptyMessage={searchQuery ? "No vehicles found matching your search." : "No vehicles found. Add your first vehicle!"}
            getItemId={(vehicle) => vehicle.id}
            mobileTitle={(vehicle) => (
              <>
                <Text fontWeight="bold" color="text.primary" fontSize="md">
                  {vehicle.registration}
                </Text>
                <Badge colorScheme="purple" mt={1}>
                  {vehicle.type}
                </Badge>
              </>
            )}
            mobileFields={mobileFields}
          />
        </Box>
      </VStack>

      <VehicleModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleVehicleSubmit}
        initialData={selectedVehicle || undefined}
        mode={mode}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmLabel="Delete"
        confirmColorScheme="red"
      />
    </Box>
  );
};

