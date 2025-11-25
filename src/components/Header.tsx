import { 
  Flex, 
  HStack,
  InputGroup, 
  InputLeftElement, 
  Input,
  Avatar,
  Box,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  useColorMode,
  Badge,
  Button
} from "@chakra-ui/react";
import { MdSearch, MdLightMode, MdDarkMode, MdPerson, MdSettings, MdLogout, MdSwapHoriz, MdAdminPanelSettings, MdLocalShipping } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleColorMode as toggleColorModeRedux } from "../store/themeSlice";
import { toggleUserRole } from "../store/userSlice";
import { ROUTE_PATHS } from "../app/routes";
import type { RootState } from "../store";

export const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const { role, name, email } = useSelector((state: RootState) => state.user);

  const handleToggleTheme = () => {
    toggleColorMode();
    dispatch(toggleColorModeRedux());
  };

  const handleToggleRole = () => {
    dispatch(toggleUserRole());
    // Navigate to the appropriate dashboard based on new role
    if (role === "admin") {
      navigate(ROUTE_PATHS.DRIVER.SHIFT_VIEW);
    } else {
      navigate(ROUTE_PATHS.ADMIN.DASHBOARD);
    }
  };

  return (
    <Flex
      as="header"
      h="70px"
      px={6}
      align="center"
      justify="space-between"
      bg="bg.header"
      borderBottom="1px solid"
      borderColor="border.default"
      position="sticky"
      top={0}
      zIndex={10}
    >
      {/* Search Bar */}
      <InputGroup maxW="400px">
        <InputLeftElement pointerEvents="none">
          <Icon as={MdSearch} color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search (Ctrl+/)"
          bg="bg.search"
          border="none"
          _placeholder={{ color: "gray.400" }}
          _focus={{ bg: "bg.search.focus" }}
        />
      </InputGroup>

      {/* Right Side Icons */}
      <HStack spacing={4}>
        {/* Role Badge */}
        <Badge
          colorScheme={role === "admin" ? "purple" : "blue"}
          fontSize="sm"
          px={4}
          py={1}
          borderRadius="4px"
          textTransform="uppercase"
          fontWeight="bold"
          display="flex"
          alignItems="center"
          gap={1}
          border="2px solid"
          borderColor={role === "admin" ? "purple.600" : "blue.600"}
        >
          <Icon as={role === "admin" ? MdAdminPanelSettings : MdLocalShipping} boxSize={4} marginRight={"6px"}/>
          {role}
        </Badge>

        <Menu>
          <MenuButton>
            <Avatar
              size="md"
              name={name}
              src="https://bit.ly/broken-link"
              bg="purple.500"
              cursor="pointer"
            />
          </MenuButton>
          <MenuList bg="bg.surface" borderColor="border.default">
            <Box px={3} py={2}>
              <Text fontWeight="bold">{name}</Text>
              <Text fontSize="sm" color="gray.500">{email}</Text>
            </Box>
            <MenuDivider />
            <MenuItem icon={<MdPerson />} bg="bg.surface" _hover={{ bg: "bg.hover" }}>
              Profile
            </MenuItem>
            <MenuItem icon={<MdSettings />} bg="bg.surface" _hover={{ bg: "bg.hover" }}>
              Settings
            </MenuItem>
            <MenuDivider />
            <Box px={3} py={2}>
              <Button
                leftIcon={<MdSwapHoriz />}
                size="sm"
                width="100%"
                colorScheme={role === "admin" ? "blue" : "purple"}
                onClick={handleToggleRole}
              >
                Switch to {role === "admin" ? "Driver" : "Admin"}
              </Button>
            </Box>
            <MenuDivider />
            <MenuItem 
              icon={colorMode === "dark" ? <MdLightMode /> : <MdDarkMode />}
              onClick={handleToggleTheme}
              bg="bg.surface"
              _hover={{ bg: "bg.hover" }}
            >
              {colorMode === "dark" ? "Light Mode" : "Dark Mode"}
            </MenuItem>
            <MenuDivider />
            <MenuItem icon={<MdLogout />} color="red.500" bg="bg.surface" _hover={{ bg: "bg.hover" }}>
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
};

