import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    function handleSubmit(event) {
        event.preventDefault();
        fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(res => {
            if (!res.ok) throw new Error('Неверный логин или пароль');
            return res.json();
        })
        .then(user => {
            localStorage.setItem("isAuth", "true");
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/dashboard");
        })
        .catch(err => setError(err.message));
    }

    return (
        <div className="auth-page">
            <h2>Вход</h2>
            <form onSubmit={handleSubmit}>
                <input placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
                <input type="password" placeholder="Пароль" value={password} onChange={(event) => setPassword(event.target.value)} />
                {error && <p className="error">{error}</p>}
                <button type="submit">Войти</button>
            </form>
            <p style={{textAlign: 'center', marginTop: '15px'}}>
                Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </p>
        </div>
    );
}