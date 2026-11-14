import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    function handleSubmit(event) {
        event.preventDefault();
        fetch('http://localhost:3001/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name: fullName, email, password })
        })
        .then(res => {
            if (!res.ok) throw new Error('Ошибка регистрации');
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
            <h2>Регистрация</h2>
            <form onSubmit={handleSubmit}>
                <input placeholder="Имя и фамилия" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
                {error && <p className="error">{error}</p>}
                <button type="submit">Зарегистрироваться</button>
            </form>
            <p style={{textAlign: 'center', marginTop: '15px'}}>
                Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
        </div>
    );
}