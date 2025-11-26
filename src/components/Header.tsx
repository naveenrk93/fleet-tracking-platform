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
    Button,
    Switch,
    Select,
    FormLabel,
    VStack
} from "@chakra-ui/react";
import {
    MdSearch,
    MdLightMode,
    MdDarkMode,
    MdPerson,
    MdSettings,
    MdLogout,
    MdSwapHoriz,
    MdAdminPanelSettings,
    MdLocalShipping
} from "react-icons/md";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {toggleColorMode as toggleColorModeRedux} from "../store/themeSlice";
import {toggleUserRole, setUserId} from "../store/userSlice";
import {ROUTE_PATHS} from "../app/routes";
import type {RootState} from "../store";
import {useState, useEffect} from "react";
import {getDrivers, type Driver} from "../services/api";

export const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {colorMode, toggleColorMode} = useColorMode();
    const {role, name, email, userId} = useSelector((state: RootState) => state.user);
    const [drivers, setDrivers] = useState<Driver[]>([]);

    useEffect(() => {
        // Fetch drivers for the dropdown
        const fetchDrivers = async () => {
            try {
                const driversData = await getDrivers();
                setDrivers(driversData);
            } catch (error) {
                console.error("Failed to fetch drivers:", error);
            }
        };
        fetchDrivers();
    }, []);

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

    const handleDriverChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newDriverId = event.target.value;
        dispatch(setUserId(newDriverId));
    };

    return (
        <Flex
            as="header"
            h="72px"
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
                    <Icon as={MdSearch} color="gray.400"/>
                </InputLeftElement>
                <Input
                    placeholder="Search (Ctrl+/)"
                    bg="bg.search"
                    border="none"
                    _placeholder={{color: "gray.400"}}
                    _focus={{bg: "bg.search.focus"}}
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
                    <Icon as={role === "admin" ? MdAdminPanelSettings : MdLocalShipping} boxSize={4}
                          marginRight={"6px"}/>
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
                        <Box px={4} mb={2}>
                            <Text fontWeight="bold">{name}</Text>
                            <Text fontSize="sm" color="gray.500">{email}</Text>
                        </Box>

                        {/* Driver ID Selector - shown only in driver role */}
                        {role === "driver" && (
                            <Box px={4} py={2}>
                                <VStack align="stretch" spacing={2}>
                                    <FormLabel fontSize="sm" mb={0} fontWeight="medium">
                                        Driver ID
                                    </FormLabel>
                                    <Select
                                        size="sm"
                                        value={userId || ""}
                                        onChange={handleDriverChange}
                                        bg="bg.surface"
                                        borderColor="border.default"
                                    >
                                        <option value="">Select Driver</option>
                                        {drivers.map((driver) => (
                                            <option key={driver.id} value={driver.id}>
                                                {driver.name} ({driver.id})
                                            </option>
                                        ))}
                                    </Select>
                                    <Text fontSize="xs" color="gray.500">
                                        Current: {userId || "None"}
                                    </Text>
                                </VStack>
                            </Box>
                        )}
                        
                        <MenuDivider/>
                        
                        <Box px={3} py={2}>
                            <Button
                                leftIcon={<MdSwapHoriz/>}
                                size="sm"
                                width="100%"
                                colorScheme={role === "admin" ? "blue" : "purple"}
                                onClick={handleToggleRole}
                            >
                                Switch to {role === "admin" ? "Driver" : "Admin"}
                            </Button>
                        </Box>
                        <MenuDivider/>
                        <MenuItem icon={<MdPerson/>} bg="bg.surface" _hover={{bg: "bg.hover"}}>
                            Profile
                        </MenuItem>
                        <MenuItem icon={<MdSettings/>} bg="bg.surface" _hover={{bg: "bg.hover"}}>
                            Settings
                        </MenuItem>
                        <MenuDivider/>
                        <Box px={4} py={3}>
                            <Flex align="center" justify="space-between">
                                <HStack spacing={2}>
                                    <Icon 
                                        as={MdDarkMode} 
                                        boxSize={5}
                                        color="gray.500"
                                    />
                                    <Text fontSize="sm" fontWeight="medium">
                                        Dark Mode
                                    </Text>
                                </HStack>
                                <Switch
                                    isChecked={colorMode === "dark"}
                                    onChange={handleToggleTheme}
                                    colorScheme="purple"
                                    size="md"
                                />
                            </Flex>
                        </Box>
                        <MenuDivider/>
                        <MenuItem icon={<MdLogout/>} color="red.500" bg="bg.surface" _hover={{bg: "bg.hover"}}>
                            Logout
                        </MenuItem>
                    </MenuList>
                </Menu>
            </HStack>
        </Flex>
    );
};

