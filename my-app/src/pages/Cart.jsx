import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

export default function Cart() {
    const { cart, addToCart, removeFromCart, deleteItem, clearCart, totalCount } = useContext(CartContext);
    const navigate = useNavigate();
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const [msg, setMsg] = useState('');
    const [deleteModal, setDeleteModal] = useState(null);
    const [checkoutModal, setCheckoutModal] = useState(false);
    const [successModal, setSuccessModal] = useState(false);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const finalTotal = total - (total * discount / 100);

    function applyCoupon() {
        fetch(`http://localhost:3001/api/coupons/${coupon}`)
            .then(res => {
                if (!res.ok) throw new Error('Купон не найден');
                return res.json();
            })
            .then(data => { 
                setDiscount(data.discount_percent); 
                setMsg(`Купон применён! Скидка ${data.discount_percent}%`); 
            })
            .catch(() => { 
                setDiscount(0); 
                setMsg('Купон не найден или недействителен'); 
            });
    }

    function confirmDelete(index) {
        setDeleteModal(index);
    }

    function handleDelete() {
        if (deleteModal !== null) {
            deleteItem(deleteModal);
            setDeleteModal(null);
        }
    }

    function handleCheckout() {
        const isAuth = localStorage.getItem('isAuth') === 'true';
        if (!isAuth) {
            setCheckoutModal(true);
        } else {
            setSuccessModal(true);
        }
    }

    function goToLogin() {
        setCheckoutModal(false);
        navigate('/login');
    }

    return (
        <div className="cart-page">
            <h2>Корзина</h2>
            <p className="cart-count">Всего позиций: {cart.length} | Всего товаров: {totalCount}</p>
            
            {cart.length === 0 ? (
                <p className="empty-cart">Корзина пуста</p>
            ) : (
                <div>
                    {cart.map((item, index) => (
                        <div key={index} className="cart-item">
                            <div className="cart-item-info">
                                <strong>{item.name}</strong>
                                <p>{item.price} руб. x {item.quantity} = {item.price * item.quantity} руб.</p>
                            </div>
                            <div className="cart-item-controls">
                                <button onClick={() => removeFromCart(index)}>-</button>
                                <span className="quantity">{item.quantity}</span>
                                <button onClick={() => addToCart(item)}>+</button>
                                <button className="delete-btn" onClick={() => confirmDelete(index)}>
                                    🧺
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="cart-summary">
                        <div className="coupon-box">
                            <input 
                                placeholder="Код купона" 
                                value={coupon} 
                                onChange={e => setCoupon(e.target.value)} 
                            />
                            <button onClick={applyCoupon}>Применить</button>
                        </div>
                        {msg && <p className={discount > 0 ? 'success' : 'error'}>{msg}</p>}
                        
                        <p>Подытог: {total} руб.</p>
                        {discount > 0 && <p className="discount-text">Скидка: -{Math.round(total * discount / 100)} руб. ({discount}%)</p>}
                        <h3>Итого: {finalTotal} руб.</h3>
                        
                        <button className="checkout-btn" onClick={handleCheckout}>
                            Оформить заказ
                        </button>
                    </div>
                </div>
            )}

            {deleteModal !== null && (
                <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Удалить товар?</h3>
                        <p>Вы уверены, что хотите удалить <strong>{cart[deleteModal]?.name}</strong> из корзины?</p>
                        <div className="modal-buttons">
                            <button className="modal-cancel-btn" onClick={() => setDeleteModal(null)}>Отмена</button>
                            <button className="modal-confirm-btn" onClick={handleDelete}>Удалить</button>
                        </div>
                    </div>
                </div>
            )}

            {checkoutModal && (
                <div className="modal-overlay" onClick={() => setCheckoutModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Требуется авторизация</h3>
                        <p>Для оформления заказа необходимо войти в аккаунт</p>
                        <div className="modal-buttons">
                            <button className="modal-cancel-btn" onClick={() => setCheckoutModal(false)}>Отмена</button>
                            <button className="modal-login-btn" onClick={goToLogin}>Войти</button>
                        </div>
                    </div>
                </div>
            )}

            {successModal && (
                <div className="modal-overlay" onClick={() => setSuccessModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Заказ оформлен</h3>
                        <p>Спасибо за покупку! Сумма заказа: <strong>{finalTotal} руб.</strong></p>
                        <div className="modal-buttons">
                            <button className="modal-confirm-btn" onClick={() => {
                                setSuccessModal(false);
                                clearCart();
                                setDiscount(0);
                                setCoupon('');
                                setMsg('');
                            }}>Закрыть</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}