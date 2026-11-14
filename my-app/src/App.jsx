import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from './pages/Admin';

import { ThemeContext } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";

function App() {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <CartProvider>
                <div className={theme} style={{ minHeight: "100vh", padding: "20px" }}>
                    <BrowserRouter>
                        <Menu />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/admin" element={<Admin />} />
                        </Routes>
                    </BrowserRouter>
                </div>
            </CartProvider>
        </ThemeContext.Provider>
    );
}
export default App;