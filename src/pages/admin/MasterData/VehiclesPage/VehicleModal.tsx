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
  Input,
  FormErrorMessage,
  VStack,
  Select,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

// Zod validation schema for Vehicle
const vehicleSchema = z.object({
  registration: z.string().min(1, "Registration number is required").min(3, "Registration must be at least 3 characters"),
  capacity: z.number().min(1, "Capacity must be at least 1 liter").positive("Capacity must be positive"),
  type: z.string().min(1, "Vehicle type is required"),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export type VehicleData = VehicleFormData & {
  id: string;
};

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: VehicleData) => void | Promise<void>;
  initialData?: Partial<VehicleData>;
  mode?: "create" | "edit";
}

export const VehicleModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  mode = "create" 
}: VehicleModalProps) => {
  const toast = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      registration: "",
      capacity: 0,
      type: "",
    },
  });

  // Reset form with initialData when modal opens or data changes
  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        registration: initialData.registration || "",
        capacity: initialData.capacity || 0,
        type: initialData.type || "",
      });
    } else if (isOpen && !initialData) {
      reset({
        registration: "",
        capacity: 0,
        type: "",
      });
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data: VehicleFormData) => {
    try {
      // Generate ID for new vehicles
      const vehicleData: VehicleData = {
        ...data,
        id: mode === "create" ? `vehicle-${Date.now()}` : (initialData as any)?.id || `vehicle-${Date.now()}`,
      };
      
      // Call the onSubmit prop if provided
      if (onSubmit) {
        await onSubmit(vehicleData);
      }
      
      // Reset form and close modal
      reset();
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

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCancel} 
      size={{ base: "full", sm: "md", md: "xl" }}
      scrollBehavior={{ base: "inside", md: "outside" }}
    >
      <ModalOverlay />
      <ModalContent 
        bg="bg.card" 
        borderColor="border.default"
        mx={{ base: 0, sm: 4 }}
        my={{ base: 0, sm: 16 }}
      >
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader color="text.primary" fontSize={{ base: "lg", md: "xl" }}>
            {mode === "create" ? "Add New Vehicle" : "Edit Vehicle"}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              {/* Registration Number */}
              <FormControl isInvalid={!!errors.registration}>
                <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
                  Registration Number
                </FormLabel>
                <Input
                  {...register("registration")}
                  placeholder="e.g., TRK-101"
                  bg="bg.input"
                  size={{ base: "md", md: "md" }}
                />
                <FormErrorMessage fontSize="sm">{errors.registration?.message}</FormErrorMessage>
              </FormControl>

              {/* Capacity */}
              <FormControl isInvalid={!!errors.capacity}>
                <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
                  Capacity (Liters)
                </FormLabel>
                <Input
                  {...register("capacity", { valueAsNumber: true })}
                  type="number"
                  min="1"
                  placeholder="e.g., 8000"
                  bg="bg.input"
                  size={{ base: "md", md: "md" }}
                />
                <FormErrorMessage fontSize="sm">{errors.capacity?.message}</FormErrorMessage>
              </FormControl>

              {/* Vehicle Type */}
              <FormControl isInvalid={!!errors.type}>
                <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
                  Vehicle Type
                </FormLabel>
                <Select
                  {...register("type")}
                  placeholder="Select vehicle type"
                  bg="bg.input"
                  size={{ base: "md", md: "md" }}
                >
                  <option value="Tanker">Tanker</option>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Pickup">Pickup</option>
                </Select>
                <FormErrorMessage fontSize="sm">{errors.type?.message}</FormErrorMessage>
              </FormControl>
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
              onClick={handleCancel}
              width={{ base: "full", sm: "auto" }}
              size={{ base: "md", md: "md" }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              type="submit"
              isLoading={isSubmitting}
              width={{ base: "full", sm: "auto" }}
              size={{ base: "md", md: "md" }}
            >
              {mode === "create" ? "Create Vehicle" : "Update Vehicle"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

