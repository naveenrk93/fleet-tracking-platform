import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./app/App";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary.tsx";

const theme = extendTheme({
    config: {
        initialColorMode: "light",
        useSystemColorMode: false
    },
    styles: {
        global: {
            "html, body, #root": {
                height: "100%"
            },
            body: {
                bg: "bg.page",
                color: "text.primary",
                transition: "background-color 0.2s, color 0.2s"
            }
        }
    },
    components: {
        Input: {
            baseStyle: {
                field: {
                    color: "gray.800",
                    _dark: {
                        color: "whiteAlpha.900"
                    },
                    _placeholder: {
                        color: "gray.500",
                        _dark: {
                            color: "gray.400"
                        }
                    }
                }
            }
        },
        Textarea: {
            baseStyle: {
                color: "gray.800",
                _dark: {
                    color: "whiteAlpha.900"
                },
                _placeholder: {
                    color: "gray.500",
                    _dark: {
                        color: "gray.400"
                    }
                }
            }
        },
        Select: {
            baseStyle: {
                field: {
                    color: "gray.800",
                    _dark: {
                        color: "whiteAlpha.900"
                    }
                }
            }
        }
    },
    colors: {
        brand: {
            500: "#667eea",
            600: "#764ba2"
        }
    },
    semanticTokens: {
        colors: {
            // Background colors
            "bg.page": {
                _light: "gray.100",
                _dark: "gray.900"
            },
            "bg.surface": {
                _light: "white",
                _dark: "gray.800"
            },
            "bg.header": {
                _light: "white",
                _dark: "gray.800"
            },
            "bg.sidebar": {
                _light: "white",
                _dark: "gray.800"
            },
            "bg.card": {
                _light: "white",
                _dark: "gray.800"
            },
            "bg.hover": {
                _light: "gray.600",
                _dark: "gray.700"
            },
            "bg.search": {
                _light: "gray.100",
                _dark: "gray.700"
            },
            "bg.search.focus": {
                _light: "gray.200",
                _dark: "gray.600"
            },
            "bg.input": {
                _light: "white",
                _dark: "gray.300"
            },
            "bg.icon.light": {
                _light: "green.50",
                _dark: "green.900"
            },
            "bg.trend.up": {
                _light: "green.50",
                _dark: "green.900"
            },
            "bg.trend.down": {
                _light: "red.50",
                _dark: "red.900"
            },
            
            // Text colors
            "text.primary": {
                _light: "gray.800",
                _dark: "white"
            },
            "text.secondary": {
                _light: "gray.600",
                _dark: "gray.400"
            },
            "text.tertiary": {
                _light: "gray.500",
                _dark: "gray.400"
            },
            "text.menu": {
                _light: "gray.600",
                _dark: "gray.200"
            },
            "text.muted": {
                _light: "gray.600",
                _dark: "gray.400"
            },
            
            // Border colors
            "border.default": {
                _light: "gray.200",
                _dark: "gray.700"
            },
            "border.hover": {
                _light: "gray.300",
                _dark: "gray.600"
            },
            
            // Icon colors
            "icon.default": {
                _light: "gray.600",
                _dark: "gray.300"
            },
            "icon.hover": {
                _light: "gray.800",
                _dark: "white"
            },
            
            // Chart and SVG colors
            "chart.grid": {
                _light: "#E2E8F0",
                _dark: "#2D3748"
            },
            "chart.stroke": {
                _light: "#1A202C",
                _dark: "#1A202C"
            },
            "circle.track": {
                _light: "#E2E8F0",
                _dark: "#2D3748"
            },
            "scrollbar.thumb": {
                _light: "#CBD5E0",
                _dark: "#4A5568"
            },
            
            // Chakra UI defaults
            "chakra-body-bg": {
                _light: "gray.50",
                _dark: "gray.900"
            },
            "chakra-body-text": {
                _light: "gray.800",
                _dark: "gray.100"
            }
        }
    }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <ErrorBoundary fallbackType="page">
        <Provider store={store}>
            <ChakraProvider theme={theme}>
                <BrowserRouter>
                    <ErrorBoundary fallbackType="page">
                        <App />
                    </ErrorBoundary>
                </BrowserRouter>
            </ChakraProvider>
        </Provider>
    </ErrorBoundary>
);
