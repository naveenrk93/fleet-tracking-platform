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
import { MdDelete } from "react-icons/md";
import { getProducts, type Product, type HubProduct } from "../../../../services/api";

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
      updated[index] = {
        productId: product.id,
        productName: product.name,
        quantity: updated[index].quantity || 0,
      };
    } else {
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
      const hubData: any = {
        ...data,
        products: hubProducts,
      };
      
      if (mode === "edit" && initialData?.id) {
        hubData.id = initialData.id;
      }
      
      if (onSubmit) {
        await onSubmit(hubData);
      }
      
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
    <Modal 
      isOpen={isOpen} 
      onClose={handleCancel} 
      size={{ base: "full", sm: "md", md: "xl" }}
      scrollBehavior="inside"
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
            {mode === "create" ? "Add New Hub" : "Edit Hub"}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              <FormControl isInvalid={!!errors.name}>
                <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
                  Hub Name
                </FormLabel>
                <Input
                  {...register("name")}
                  placeholder="e.g., Downtown Distribution Hub"
                  bg="bg.input"
                  size={{ base: "md", md: "md" }}
                  sx={{ _dark: { color: "gray.900" } }}
                />
                <FormErrorMessage fontSize="sm">{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <Input {...register("type")} type="hidden" value="hub" />

              <FormControl isInvalid={!!errors.address}>
                <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
                  Address
                </FormLabel>
                <Textarea
                  {...register("address")}
                  placeholder="e.g., 123 Main St, City"
                  bg="bg.input"
                  rows={3}
                  size={{ base: "sm", md: "md" }}
                  sx={{ _dark: { color: "gray.900" } }}
                />
                <FormErrorMessage fontSize="sm">{errors.address?.message}</FormErrorMessage>
              </FormControl>

              <HStack spacing={{ base: 2, md: 3 }} align="flex-start">
                <FormControl isInvalid={!!errors.coordinates?.lat} flex="1">
                  <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
                    Latitude
                  </FormLabel>
                  <Input
                    {...register("coordinates.lat", { valueAsNumber: true })}
                    type="number"
                    step="any"
                    placeholder="e.g., 40.7128"
                    bg="bg.input"
                    size={{ base: "md", md: "md" }}
                    sx={{ _dark: { color: "gray.900" } }}
                  />
                  <FormErrorMessage fontSize="xs">{errors.coordinates?.lat?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.coordinates?.lng} flex="1">
                  <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
                    Longitude
                  </FormLabel>
                  <Input
                    {...register("coordinates.lng", { valueAsNumber: true })}
                    type="number"
                    step="any"
                    placeholder="e.g., -74.0060"
                    bg="bg.input"
                    size={{ base: "md", md: "md" }}
                    sx={{ _dark: { color: "gray.900" } }}
                  />
                  <FormErrorMessage fontSize="xs">{errors.coordinates?.lng?.message}</FormErrorMessage>
                </FormControl>
              </HStack>

              <Divider my={{ base: 2, md: 4 }} />
              
              <Heading size={{ base: "xs", md: "sm" }} color="text.primary" mb={{ base: 2, md: 3 }}>
                Hub Products
              </Heading>

              {/* Product Rows */}
              <VStack align="stretch" spacing={{ base: 2, md: 3 }}>
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
                      <Box key={index}>
                        <VStack spacing={2} align="stretch" display={{ base: "flex", sm: "none" }}>
                          <FormControl>
                            {index === 0 && (
                              <FormLabel color="text.secondary" fontSize="xs" mb={1}>
                                Product
                              </FormLabel>
                            )}
                            <Select
                              placeholder="Select a product"
                              value={product.productId}
                              onChange={(e) => handleProductSelect(index, e.target.value)}
                              bg="bg.input"
                              isDisabled={loadingProducts}
                              size="sm"
                              sx={{ _dark: { color: "gray.900" } }}
                            >
                              {availableProducts.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.sku})
                                </option>
                              ))}
                            </Select>
                          </FormControl>

                          <HStack spacing={2}>
                            <FormControl flex="1">
                              {index === 0 && (
                                <FormLabel color="text.secondary" fontSize="xs" mb={1}>
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
                                size="sm"
                                sx={{ _dark: { color: "gray.900" } }}
                              />
                            </FormControl>
                            {!isLastRow && (
                              <IconButton
                                aria-label="Remove product"
                                icon={<MdDelete />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleRemoveProduct(index)}
                                type="button"
                                mt={index === 0 ? 5 : 0}
                              />
                            )}
                          </HStack>
                        </VStack>

                        <HStack spacing={2} display={{ base: "none", sm: "flex" }}>
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
                              sx={{ _dark: { color: "gray.900" } }}
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
                              sx={{ _dark: { color: "gray.900" } }}
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
                      </Box>
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
              {mode === "create" ? "Create Hub" : "Update Hub"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

