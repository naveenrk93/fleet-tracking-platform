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
import { getProducts, type Product, type TerminalProduct } from "../../../../services/api";

const terminalSchema = z.object({
  name: z.string().min(1, "Terminal name is required").min(3, "Terminal name must be at least 3 characters"),
  type: z.literal("terminal"),
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

type TerminalFormData = z.infer<typeof terminalSchema>;

export type TerminalData = TerminalFormData & {
  id: string;
};

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: TerminalData) => void | Promise<void>;
  initialData?: Partial<TerminalData>;
  mode?: "create" | "edit";
}

export const TerminalModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  mode = "create" 
}: TerminalModalProps) => {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [terminalProducts, setTerminalProducts] = useState<TerminalProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TerminalFormData>({
    resolver: zodResolver(terminalSchema),
    defaultValues: {
      name: "",
      type: "terminal",
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
        type: "terminal",
        address: initialData.address || "",
        coordinates: {
          lat: initialData.coordinates?.lat || 0,
          lng: initialData.coordinates?.lng || 0,
        },
        products: initialData.products || [],
      });
      setTerminalProducts(initialData.products || []);
    } else if (isOpen && !initialData) {
      reset({
        name: "",
        type: "terminal",
        address: "",
        coordinates: {
          lat: 0,
          lng: 0,
        },
        products: [],
      });
      setTerminalProducts([]);
    }
  }, [isOpen, initialData, reset]);

  const handleProductSelect = (index: number, productId: string) => {
    if (!productId) {
      if (index < terminalProducts.length) {
        const updated = [...terminalProducts];
        updated.splice(index, 1);
        setTerminalProducts(updated);
      }
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const updated = [...terminalProducts];
    
    if (index < terminalProducts.length) {
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
    
    setTerminalProducts(updated);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...terminalProducts];
    if (index < updated.length) {
      updated[index].quantity = quantity;
      setTerminalProducts(updated);
    }
  };

  const handleRemoveProduct = (index: number) => {
    const updated = [...terminalProducts];
    updated.splice(index, 1);
    setTerminalProducts(updated);
  };

  const handleFormSubmit = async (data: TerminalFormData) => {
    try {
      const terminalData: any = {
        ...data,
        products: terminalProducts,
      };
      
      if (mode === "edit" && initialData?.id) {
        terminalData.id = initialData.id;
      }
      
      if (onSubmit) {
        await onSubmit(terminalData);
      }
      
      reset();
      setTerminalProducts([]);
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
    setTerminalProducts([]);
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
            {mode === "create" ? "Add New Terminal" : "Edit Terminal"}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              {/* Terminal Name */}
              <FormControl isInvalid={!!errors.name}>
                <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
                  Terminal Name
                </FormLabel>
                <Input
                  {...register("name")}
                  placeholder="e.g., North Terminal Station"
                  bg="bg.input"
                  size={{ base: "md", md: "md" }}
                  sx={{ _dark: { color: "gray.900" } }}
                />
                <FormErrorMessage fontSize="sm">{errors.name?.message}</FormErrorMessage>
              </FormControl>

              {/* Type - Hidden field, always "terminal" */}
              <Input {...register("type")} type="hidden" value="terminal" />

              {/* Address */}
              <FormControl isInvalid={!!errors.address}>
                <FormLabel color="text.secondary" fontSize={{ base: "sm", md: "md" }}>
                  Address
                </FormLabel>
                <Textarea
                  {...register("address")}
                  placeholder="e.g., 456 Terminal Rd, City"
                  bg="bg.input"
                  rows={3}
                  size={{ base: "sm", md: "md" }}
                  sx={{ _dark: { color: "gray.900" } }}
                />
                <FormErrorMessage fontSize="sm">{errors.address?.message}</FormErrorMessage>
              </FormControl>

              {/* Coordinates */}
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

              {/* Products Section */}
              <Divider my={{ base: 2, md: 4 }} />
              
              <Heading size={{ base: "xs", md: "sm" }} color="text.primary" mb={{ base: 2, md: 3 }}>
                Terminal Products
              </Heading>

              {/* Product Rows */}
              <VStack align="stretch" spacing={{ base: 2, md: 3 }}>
                {(() => {
                  const availableProductsForNew = products.filter(
                    p => !terminalProducts.some(tp => tp.productId === p.id)
                  );
                  const hasAvailableProducts = availableProductsForNew.length > 0;
                  const rowsToRender = hasAvailableProducts 
                    ? [...terminalProducts, { productId: "", productName: "", quantity: 0 }]
                    : terminalProducts;
                  
                  return rowsToRender.map((product, index) => {
                    const isLastRow = hasAvailableProducts && index === terminalProducts.length;
                    const availableProducts = products.filter(
                      p => !terminalProducts.some((tp, idx) => tp.productId === p.id && idx !== index)
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
                      {/* Desktop: Horizontal Layout */}
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

                {terminalProducts.length === 0 && (
                  <Text color="text.secondary" fontSize="sm" py={2}>
                    Select a product to add it to the terminal
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
              {mode === "create" ? "Create Terminal" : "Update Terminal"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

