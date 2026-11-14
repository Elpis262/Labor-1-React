import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { getUserCoupons } from '../api';

export default function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const [coupons, setCoupons] = useState([]);

    useEffect(() => {
        if (user?.id) {
            getUserCoupons(user.id)
                .then(data => setCoupons(data))
                .catch(err => console.log('Ошибка загрузки купонов:', err));
        }
    }, [user?.id]);

    function logout() {
        localStorage.removeItem('isAuth');
        localStorage.removeItem('user');
        navigate('/login');
    }

    if (localStorage.getItem('isAuth') !== 'true' || !user) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-card">
                <h2>Личный кабинет</h2>
                
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div className="user-avatar">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <h3>{user.full_name}</h3>
                    <p>{user.email}</p>
                </div>

                <h3>Ваши купоны</h3>
                {coupons.length > 0 ? (
                    coupons.map(c => (
                        <div key={c.id} className="coupon-card">
                            <div>
                                <span className="coupon-code">{c.code}</span>
                                <span className="coupon-type">
                                    {c.type === 'personal' ? 'Персональный' : 'Общий'}
                                </span>
                            </div>
                            <span className="coupon-discount">-{c.discount_percent}%</span>
                        </div>
                    ))
                ) : (
                    <div className="no-coupons">
                        <p>У вас пока нет доступных купонов</p>
                    </div>
                )}

                <button className="logout-btn" onClick={logout}>
                    Выйти из аккаунта
                </button>
            </div>
        </div>
    );
}