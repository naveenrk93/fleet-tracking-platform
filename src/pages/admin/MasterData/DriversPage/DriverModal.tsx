import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { MasterDataModal, MasterDataInput as Input } from "../../../../components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

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
      const driverData: DriverData = {
        ...data,
        id: mode === "create" ? `driver-${Date.now()}` : (initialData as any)?.id || `driver-${Date.now()}`,
      };
      
      if (onSubmit) {
        await onSubmit(driverData);
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
      title={mode === "create" ? "Add New Driver" : "Edit Driver"}
      onSubmit={handleSubmit(handleFormSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={mode === "create" ? "Create Driver" : "Update Driver"}
    >
      <VStack spacing={{ base: 3, md: 4 }} align="stretch">
        {/* Driver Name */}
        <FormControl isInvalid={!!errors.name}>
          <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
            Driver Name
          </FormLabel>
          <Input
            {...register("name")}
            placeholder="e.g., John Smith"
            bg="bg.input"
            size={{ base: "md", md: "md" }}
          />
          <FormErrorMessage fontSize="sm">{errors.name?.message}</FormErrorMessage>
        </FormControl>

        {/* License Number */}
        <FormControl isInvalid={!!errors.license}>
          <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
            License Number
          </FormLabel>
          <Input
            {...register("license")}
            placeholder="e.g., DL-123456"
            bg="bg.input"
            size={{ base: "md", md: "md" }}
          />
          <FormErrorMessage fontSize="sm">{errors.license?.message}</FormErrorMessage>
        </FormControl>

        {/* Phone Number */}
        <FormControl isInvalid={!!errors.phone}>
          <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
            Phone Number
          </FormLabel>
          <Input
            {...register("phone")}
            placeholder="e.g., +1-555-0100"
            bg="bg.input"
            size={{ base: "md", md: "md" }}
          />
          <FormErrorMessage fontSize="sm">{errors.phone?.message}</FormErrorMessage>
        </FormControl>
      </VStack>
    </MasterDataModal>
  );
};

