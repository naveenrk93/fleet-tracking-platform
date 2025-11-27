import { ReactNode } from "react";
import { 
  Box, 
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  HStack,
  VStack,
  IconButton,
  Skeleton,
} from "@chakra-ui/react";
import { MdEdit, MdDelete, MdArrowUpward, MdArrowDownward } from "react-icons/md";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  mobileRender?: (item: T) => ReactNode;
  width?: string;
  skeletonWidth?: string;
}

export interface MobileField<T> {
  label: string;
  render: (item: T) => ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading: boolean;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  emptyMessage?: string;
  getItemId: (item: T) => string;
  mobileTitle?: (item: T) => ReactNode;
  mobileSubtitle?: (item: T) => ReactNode;
  mobileFields?: MobileField<T>[];
  mobileBreakpoint?: "sm" | "md" | "lg" | "xl";
  skeletonCount?: number;
}

export function DataTable<T>({
  data,
  columns,
  loading,
  onEdit,
  onDelete,
  sortField,
  sortDirection,
  onSort,
  emptyMessage = "No data found.",
  getItemId,
  mobileTitle,
  mobileSubtitle,
  mobileFields = [],
  mobileBreakpoint = "md",
  skeletonCount = 5,
}: DataTableProps<T>) {
  const renderSkeletonRow = (index: number) => (
    <Tr key={`skeleton-${index}`}>
      {columns.map((col, colIndex) => (
        <Td key={`skeleton-${index}-${colIndex}`}>
          <Skeleton height="20px" width={col.skeletonWidth || "100px"} />
        </Td>
      ))}
      <Td>
        <HStack spacing={2}>
          <Skeleton height="32px" width="32px" borderRadius="md" />
          <Skeleton height="32px" width="32px" borderRadius="md" />
        </HStack>
      </Td>
    </Tr>
  );

  const renderSkeletonCard = (index: number) => (
    <Box
      key={`skeleton-card-${index}`}
      p={4}
      borderRadius="md"
      border="1px solid"
      borderColor="border.default"
      bg="bg.surface"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between" align="flex-start">
          <Box flex="1">
            <Skeleton height="20px" width="140px" mb={2} />
            <Skeleton height="16px" width="200px" />
          </Box>
          <HStack spacing={1}>
            <Skeleton height="32px" width="32px" borderRadius="md" />
            <Skeleton height="32px" width="32px" borderRadius="md" />
          </HStack>
        </HStack>
        
        <HStack spacing={4}>
          <Box>
            <Skeleton height="14px" width="70px" mb={1} />
            <Skeleton height="16px" width="90px" />
          </Box>
          <Box>
            <Skeleton height="14px" width="60px" mb={1} />
            <Skeleton height="16px" width="70px" />
          </Box>
        </HStack>
      </VStack>
    </Box>
  );

  if (loading) {
    return (
      <>
        {/* Desktop Skeleton View */}
        <Box display={{ base: "none", [mobileBreakpoint]: "block" }}>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  {columns.map((col, index) => (
                    <Th key={`header-${index}`} color="text.secondary">
                      {col.label}
                    </Th>
                  ))}
                  <Th color="text.secondary">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {[...Array(skeletonCount)].map((_, index) => renderSkeletonRow(index))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        {/* Mobile Skeleton View */}
        <VStack spacing={3} display={{ base: "flex", [mobileBreakpoint]: "none" }} align="stretch">
          {[...Array(3)].map((_, index) => renderSkeletonCard(index))}
        </VStack>
      </>
    );
  }

  if (data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="300px">
        <Text color="text.secondary" textAlign="center" px={4}>
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <Box display={{ base: "none", [mobileBreakpoint]: "block" }}>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                {columns.map((col, index) => (
                  <Th 
                    key={`header-${index}`}
                    color="text.secondary"
                    cursor={col.sortable ? "pointer" : "default"}
                    onClick={() => col.sortable && onSort(col.key)}
                    _hover={col.sortable ? { color: "purple.400" } : undefined}
                    width={col.width}
                  >
                    {col.sortable ? (
                      <HStack spacing={1}>
                        <Text>{col.label}</Text>
                        {sortField === col.key && (
                          sortDirection === "asc" ? <MdArrowUpward /> : <MdArrowDownward />
                        )}
                      </HStack>
                    ) : (
                      col.label
                    )}
                  </Th>
                ))}
                <Th color="text.secondary">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((item) => (
                <Tr key={getItemId(item)}>
                  {columns.map((col, colIndex) => (
                    <Td key={`${getItemId(item)}-${colIndex}`} color="text.primary">
                      {col.render ? col.render(item) : String((item as any)[col.key] || "")}
                    </Td>
                  ))}
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Edit"
                        icon={<MdEdit size={"20px"}/>}
                        size="md"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => onEdit(item)}
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<MdDelete size={"20px"}/>}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => onDelete(getItemId(item))}
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
      <VStack spacing={3} display={{ base: "flex", [mobileBreakpoint]: "none" }} align="stretch">
        {data.map((item) => (
          <Box
            key={getItemId(item)}
            p={4}
            borderRadius="md"
            border="1px solid"
            borderColor="border.default"
            bg="bg.surface"
          >
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between" align="flex-start">
                <Box flex="1">
                  {mobileTitle && (
                    <Box mb={mobileSubtitle ? 1 : 0}>
                      {mobileTitle(item)}
                    </Box>
                  )}
                  {mobileSubtitle && (
                    <Box>
                      {mobileSubtitle(item)}
                    </Box>
                  )}
                </Box>
                <HStack spacing={1}>
                  <IconButton
                    aria-label="Edit"
                    icon={<MdEdit size={"18px"}/>}
                    size="sm"
                    colorScheme="blue"
                    variant="ghost"
                    onClick={() => onEdit(item)}
                  />
                  <IconButton
                    aria-label="Delete"
                    icon={<MdDelete size={"18px"}/>}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => onDelete(getItemId(item))}
                  />
                </HStack>
              </HStack>
              
              {mobileFields.length > 0 && (
                <HStack spacing={4} fontSize="sm" flexWrap="wrap">
                  {mobileFields.map((field, index) => (
                    <Box key={index}>
                      <Text color="text.secondary" fontSize="xs">{field.label}</Text>
                      {field.render(item)}
                    </Box>
                  ))}
                </HStack>
              )}
            </VStack>
          </Box>
        ))}
      </VStack>
    </>
  );
}

