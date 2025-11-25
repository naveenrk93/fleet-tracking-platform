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
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

// Zod validation schema for Driver
const driverSchema = z.object({
  name: z.string().min(1, "Driver name is required").min(3, "Name must be at least 3 characters"),
  license: z.string().min(1, "License number is required").min(5, "License must be at least 5 characters"),
  phone: z.string().min(1, "Phone number is required").regex(/^[+]?[\d\s-()]+$/, "Invalid phone number format"),
});

type DriverFormData = z.infer<typeof driverSchema>;

export type DriverData = DriverFormData & {
  id: string;
};

interface DriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: DriverData) => void | Promise<void>;
  initialData?: Partial<DriverData>;
  mode?: "create" | "edit";
}

export const DriverModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  mode = "create" 
}: DriverModalProps) => {
  const toast = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: "",
      license: "",
      phone: "",
    },
  });

  // Reset form with initialData when modal opens or data changes
  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        name: initialData.name || "",
        license: initialData.license || "",
        phone: initialData.phone || "",
      });
    } else if (isOpen && !initialData) {
      reset({
        name: "",
        license: "",
        phone: "",
      });
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data: DriverFormData) => {
    try {
      // Generate ID for new drivers
      const driverData: DriverData = {
        ...data,
        id: mode === "create" ? `driver-${Date.now()}` : (initialData as any)?.id || `driver-${Date.now()}`,
      };
      
      // Call the onSubmit prop if provided
      if (onSubmit) {
        await onSubmit(driverData);
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
    <Modal isOpen={isOpen} onClose={handleCancel} size="xl">
      <ModalOverlay />
      <ModalContent bg="bg.card" borderColor="border.default">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader color="text.primary">
            {mode === "create" ? "Add New Driver" : "Edit Driver"}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Driver Name */}
              <FormControl isInvalid={!!errors.name}>
                <FormLabel color="text.secondary">Driver Name</FormLabel>
                <Input
                  {...register("name")}
                  placeholder="e.g., John Smith"
                  bg="bg.input"
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              {/* License Number */}
              <FormControl isInvalid={!!errors.license}>
                <FormLabel color="text.secondary">License Number</FormLabel>
                <Input
                  {...register("license")}
                  placeholder="e.g., DL-123456"
                  bg="bg.input"
                />
                <FormErrorMessage>{errors.license?.message}</FormErrorMessage>
              </FormControl>

              {/* Phone Number */}
              <FormControl isInvalid={!!errors.phone}>
                <FormLabel color="text.secondary">Phone Number</FormLabel>
                <Input
                  {...register("phone")}
                  placeholder="e.g., +1-555-0100"
                  bg="bg.input"
                />
                <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              type="submit"
              isLoading={isSubmitting}
            >
              {mode === "create" ? "Create Driver" : "Update Driver"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

