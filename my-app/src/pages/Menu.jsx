import { NavLink, Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { CartContext } from "../context/CartContext";

function Menu() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { totalCount } = useContext(CartContext);
    const isAuth = localStorage.getItem("isAuth") === "true";
    const user = JSON.parse(localStorage.getItem("user") || "null");

    return (
        <nav>
            <NavLink to="/" end style={({ isActive }) => ({ 
                color: isActive ? "red" : (theme === "dark" ? "#fff" : "#333"),
                fontWeight: isActive ? "bold" : "normal",
                marginRight: "10px"
            })}> Главная </NavLink>

            <NavLink to="/cart" style={{ 
                marginRight: "10px", 
                color: theme === "dark" ? "#fff" : "#333",
                position: 'relative',
                display: 'inline-block'
            }}>
                Корзина
                {totalCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-18px',
                        background: '#e53e3e',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {totalCount}
                    </span>
                )}
            </NavLink>
            
            {isAuth ? (
                <>
                    <Link to="/dashboard" style={{ color: theme === "dark" ? "#fff" : "#333", marginRight: "10px" }}>Личный кабинет</Link>
                    {user?.role_name === 'admin' && (
                        <Link to="/admin" style={{ color: theme === "dark" ? "#fff" : "#333", marginRight: "10px" }}>Админ</Link>
                    )}
                </>
            ) : (
                <Link to="/login" style={{ color: theme === "dark" ? "#fff" : "#333", marginRight: "10px" }}>Войти</Link>
            )}

            <button onClick={toggleTheme} style={{ marginLeft: "auto" }}>Тема ({theme})</button>
        </nav>
    );
}
export default Menu;