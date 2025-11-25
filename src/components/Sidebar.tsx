import { Box, VStack, HStack, Text, Icon, Flex, Collapse } from "@chakra-ui/react";
import { 
  MdDashboard, 
  MdStorage,
  MdShoppingCart, 
  MdLocalShipping,
  MdInventory,
  MdMap,
  MdExpandMore,
  MdExpandLess,
  MdBusiness,
  MdStore,
  MdCategory,
  MdPerson,
  MdDirectionsCar,
  MdAccessTime,
  MdHistory,
  MdAssignment,
} from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROUTE_PATHS } from "../app/routes";
import type { RootState } from "../store";
import { useState } from "react";

interface SubMenuItem {
  label: string;
  path: string;
}

interface MenuItem {
  label: string;
  icon: any;
  path?: string;
  badge?: number;
  subItems?: SubMenuItem[];
}

const adminMenuItems: MenuItem[] = [
  { 
    label: "Admin Dashboard", 
    icon: MdDashboard, 
    path: ROUTE_PATHS.ADMIN.DASHBOARD 
  },
  { 
    label: "Master Data", 
    icon: MdStorage,
    subItems: [
      { label: "Hubs", path: ROUTE_PATHS.ADMIN.MASTER_DATA.HUBS },
      { label: "Terminals", path: ROUTE_PATHS.ADMIN.MASTER_DATA.TERMINALS },
      { label: "Products", path: ROUTE_PATHS.ADMIN.MASTER_DATA.PRODUCTS },
      { label: "Drivers", path: ROUTE_PATHS.ADMIN.MASTER_DATA.DRIVERS },
      { label: "Vehicles", path: ROUTE_PATHS.ADMIN.MASTER_DATA.VEHICLES },
    ]
  },
  { 
    label: "Orders", 
    icon: MdShoppingCart, 
    path: ROUTE_PATHS.ADMIN.ORDERS,
  },
  { 
    label: "Vehicle Allocation", 
    icon: MdLocalShipping, 
    path: ROUTE_PATHS.ADMIN.VEHICLE_ALLOCATION 
  },
  { 
    label: "Inventory", 
    icon: MdInventory, 
    path: ROUTE_PATHS.ADMIN.INVENTORY 
  },
  { 
    label: "Live Fleet", 
    icon: MdMap, 
    path: ROUTE_PATHS.ADMIN.LIVE_FLEET 
  },
];

const driverMenuItems: MenuItem[] = [
  { 
    label: "Shift View", 
    icon: MdAccessTime, 
    path: ROUTE_PATHS.DRIVER.SHIFT_VIEW 
  },
  { 
    label: "Live Map", 
    icon: MdMap, 
    path: ROUTE_PATHS.DRIVER.LIVE_MAP 
  },
  { 
    label: "Delivery Management", 
    icon: MdAssignment, 
    path: ROUTE_PATHS.DRIVER.DELIVERY_MANAGEMENT 
  },
  { 
    label: "Shift History", 
    icon: MdHistory, 
    path: ROUTE_PATHS.DRIVER.SHIFT_HISTORY 
  },
];

const getSubMenuIcon = (label: string) => {
  switch(label) {
    case "Hubs": return MdBusiness;
    case "Terminals": return MdStore;
    case "Products": return MdCategory;
    case "Drivers": return MdPerson;
    case "Vehicles": return MdDirectionsCar;
    default: return MdCategory;
  }
};

export const Sidebar = () => {
  const location = useLocation();
  const { role } = useSelector((state: RootState) => state.user);
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({
    "Master Data": true, // Open by default
  });

  const menuItems = role === "admin" ? adminMenuItems : driverMenuItems;

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const isPathActive = (path: string) => {
    return location.pathname === path;
  };

  const isParentActive = (subItems?: SubMenuItem[]) => {
    if (!subItems) return false;
    return subItems.some(item => location.pathname === item.path);
  };

  return (
    <Box
      w="260px"
      bg="bg.sidebar"
      h="100vh"
      position="fixed"
      left={0}
      top={0}
      overflowY="auto"
      borderRight="1px solid"
      borderColor="border.default"
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'var(--chakra-colors-scrollbar-thumb)',
          borderRadius: '24px',
        },
      }}
    >
      {/* Logo */}
      <Flex px={6} py={5} align="center" gap={2}>
        <Box
          w="32px"
          h="32px"
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          borderRadius="8px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          fontWeight="bold"
          fontSize="lg"
        >
          F
        </Box>
        <Text fontSize="xl" fontWeight="bold" color="text.primary">
          FleetTrack
        </Text>
      </Flex>

      {/* Menu Items */}
      <VStack spacing={1} align="stretch" px={3} py={2}>
        {menuItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedItems[item.label];
          const isActive = item.path ? isPathActive(item.path) : isParentActive(item.subItems);
          
          return (
            <Box key={item.label}>
              {/* Main Menu Item */}
              {hasSubItems ? (
                <HStack
                  px={3}
                  py={2.5}
                  borderRadius="md"
                  bg={isActive ? "purple.500" : "transparent"}
                  color={isActive ? "white" : "text.menu"}
                  _hover={{
                    bg: isActive ? "purple.600" : "bg.hover",
                    color: "white",
                  }}
                  cursor="pointer"
                  transition="all 0.2s"
                  justify="space-between"
                  onClick={() => toggleExpand(item.label)}
                >
                  <HStack spacing={3}>
                    <Icon as={item.icon} boxSize={5} />
                    <Text fontSize="sm" fontWeight="medium">
                      {item.label}
                    </Text>
                  </HStack>
                  <Icon as={isExpanded ? MdExpandLess : MdExpandMore} boxSize={5} />
                </HStack>
              ) : (
                <Link to={item.path!} style={{ textDecoration: "none" }}>
                  <HStack
                    px={3}
                    py={2.5}
                    borderRadius="md"
                    bg={isActive ? "purple.500" : "transparent"}
                    color={isActive ? "white" : "text.menu"}
                    _hover={{
                      bg: isActive ? "purple.600" : "bg.hover",
                      color: "white",
                    }}
                    cursor="pointer"
                    transition="all 0.2s"
                    justify="space-between"
                  >
                    <HStack spacing={3}>
                      <Icon as={item.icon} boxSize={5} />
                      <Text fontSize="sm" fontWeight="medium">
                        {item.label}
                      </Text>
                    </HStack>
                    {item.badge && (
                      <Box
                        bg="red.500"
                        color="white"
                        fontSize="xs"
                        fontWeight="bold"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        minW="20px"
                        textAlign="center"
                      >
                        {item.badge}
                      </Box>
                    )}
                  </HStack>
                </Link>
              )}

              {/* Sub Menu Items */}
              {hasSubItems && (
                <Collapse in={isExpanded} animateOpacity>
                  <VStack spacing={1} align="stretch" pl={3} mt={1}>
                    {item.subItems!.map((subItem) => {
                      const isSubActive = isPathActive(subItem.path);
                      return (
                        <Link key={subItem.path} to={subItem.path} style={{ textDecoration: "none" }}>
                          <HStack
                            px={3}
                            py={2}
                            borderRadius="md"
                            bg={isSubActive ? "purple.500" : "transparent"}
                            color={isSubActive ? "white" : "text.menu"}
                            _hover={{
                              bg: isSubActive ? "purple.600" : "bg.hover",
                              color: "white",
                            }}
                            cursor="pointer"
                            transition="all 0.2s"
                            pl={4}
                          >
                            <Icon as={getSubMenuIcon(subItem.label)} boxSize={4} />
                            <Text fontSize="sm" fontWeight="medium">
                              {subItem.label}
                            </Text>
                          </HStack>
                        </Link>
                      );
                    })}
                  </VStack>
                </Collapse>
              )}
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

