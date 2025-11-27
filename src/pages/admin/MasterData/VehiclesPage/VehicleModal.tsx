import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { MasterDataModal, MasterDataInput as Input, MasterDataSelect as Select } from "../../../../components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

const vehicleSchema = z.object({
  registration: z.string().min(1, "Registration number is required").min(3, "Registration must be at least 3 characters"),
  capacity: z.number().min(1, "Capacity must be at least 1 liter").positive("Capacity must be positive"),
  type: z.string().min(1, "Vehicle type is required"),
  currentLocation: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
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
      let vehicleId: string;
      if (mode === "create") {
        vehicleId = `vehicle-${Date.now()}`;
      } else {
        vehicleId = initialData?.id || `vehicle-${Date.now()}`;
      }
      
      const vehicleData: VehicleData = {
        ...data,
        id: vehicleId,
        currentLocation: data.currentLocation || { lat: 0, lng: 0 },
      };
      
      if (onSubmit) {
        await onSubmit(vehicleData);
      }
      
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
    <MasterDataModal
      isOpen={isOpen}
      onClose={handleCancel}
      title={mode === "create" ? "Add New Vehicle" : "Edit Vehicle"}
      onSubmit={handleSubmit(handleFormSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={mode === "create" ? "Create Vehicle" : "Update Vehicle"}
    >
      <VStack spacing={{ base: 3, md: 4 }} align="stretch">
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
    </MasterDataModal>
  );
};

