import { NavLink, Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function Menu() {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <nav style={{ marginBottom: "20px"}}>
            <NavLink to="/" end style={({ isActive }) => ({
                color: isActive ? "red" : theme === "dark" ? "#fff" : "#000",
                fontWeight: isActive ? "bold" : "normal",
                marginRight: "10px"
            })}> Главная </NavLink>

            <NavLink to="/cart" style={{ marginRight: "10px" }}>
                Корзина
            </NavLink>

            <Link to="/login" style={{ marginRight: "10px", color: theme === "dark" ? "#fff" : "#000"}}>Войти</Link>

            <button onClick={toggleTheme} style={{ marginLeft: "20px"}}>Переключить тему ({theme})</button>
        </nav>
    );
}

export default Menu;