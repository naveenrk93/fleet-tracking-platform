import { 
  Box, 
  VStack, 
  HStack, 
  useDisclosure,
  Text,
  Badge,
  useToast,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";
import { ProductModal, type ProductData } from "./ProductModal";
import { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct, type Product } from "../../../../services/api";
import { 
  DataTable, 
  SearchInput, 
  PageHeader,
  ConfirmDialog,
  type Column, 
  type MobileField 
} from "../../../../components";

export const ProductsPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"sku" | "name" | "category" | "price" | "stockQuantity">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const toast = useToast();
  const selectTextColor = useColorModeValue("gray.800", "whiteAlpha.900");

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
    setProductToDelete(id);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete);
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
    } finally {
      setProductToDelete(null);
    }
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setMode("create");
    onOpen();
  };

  const handleSort = (field: "sku" | "name" | "category" | "price" | "stockQuantity") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

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

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    if (sortField === "price" || sortField === "stockQuantity") {
      aValue = a[sortField];
      bValue = b[sortField];
    } else {
      aValue = a[sortField].toLowerCase();
      bValue = b[sortField].toLowerCase();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const columns: Column<Product>[] = [
    {
      key: "sku",
      label: "SKU",
      sortable: true,
      render: (product) => <Text fontWeight="medium">{product.sku}</Text>,
      skeletonWidth: "100px",
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      skeletonWidth: "150px",
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (product) => <Badge colorScheme="purple">{product.category}</Badge>,
      skeletonWidth: "80px",
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (product) => <Text>${product.price.toFixed(2)}</Text>,
      skeletonWidth: "70px",
    },
    {
      key: "unit",
      label: "Unit",
      skeletonWidth: "60px",
    },
    {
      key: "stockQuantity",
      label: "Stock",
      sortable: true,
      render: (product) => <Text>{product.stockQuantity.toLocaleString()}</Text>,
      skeletonWidth: "70px",
    },
  ];

  const mobileFields: MobileField<Product>[] = [
    {
      label: "Price",
      render: (product) => (
        <Text color="text.primary" fontWeight="medium">${product.price.toFixed(2)}</Text>
      ),
    },
    {
      label: "Unit",
      render: (product) => (
        <Text color="text.primary">{product.unit}</Text>
      ),
    },
    {
      label: "Stock",
      render: (product) => (
        <Text color="text.primary">{product.stockQuantity.toLocaleString()}</Text>
      ),
    },
  ];

  return (
    <Box>
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        <PageHeader 
          title="Products Management" 
          actionLabel="Add Product"
          onActionClick={handleAddNew}
        />

        {/* Search Bar and Filters */}
        <HStack spacing={4} justifyContent="space-between" flexDirection={{ base: "column", md: "row" }} align="stretch">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products by SKU, name, category..."
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            bg="bg.card"
            borderColor="border.default"
            color={selectTextColor}
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

        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={{ base: 3, md: 6 }}
          minH="400px"
        >
          <DataTable<Product>
            data={sortedProducts}
            columns={columns}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={(field) => handleSort(field as "sku" | "name" | "category" | "price" | "stockQuantity")}
            emptyMessage={searchQuery ? "No products found matching your search." : "No products found. Add your first product!"}
            getItemId={(product) => product.id}
            mobileTitle={(product) => (
              <HStack spacing={2} mb={1}>
                <Text fontWeight="bold" color="text.primary" fontSize="md">
                  {product.name}
                </Text>
                <Badge colorScheme="purple">{product.category}</Badge>
              </HStack>
            )}
            mobileSubtitle={(product) => (
              <Text fontSize="sm" color="text.secondary">
                SKU: {product.sku}
              </Text>
            )}
            mobileFields={mobileFields}
            mobileBreakpoint="lg"
          />
        </Box>
      </VStack>

      <ProductModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleProductSubmit}
        initialData={selectedProduct || undefined}
        mode={mode}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        confirmColorScheme="red"
      />
    </Box>
  );
};

