import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 1. Navigation goes on the outside */}
    <BrowserRouter>
      {/* 2. Auth goes next so it can use the Router to redirect users */}
      <AuthProvider>
        {/* 3. Theme goes inside Auth so it can read user data if needed */}
        <ChakraProvider>
          <App />
        </ChakraProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
