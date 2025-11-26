import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  createAllocation,
  updateAllocation,
  type Allocation,
  type Driver,
  type Vehicle,
} from "../../../services/api";

interface AllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  allocation: Allocation | null;
  drivers: Driver[];
  vehicles: Vehicle[];
  existingAllocations: Allocation[];
}

export const AllocationModal = ({
  isOpen,
  onClose,
  onSave,
  allocation,
  drivers,
  vehicles,
  existingAllocations,
}: AllocationModalProps) => {
  const [formData, setFormData] = useState({
    date: "",
    vehicleId: "",
    driverId: "",
    status: "allocated" as "allocated" | "completed" | "pending" | "cancelled",
  });
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [conflictingVehicleAllocation, setConflictingVehicleAllocation] = useState<Allocation | null>(null);
  const toast = useToast();

  // Helper function to get local date string in YYYY-MM-DD format
  const getLocalDateString = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (allocation) {
      setFormData({
        date: allocation.date,
        vehicleId: allocation.vehicleId,
        driverId: allocation.driverId,
        status: allocation.status,
      });
    } else {
      // Default to today's date in local timezone
      setFormData({
        date: getLocalDateString(),
        vehicleId: "",
        driverId: "",
        status: "allocated",
      });
    }
    setValidationError("");
    setConflictingVehicleAllocation(null);
  }, [allocation, isOpen]);

  const checkVehicleDoubleBooking = (vehicleId: string, date: string, currentAllocationId?: string): boolean => {
    const conflict = existingAllocations.find(
      (a) => 
        a.vehicleId === vehicleId && 
        a.date === date && 
        a.id !== currentAllocationId &&
        a.status !== 'cancelled' // Don't consider cancelled allocations as conflicts
    );

    if (conflict) {
      setConflictingVehicleAllocation(conflict);
      return true;
    }

    setConflictingVehicleAllocation(null);
    return false;
  };

  const handleChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    setValidationError("");

    // Check for vehicle double booking when vehicle or date changes
    if ((field === 'vehicleId' || field === 'date') && newFormData.vehicleId && newFormData.date) {
      const hasVehicleConflict = checkVehicleDoubleBooking(newFormData.vehicleId, newFormData.date, allocation?.id);
      if (hasVehicleConflict) {
        setValidationError(`Vehicle is already allocated on this date`);
        return;
      }
    }
  };

  const validateForm = (): boolean => {
    if (!formData.date) {
      setValidationError("Please select a date");
      return false;
    }

    if (!formData.vehicleId) {
      setValidationError("Please select a vehicle");
      return false;
    }

    if (!formData.driverId) {
      setValidationError("Please select a driver");
      return false;
    }

    // Check for vehicle double booking
    if (checkVehicleDoubleBooking(formData.vehicleId, formData.date, allocation?.id)) {
      setValidationError("This vehicle is already allocated on this date. Please choose a different vehicle or date.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (allocation) {
        await updateAllocation(allocation.id, formData);
        toast({
          title: "Allocation updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await createAllocation(formData);
        toast({
          title: "Allocation created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      onSave();
    } catch (error: any) {
      toast({
        title: "Error saving allocation",
        description: error.message || "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getDriverName = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    return driver?.name || "Unknown Driver";
  };

  const getVehicleRegistration = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle?.registration || "Unknown Vehicle";
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size={{ base: "full", sm: "md" }}
      scrollBehavior={{ base: "inside", md: "outside" }}
    >
      <ModalOverlay />
      <ModalContent
        mx={{ base: 0, sm: 4 }}
        my={{ base: 0, sm: 16 }}
      >
        <ModalHeader fontSize={{ base: "lg", md: "xl" }}>
          {allocation ? "Edit Allocation" : "New Allocation"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
          <VStack spacing={{ base: 3, md: 4 }}>

            {conflictingVehicleAllocation && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={1} flex="1">
                  <AlertTitle fontSize="sm">Vehicle Double Booking Detected!</AlertTitle>
                  <AlertDescription fontSize="xs">
                    <Text>
                      <strong>{getVehicleRegistration(conflictingVehicleAllocation.vehicleId)}</strong> is already allocated to{" "}
                      <strong>{getDriverName(conflictingVehicleAllocation.driverId)}</strong> on this date.
                    </Text>
                  </AlertDescription>
                </VStack>
              </Alert>
            )}

            <FormControl isRequired>
              <FormLabel fontSize={{ base: "sm", md: "md" }}>Date</FormLabel>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                min={getLocalDateString()}
                color="text.primary"
                size={{ base: "md", md: "md" }}
                _dark={{
                  color: "white",
                  bg: "whiteAlpha.100",
                  borderColor: "whiteAlpha.300",
                  _hover: {
                    borderColor: "whiteAlpha.400"
                  },
                  _focus: {
                    borderColor: "purple.400",
                    boxShadow: "0 0 0 1px var(--chakra-colors-purple-400)"
                  }
                }}
                sx={{
                  colorScheme: "light",
                  _dark: {
                    colorScheme: "dark",
                    "&::-webkit-calendar-picker-indicator": {
                      filter: "brightness(0) invert(1)",
                      cursor: "pointer",
                      opacity: 0.9
                    },
                    "&::-webkit-datetime-edit": {
                      color: "white"
                    },
                    "&::-webkit-datetime-edit-fields-wrapper": {
                      color: "white"
                    },
                    "&::-webkit-datetime-edit-text": {
                      color: "whiteAlpha.700"
                    },
                    "&::-webkit-datetime-edit-month-field": {
                      color: "white"
                    },
                    "&::-webkit-datetime-edit-day-field": {
                      color: "white"
                    },
                    "&::-webkit-datetime-edit-year-field": {
                      color: "white"
                    }
                  }
                }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize={{ base: "sm", md: "md" }}>Vehicle</FormLabel>
              <Select
                placeholder="Select vehicle"
                value={formData.vehicleId}
                onChange={(e) => handleChange("vehicleId", e.target.value)}
                size={{ base: "md", md: "md" }}
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.registration} - {vehicle.type} ({vehicle.capacity}L)
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize={{ base: "sm", md: "md" }}>Driver</FormLabel>
              <Select
                placeholder="Select driver"
                value={formData.driverId}
                onChange={(e) => handleChange("driverId", e.target.value)}
                size={{ base: "md", md: "md" }}
              >
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} - {driver.license}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize={{ base: "sm", md: "md" }}>Status</FormLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                size={{ base: "md", md: "md" }}
              >
                <option value="pending">Pending</option>
                <option value="allocated">Allocated</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </FormControl>

            {/* Show available vehicles and drivers for selected date */}
            {formData.date && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={1} flex="1">
                  <AlertTitle fontSize="sm">Availability Check</AlertTitle>
                  <AlertDescription fontSize="xs">
                    <VStack align="start" spacing={0.5}>
                      <Text>
                        <strong>{vehicles.filter(v => 
                          !existingAllocations.some(a => 
                            a.vehicleId === v.id && 
                            a.date === formData.date && 
                            a.id !== allocation?.id &&
                            a.status !== 'cancelled'
                          )
                        ).length}</strong> vehicles available
                      </Text>
                      <Text>
                        <strong>{drivers.filter(d => 
                          !existingAllocations.some(a => 
                            a.driverId === d.id && 
                            a.date === formData.date && 
                            a.id !== allocation?.id &&
                            a.status !== 'cancelled'
                          )
                        ).length}</strong> drivers available
                      </Text>
                      <Text fontSize="2xs" color="gray.600">
                        on {new Date(formData.date + 'T00:00:00').toLocaleDateString()}
                      </Text>
                    </VStack>
                  </AlertDescription>
                </VStack>
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter
          px={{ base: 4, md: 6 }} 
          py={{ base: 3, md: 4 }}
          flexDirection={{ base: "column", sm: "row" }}
          gap={{ base: 2, sm: 0 }}
        >
          <Button 
            variant="ghost" 
            mr={{ base: 0, sm: 3 }} 
            onClick={onClose}
            width={{ base: "full", sm: "auto" }}
            size={{ base: "md", md: "md" }}
          >
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!!validationError}
            width={{ base: "full", sm: "auto" }}
            size={{ base: "md", md: "md" }}
          >
            {allocation ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

