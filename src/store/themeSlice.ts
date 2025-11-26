import { createSlice } from "@reduxjs/toolkit";

interface ThemeState {
    colorMode: "light" | "dark";
}

const initialState: ThemeState = {
    colorMode: (localStorage.getItem("chakra-ui-color-mode") as "light" | "dark") || "light",
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleColorMode: (state) => {
            state.colorMode = state.colorMode === "dark" ? "light" : "dark";
            localStorage.setItem("chakra-ui-color-mode", state.colorMode);
        },
    },
});

export const { toggleColorMode } = themeSlice.actions;
export default themeSlice.reducer;

