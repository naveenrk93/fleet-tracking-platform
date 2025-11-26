import { 
  Box, 
  Heading, 
  VStack, 
  Button, 
  HStack, 
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Text,
  Badge,
  IconButton,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from "@chakra-ui/react";
import { MdAdd, MdEdit, MdDelete, MdSearch } from "react-icons/md";
import { ProductModal, type ProductData } from "./ProductModal";
import { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct, type Product } from "../../../../services/api";

export const ProductsPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const toast = useToast();

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  // Handle form submission
  const handleProductSubmit = async (data: ProductData) => {
    try {
      if (mode === "create") {
        await createProduct(data);
        toast({
          title: "Product created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await updateProduct(data.id, data);
        toast({
          title: "Product updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      fetchProducts();
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

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setMode("edit");
    onOpen();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        toast({
          title: "Product deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchProducts();
      } catch (error) {
        toast({
          title: "Error deleting product",
          description: error instanceof Error ? error.message : "An error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setMode("create");
    onOpen();
  };

  // Get unique categories for filter
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Filter products based on search query and category filter
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      product.sku.toLowerCase().includes(query) ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.unit.toLowerCase().includes(query) ||
      product.price.toString().includes(query) ||
      product.stockQuantity.toString().includes(query)
    );
    
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Box>
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        {/* Page Header */}
        <HStack justify="space-between" flexWrap={{ base: "wrap", sm: "nowrap" }} gap={{ base: 3, md: 0 }}>
          <Heading size={{ base: "md", md: "lg" }} color="text.primary">
            Products Management
          </Heading>
          <Button
            colorScheme="purple"
            leftIcon={<MdAdd />}
            size={{ base: "sm", md: "md" }}
            onClick={handleAddNew}
            width={{ base: "full", sm: "auto" }}
          >
            Add Product
          </Button>
        </HStack>

        {/* Search Bar and Filters */}
        <HStack spacing={4} justifyContent="space-between" flexDirection={{ base: "column", md: "row" }} align="stretch">
          <InputGroup flex={{ base: "1", md: "1" }} maxW={{ md: "600px" }} minW={{ md: "300px" }}>
            <InputLeftElement pointerEvents="none">
              <MdSearch color="gray" size="20px" />
            </InputLeftElement>
            <Input
              placeholder="Search products by SKU, name, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="bg.card"
              borderColor="border.default"
              _hover={{ borderColor: "purple.400" }}
              _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
            />
          </InputGroup>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            bg="bg.card"
            borderColor="border.default"
            _hover={{ borderColor: "purple.400" }}
            _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" }}
            width={{ base: "100%", md: "200px" }}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
        </HStack>

        {/* Content */}
        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={{ base: 3, md: 6 }}
          minH="400px"
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="300px">
              <Spinner size="xl" color="purple.500" />
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="300px">
              <Text color="text.secondary" textAlign="center" px={4}>
                {searchQuery ? "No products found matching your search." : "No products found. Add your first product!"}
              </Text>
            </Box>
          ) : (
            <>
              {/* Desktop Table View */}
              <Box display={{ base: "none", lg: "block" }}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th color="text.secondary">SKU</Th>
                        <Th color="text.secondary">Name</Th>
                        <Th color="text.secondary">Category</Th>
                        <Th color="text.secondary">Price</Th>
                        <Th color="text.secondary">Unit</Th>
                        <Th color="text.secondary">Stock</Th>
                        <Th color="text.secondary">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredProducts.map((product) => (
                        <Tr key={product.id}>
                          <Td color="text.primary" fontWeight="medium">{product.sku}</Td>
                          <Td color="text.primary">{product.name}</Td>
                          <Td>
                            <Badge colorScheme="purple">{product.category}</Badge>
                          </Td>
                          <Td color="text.primary">${product.price.toFixed(2)}</Td>
                          <Td color="text.primary">{product.unit}</Td>
                          <Td color="text.primary">{product.stockQuantity.toLocaleString()}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Edit product"
                                icon={<MdEdit size={"20px"}/>}
                                size="md"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleEdit(product)}
                              />
                              <IconButton
                                aria-label="Delete product"
                                icon={<MdDelete size={"20px"}/>}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDelete(product.id)}
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Mobile Card View */}
              <VStack spacing={3} display={{ base: "flex", lg: "none" }} align="stretch">
                {filteredProducts.map((product) => (
                  <Box
                    key={product.id}
                    p={4}
                    borderRadius="md"
                    border="1px solid"
                    borderColor="border.default"
                    bg="bg.surface"
                  >
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between" align="flex-start">
                        <Box flex="1">
                          <HStack spacing={2} mb={1}>
                            <Text fontWeight="bold" color="text.primary" fontSize="md">
                              {product.name}
                            </Text>
                            <Badge colorScheme="purple">{product.category}</Badge>
                          </HStack>
                          <Text fontSize="sm" color="text.secondary">
                            SKU: {product.sku}
                          </Text>
                        </Box>
                        <HStack spacing={1}>
                          <IconButton
                            aria-label="Edit product"
                            icon={<MdEdit size={"18px"}/>}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEdit(product)}
                          />
                          <IconButton
                            aria-label="Delete product"
                            icon={<MdDelete size={"18px"}/>}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDelete(product.id)}
                          />
                        </HStack>
                      </HStack>
                      
                      <HStack spacing={4} fontSize="sm" flexWrap="wrap">
                        <Box>
                          <Text color="text.secondary" fontSize="xs">Price</Text>
                          <Text color="text.primary" fontWeight="medium">${product.price.toFixed(2)}</Text>
                        </Box>
                        <Box>
                          <Text color="text.secondary" fontSize="xs">Unit</Text>
                          <Text color="text.primary">{product.unit}</Text>
                        </Box>
                        <Box>
                          <Text color="text.secondary" fontSize="xs">Stock</Text>
                          <Text color="text.primary">{product.stockQuantity.toLocaleString()}</Text>
                        </Box>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </>
          )}
        </Box>
      </VStack>

      {/* Product Modal */}
      <ProductModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleProductSubmit}
        initialData={selectedProduct || undefined}
        mode={mode}
      />
    </Box>
  );
};

