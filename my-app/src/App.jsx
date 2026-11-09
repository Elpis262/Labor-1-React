import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import { ThemeContext } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";

function App() {
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "light"
    );

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";

        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);

    };
    
    const appStyle = {
        backgroundColor: theme === "dark" ? "#333" : "#fff",
        color: theme === "dark" ? "#fff" : "#000",
        minHeight: "100vh",
        padding: "20px",
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <CartProvider>
                <div style={appStyle}>
                    <BrowserRouter>
                     <Menu/>
                     <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                     </Routes>
                    </BrowserRouter>
                </div>
            </CartProvider>
        </ThemeContext.Provider>
    );
}
export default App;