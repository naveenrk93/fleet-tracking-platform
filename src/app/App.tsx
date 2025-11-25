import { Box, Flex } from "@chakra-ui/react";
import { useRoutes } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { routes } from "./routes";

const App = () => {
    const routing = useRoutes(routes);

    return (
        <Flex direction="row" height="100vh" bg="bg.page">
            <Sidebar />
            <Flex direction="column" flex="1" ml="260px" overflow="hidden">
                <Header />
                <Box
                    as="main"
                    flex="1"
                    overflow="auto"
                    p={6}
                    bg="bg.page"
                >
                    {routing}
                </Box>
            </Flex>
        </Flex>
    );
};

export default App;
