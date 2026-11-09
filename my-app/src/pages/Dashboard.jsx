
import { useNavigate, Navigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();

    function logout() {
        localStorage.removeItem("isAuth");
        navigate("/login");
    }

    if (localStorage.getItem("isAuth") !== "true") {
        return <Navigate to="/login" />;
    }

    return (
        <div>
            <h2>Личный кабинет</h2>
            <p>Добро пожаловать!</p>

            <button onClick={logout}>Выйти</button>
        </div>
    );
}
