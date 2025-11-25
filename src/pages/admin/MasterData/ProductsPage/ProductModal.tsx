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
  Textarea,
  useToast,
  Select,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

// Zod validation schema for Product
const productSchema = z.object({
  name: z.string().min(1, "Product name is required").min(3, "Product name must be at least 3 characters"),
  sku: z.string().min(1, "SKU is required").min(2, "SKU must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be non-negative"),
  unit: z.enum(["kg", "liter", "piece", "box", "ton"]),
  description: z.string().min(1, "Description is required").min(10, "Description must be at least 10 characters"),
  stockQuantity: z.number().min(0, "Stock quantity must be non-negative"),
});

type ProductFormData = z.infer<typeof productSchema>;

export type ProductData = ProductFormData & {
  id: string;
};

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: ProductData) => void | Promise<void>;
  initialData?: Partial<ProductData>;
  mode?: "create" | "edit";
}

export const ProductModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  mode = "create" 
}: ProductModalProps) => {
  const toast = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      price: 0,
      unit: "piece",
      description: "",
      stockQuantity: 0,
    },
  });

  // Reset form with initialData when modal opens or data changes
  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        name: initialData.name || "",
        sku: initialData.sku || "",
        category: initialData.category || "",
        price: initialData.price || 0,
        unit: initialData.unit || "piece",
        description: initialData.description || "",
        stockQuantity: initialData.stockQuantity || 0,
      });
    } else if (isOpen && !initialData) {
      reset({
        name: "",
        sku: "",
        category: "",
        price: 0,
        unit: "piece",
        description: "",
        stockQuantity: 0,
      });
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      // Generate ID for new products
      const productData: ProductData = {
        ...data,
        id: mode === "create" ? `product-${Date.now()}` : (initialData as any)?.id || `product-${Date.now()}`,
      };
      
      // Call the onSubmit prop if provided
      if (onSubmit) {
        await onSubmit(productData);
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
            {mode === "create" ? "Add New Product" : "Edit Product"}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Product Name */}
              <FormControl isInvalid={!!errors.name}>
                <FormLabel color="text.secondary">Product Name</FormLabel>
                <Input
                  {...register("name")}
                  placeholder="e.g., Premium Diesel"
                  bg="bg.input"
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              {/* SKU */}
              <FormControl isInvalid={!!errors.sku}>
                <FormLabel color="text.secondary">SKU (Stock Keeping Unit)</FormLabel>
                <Input
                  {...register("sku")}
                  placeholder="e.g., PRD-001"
                  bg="bg.input"
                />
                <FormErrorMessage>{errors.sku?.message}</FormErrorMessage>
              </FormControl>

              {/* Category */}
              <FormControl isInvalid={!!errors.category}>
                <FormLabel color="text.secondary">Category</FormLabel>
                <Input
                  {...register("category")}
                  placeholder="e.g., Fuel, Lubricants, Parts"
                  bg="bg.input"
                />
                <FormErrorMessage>{errors.category?.message}</FormErrorMessage>
              </FormControl>

              {/* Price */}
              <FormControl isInvalid={!!errors.price}>
                <FormLabel color="text.secondary">Price (per unit)</FormLabel>
                <Input
                  {...register("price", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 1.50"
                  bg="bg.input"
                />
                <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
              </FormControl>

              {/* Unit */}
              <FormControl isInvalid={!!errors.unit}>
                <FormLabel color="text.secondary">Unit</FormLabel>
                <Select
                  {...register("unit")}
                  bg="bg.input"
                  placeholder="Select unit"
                  sx={{
                    color: 'gray.900',
                    '& option': {
                      bg: 'bg.card',
                      color: 'text.primary',
                    }
                  }}
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="liter">Liter</option>
                  <option value="piece">Piece</option>
                  <option value="box">Box</option>
                  <option value="ton">Ton</option>
                </Select>
                <FormErrorMessage>{errors.unit?.message}</FormErrorMessage>
              </FormControl>

              {/* Stock Quantity */}
              <FormControl isInvalid={!!errors.stockQuantity}>
                <FormLabel color="text.secondary">Stock Quantity</FormLabel>
                <Input
                  {...register("stockQuantity", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  placeholder="e.g., 1000"
                  bg="bg.input"
                />
                <FormErrorMessage>{errors.stockQuantity?.message}</FormErrorMessage>
              </FormControl>

              {/* Description */}
              <FormControl isInvalid={!!errors.description}>
                <FormLabel color="text.secondary">Description</FormLabel>
                <Textarea
                  {...register("description")}
                  placeholder="e.g., High-quality premium diesel fuel for commercial vehicles"
                  bg="bg.input"
                  rows={3}
                />
                <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
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
              {mode === "create" ? "Create Product" : "Update Product"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

