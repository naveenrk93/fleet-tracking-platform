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
import { DriverModal, type DriverData } from "./DriverModal";
import { useEffect, useState } from "react";
import { getDrivers, createDriver, updateDriver, deleteDriver, type Driver } from "../../../../services/api";
import { 
  DataTable, 
  SearchInput, 
  PageHeader, 
  StatusBadge,
  ConfirmDialog,
  type Column, 
  type MobileField 
} from "../../../../components";

export const DriversPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverToDelete, setDriverToDelete] = useState<string | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"name" | "license" | "phone" | "email" | "status">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const toast = useToast();
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
    setDriverToDelete(id);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!driverToDelete) return;
    
    try {
      await deleteDriver(driverToDelete);
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
    } finally {
      setDriverToDelete(null);
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

  const columns: Column<Driver>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (driver) => <Text fontWeight="medium">{driver.name}</Text>,
      skeletonWidth: "130px",
    },
    {
      key: "license",
      label: "License",
      sortable: true,
      skeletonWidth: "100px",
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
      skeletonWidth: "120px",
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (driver) => <Text>{driver.email || "N/A"}</Text>,
      skeletonWidth: "150px",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (driver) => (
        <StatusBadge status={driver.status || "active"} />
      ),
      skeletonWidth: "70px",
    },
  ];

  const mobileFields: MobileField<Driver>[] = [
    {
      label: "Phone:",
      render: (driver) => (
        <Text color="text.primary">{driver.phone}</Text>
      ),
    },
    {
      label: "Email:",
      render: (driver) => (
        <Text color="text.primary">{driver.email || "N/A"}</Text>
      ),
    },
  ];

  return (
    <Box>
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        <PageHeader 
          title="Drivers Management" 
          actionLabel="Add Driver"
          onActionClick={handleAddNew}
        />

        {/* Search Bar and Filters */}
        <HStack spacing={4} justifyContent="space-between" flexDirection={{ base: "column", md: "row" }} align="stretch">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search drivers by name, license, phone..."
          />
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

        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={{ base: 3, md: 6 }}
          minH="400px"
        >
          <DataTable<Driver>
            data={sortedDrivers}
            columns={columns}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={(field) => handleSort(field as "name" | "license" | "phone" | "email" | "status")}
            emptyMessage={searchQuery ? "No drivers found matching your search." : "No drivers found. Add your first driver!"}
            getItemId={(driver) => driver.id}
            mobileTitle={(driver) => (
              <HStack spacing={2} mb={1}>
                <Text fontWeight="bold" color="text.primary" fontSize="md">
                  {driver.name}
                </Text>
                <StatusBadge status={driver.status || "active"} />
              </HStack>
            )}
            mobileSubtitle={(driver) => (
              <Text fontSize="sm" color="text.secondary">
                License: {driver.license}
              </Text>
            )}
            mobileFields={mobileFields}
          />
        </Box>
      </VStack>

      <DriverModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleDriverSubmit}
        initialData={selectedDriver || undefined}
        mode={mode}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Delete Driver"
        message="Are you sure you want to delete this driver? This action cannot be undone."
        confirmLabel="Delete"
        confirmColorScheme="red"
      />
    </Box>
  );
};

