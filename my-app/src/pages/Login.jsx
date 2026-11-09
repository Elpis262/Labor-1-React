
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    return (
        <div>
            <h2>Вход</h2>

            <form onSubmit={(event) => {
                event.preventDefault();

                if (login === "vera" && password === "12345") {
                    localStorage.setItem("isAuth", "true");
                    navigate("/dashboard");
                } else {
                    alert("Неверный логин или пароль");
                }
            }}>
                <input
                    placeholder="Логин"
                    value={login}
                    onChange={(event) => setLogin(event.target.value)}
                />

                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />

                <button type="submit">Войти</button>
            </form>
        </div>
    );
}
