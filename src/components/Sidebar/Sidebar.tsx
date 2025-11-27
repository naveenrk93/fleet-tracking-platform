import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Icon, 
  Flex, 
  Collapse, 
  Image,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { 
  MdDashboard,
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
import { ROUTE_PATHS } from "../../app/routes.tsx";
import type { RootState } from "../../store.ts";
import { useState } from "react";
import fleetNitroLogo from "../../assets/images/fleet-nitro-logo.png";

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
    path: ROUTE_PATHS.ADMIN.DASHBOARD,
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { role } = useSelector((state: RootState) => state.user);
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({
    "Admin Dashboard": true, // Open by default
  });
  const isMobile = useBreakpointValue({ base: true, lg: false });

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

  const sidebarContent = (
    <>
      {/* Logo */}
      <Flex px={6} py={1} align="center" gap={2}>
        <Image
          src={fleetNitroLogo}
          alt="Fleet Nitro Logo"
          w="64px"
          h="64px"
          objectFit="contain"
        />
        <Text fontSize="xl" fontWeight="bold" color="text.primary">
          Fleet Nitro
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
              {hasSubItems && item.path ? (
                  // Item with both path and subitems (Admin Dashboard)
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
                  <Link 
                    to={item.path} 
                    style={{ textDecoration: "none", flex: 1 }}
                    onClick={() => {
                      if (!isExpanded) {
                        toggleExpand(item.label);
                      }
                      if (isMobile) onClose();
                    }}
                  >
                    <HStack spacing={3}>
                      <Icon as={item.icon} boxSize={5} />
                      <Text fontSize="sm" fontWeight="medium">
                        {item.label}
                      </Text>
                    </HStack>
                  </Link>
                  <Flex
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(item.label);
                    }}
                    width={"32px"}
                    height={"32px"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    borderRadius="md"
                    _hover={{ bg: "whiteAlpha.200" }}
                  >
                    <Icon as={isExpanded ? MdExpandLess : MdExpandMore} boxSize={5} />
                  </Flex>
                </HStack>
              ) : hasSubItems ? (
                // Item with only subitems (no path)
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
                // Item with only path (no subitems)
                <Link 
                  to={item.path!} 
                  style={{ textDecoration: "none" }}
                  onClick={() => isMobile && onClose()}
                >
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
                <Collapse in={isExpanded} animateOpacity unmountOnExit>
                  <VStack spacing={1} align="stretch" pl={3} mt={1}>
                    {item.subItems!.map((subItem) => {
                      const isSubActive = isPathActive(subItem.path);
                      return (
                        <Link 
                          key={subItem.path} 
                          to={subItem.path} 
                          style={{ textDecoration: "none" }}
                          onClick={() => isMobile && onClose()}
                        >
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
    </>
  );

  // Mobile: Render as Drawer
  if (isMobile) {
    return (
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        size="xs"
      >
        <DrawerOverlay />
        <DrawerContent bg="bg.sidebar">
          <DrawerCloseButton color="text.primary" />
          <DrawerBody p={0} overflowY="auto">
            {sidebarContent}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Render as fixed sidebar
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
      display={{ base: "none", lg: "block" }}
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
      {sidebarContent}
    </Box>
  );
};

