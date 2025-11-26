import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import { useRoutes } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { RoleAutoSwitch } from "../components/RoleAutoSwitch";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { routes } from "./routes";

const App = () => {
    const routing = useRoutes(routes);
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <RoleAutoSwitch>
            <Flex direction="row" height="100vh" bg="bg.page">
                <ErrorBoundary fallbackType="section">
                    <Sidebar isOpen={isOpen} onClose={onClose} />
                </ErrorBoundary>
                <Flex 
                    direction="column" 
                    flex="1" 
                    ml={{ base: 0, lg: "260px" }} 
                    overflow="hidden"
                >
                    <ErrorBoundary fallbackType="section">
                        <Header onMenuClick={onOpen} />
                    </ErrorBoundary>
                    <Box
                        as="main"
                        flex="1"
                        overflow="auto"
                        p={{ base: 4, md: 6 }}
                        bg="bg.page"
                    >
                        <ErrorBoundary fallbackType="page">
                            {routing}
                        </ErrorBoundary>
                    </Box>
                </Flex>
            </Flex>
        </RoleAutoSwitch>
    );
};

export default App;
