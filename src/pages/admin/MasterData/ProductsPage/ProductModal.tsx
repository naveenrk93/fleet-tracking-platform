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
  HStack,
  Textarea,
  useToast,
  Select,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

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
      const productData: ProductData = {
        ...data,
        id: mode === "create" ? `product-${Date.now()}` : (initialData as any)?.id || `product-${Date.now()}`,
      };
      
      if (onSubmit) {
        await onSubmit(productData);
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
            {mode === "create" ? "Add New Product" : "Edit Product"}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              <FormControl isInvalid={!!errors.name}>
                <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
                  Product Name
                </FormLabel>
                <Input
                  {...register("name")}
                  placeholder="e.g., Premium Diesel"
                  bg="bg.input"
                  size={{ base: "md", md: "md" }}
                />
                <FormErrorMessage fontSize="sm">{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.sku}>
                <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
                  SKU (Stock Keeping Unit)
                </FormLabel>
                <Input
                  {...register("sku")}
                  placeholder="e.g., PRD-001"
                  bg="bg.input"
                  size={{ base: "md", md: "md" }}
                />
                <FormErrorMessage fontSize="sm">{errors.sku?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.category}>
                <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
                  Category
                </FormLabel>
                <Select
                  {...register("category")}
                  bg="bg.input"
                  placeholder="Select category"
                  size={{ base: "md", md: "md" }}
                  sx={{
                    color: 'gray.900',
                    '& option': {
                      bg: 'bg.card',
                      color: 'text.primary',
                    }
                  }}
                >
                  <option value="Fuel">Fuel</option>
                  <option value="Lubricants">Lubricants</option>
                  <option value="Parts">Parts</option>
                  <option value="Tires">Tires</option>
                  <option value="Batteries">Batteries</option>
                  <option value="Filters">Filters</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Consumables">Consumables</option>
                  <option value="Other">Other</option>
                </Select>
                <FormErrorMessage fontSize="sm">{errors.category?.message}</FormErrorMessage>
              </FormControl>

              <HStack spacing={{ base: 2, md: 3 }} align="flex-start">
                <FormControl isInvalid={!!errors.price} flex="1">
                  <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
                    Price (per unit)
                  </FormLabel>
                  <Input
                    {...register("price", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 1.50"
                    bg="bg.input"
                    size={{ base: "md", md: "md" }}
                  />
                  <FormErrorMessage fontSize="xs">{errors.price?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.stockQuantity} flex="1">
                  <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
                    Stock Quantity
                  </FormLabel>
                  <Input
                    {...register("stockQuantity", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    placeholder="e.g., 1000"
                    bg="bg.input"
                    size={{ base: "md", md: "md" }}
                  />
                  <FormErrorMessage fontSize="xs">{errors.stockQuantity?.message}</FormErrorMessage>
                </FormControl>
              </HStack>

              <FormControl isInvalid={!!errors.unit}>
                <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
                  Unit
                </FormLabel>
                <Select
                  {...register("unit")}
                  bg="bg.input"
                  placeholder="Select unit"
                  size={{ base: "md", md: "md" }}
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
                <FormErrorMessage fontSize="sm">{errors.unit?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
                  Description
                </FormLabel>
                <Textarea
                  {...register("description")}
                  placeholder="e.g., High-quality premium diesel fuel for commercial vehicles"
                  bg="bg.input"
                  rows={{ base: 2, md: 3 }}
                  size={{ base: "sm", md: "md" }}
                />
                <FormErrorMessage fontSize="sm">{errors.description?.message}</FormErrorMessage>
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
              {mode === "create" ? "Create Product" : "Update Product"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

