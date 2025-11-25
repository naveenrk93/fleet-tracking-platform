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
  HStack,
  IconButton,
  Box,
  Text,
  Divider,
  Heading,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { MdAdd, MdDelete } from "react-icons/md";
import { getProducts, type Product, type HubProduct } from "../../../../services/api";

// Zod validation schema for Hub
const hubSchema = z.object({
  name: z.string().min(1, "Hub name is required").min(3, "Hub name must be at least 3 characters"),
  type: z.literal("hub"),
  address: z.string().min(1, "Address is required").min(10, "Address must be at least 10 characters"),
  coordinates: z.object({
    lat: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
    lng: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
  }),
  products: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number().min(0),
  })).optional(),
});

type HubFormData = z.infer<typeof hubSchema>;

export type HubData = HubFormData & {
  id: string;
};

interface HubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: HubData) => void | Promise<void>;
  initialData?: Partial<HubData>;
  mode?: "create" | "edit";
}

export const HubModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  mode = "create" 
}: HubModalProps) => {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [hubProducts, setHubProducts] = useState<HubProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<HubFormData>({
    resolver: zodResolver(hubSchema),
    defaultValues: {
      name: "",
      type: "hub",
      address: "",
      coordinates: {
        lat: 0,
        lng: 0,
      },
      products: [],
    },
  });

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        toast({
          title: "Error fetching products",
          description: error instanceof Error ? error.message : "An error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoadingProducts(false);
      }
    };
    
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, toast]);

  // Reset form and initialize hub products when modal opens or data changes
  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        name: initialData.name || "",
        type: "hub",
        address: initialData.address || "",
        coordinates: {
          lat: initialData.coordinates?.lat || 0,
          lng: initialData.coordinates?.lng || 0,
        },
        products: initialData.products || [],
      });
      setHubProducts(initialData.products || []);
    } else if (isOpen && !initialData) {
      reset({
        name: "",
        type: "hub",
        address: "",
        coordinates: {
          lat: 0,
          lng: 0,
        },
        products: [],
      });
      setHubProducts([]);
    }
  }, [isOpen, initialData, reset]);

  const handleProductSelect = (index: number, productId: string) => {
    if (!productId) {
      // If cleared, remove the product at this index if it exists
      if (index < hubProducts.length) {
        const updated = [...hubProducts];
        updated.splice(index, 1);
        setHubProducts(updated);
      }
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const updated = [...hubProducts];
    
    if (index < hubProducts.length) {
      // Update existing product
      updated[index] = {
        productId: product.id,
        productName: product.name,
        quantity: updated[index].quantity || 0,
      };
    } else {
      // Add new product
      updated.push({
        productId: product.id,
        productName: product.name,
        quantity: 0,
      });
    }
    
    setHubProducts(updated);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...hubProducts];
    if (index < updated.length) {
      updated[index].quantity = quantity;
      setHubProducts(updated);
    }
  };

  const handleRemoveProduct = (index: number) => {
    const updated = [...hubProducts];
    updated.splice(index, 1);
    setHubProducts(updated);
  };

  const handleFormSubmit = async (data: HubFormData) => {
    try {
      // Prepare hub data with products
      const hubData: any = {
        ...data,
        products: hubProducts,
      };
      
      // Include ID only for edit mode
      if (mode === "edit" && initialData?.id) {
        hubData.id = initialData.id;
      }
      
      // Call the onSubmit prop if provided
      if (onSubmit) {
        await onSubmit(hubData);
      }
      
      // Reset form and close modal
      reset();
      setHubProducts([]);
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
    setHubProducts([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="xl">
      <ModalOverlay />
      <ModalContent bg="bg.card" borderColor="border.default">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader color="text.primary">
            {mode === "create" ? "Add New Hub" : "Edit Hub"}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Hub Name */}
              <FormControl isInvalid={!!errors.name}>
                <FormLabel color="text.secondary">Hub Name</FormLabel>
                <Input
                  {...register("name")}
                  placeholder="e.g., Downtown Distribution Hub"
                  bg="bg.input"
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              {/* Type - Hidden field, always "hub" */}
              <Input {...register("type")} type="hidden" value="hub" />

              {/* Address */}
              <FormControl isInvalid={!!errors.address}>
                <FormLabel color="text.secondary">Address</FormLabel>
                <Textarea
                  {...register("address")}
                  placeholder="e.g., 123 Main St, City"
                  bg="bg.input"
                  rows={3}
                />
                <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
              </FormControl>

              {/* Coordinates */}
              <FormControl isInvalid={!!errors.coordinates?.lat}>
                <FormLabel color="text.secondary">Latitude</FormLabel>
                <Input
                  {...register("coordinates.lat", { valueAsNumber: true })}
                  type="number"
                  step="any"
                  placeholder="e.g., 40.7128"
                  bg="bg.input"
                />
                <FormErrorMessage>{errors.coordinates?.lat?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.coordinates?.lng}>
                <FormLabel color="text.secondary">Longitude</FormLabel>
                <Input
                  {...register("coordinates.lng", { valueAsNumber: true })}
                  type="number"
                  step="any"
                  placeholder="e.g., -74.0060"
                  bg="bg.input"
                />
                <FormErrorMessage>{errors.coordinates?.lng?.message}</FormErrorMessage>
              </FormControl>

              {/* Products Section */}
              <Divider my={4} />
              
              <Heading size="sm" color="text.primary" mb={3}>
                Hub Products
              </Heading>

              {/* Product Rows */}
              <VStack align="stretch" spacing={3}>
                {(() => {
                  const availableProductsForNew = products.filter(
                    p => !hubProducts.some(hp => hp.productId === p.id)
                  );
                  const hasAvailableProducts = availableProductsForNew.length > 0;
                  const rowsToRender = hasAvailableProducts 
                    ? [...hubProducts, { productId: "", productName: "", quantity: 0 }]
                    : hubProducts;
                  
                  return rowsToRender.map((product, index) => {
                    const isLastRow = index === hubProducts.length;
                    const availableProducts = products.filter(
                      p => !hubProducts.some((hp, idx) => hp.productId === p.id && idx !== index)
                    );

                    return (
                    <HStack key={index} spacing={2}>
                      <FormControl flex="2">
                        {index === 0 && (
                          <FormLabel color="text.secondary" fontSize="sm" mb={1}>
                            Product
                          </FormLabel>
                        )}
                        <Select
                          placeholder="Select a product"
                          value={product.productId}
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                          bg="bg.input"
                          isDisabled={loadingProducts}
                        >
                          {availableProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl flex="1">
                        {index === 0 && (
                          <FormLabel color="text.secondary" fontSize="sm" mb={1}>
                            Quantity
                          </FormLabel>
                        )}
                        <Input
                          type="number"
                          min="0"
                          value={product.quantity || ""}
                          onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                          placeholder="0"
                          bg="bg.input"
                          isDisabled={!product.productId}
                        />
                      </FormControl>

                      <Box pt={index === 0 ? 7 : 0}>
                        {!isLastRow && (
                          <IconButton
                            aria-label="Remove product"
                            icon={<MdDelete />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleRemoveProduct(index)}
                            type="button"
                          />
                        )}
                        {isLastRow && <Box w="40px" />}
                      </Box>
                    </HStack>
                    );
                  });
                })()}

                {hubProducts.length === 0 && (
                  <Text color="text.secondary" fontSize="sm" py={2}>
                    Select a product to add it to the hub
                  </Text>
                )}
              </VStack>
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
              {mode === "create" ? "Create Hub" : "Update Hub"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

