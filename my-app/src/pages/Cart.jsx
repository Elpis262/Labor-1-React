
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export default function Cart() {
    const { cart, addToCart,removeFromCart } = useContext(CartContext);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div>
            <h2>Корзина</h2>
           <p>Количество товаров: {count}</p>
            {cart.length === 0 ? (
                <p>Корзина пуста</p>
            ) : (
                <div>
                    {cart.map((item, index) => (
                        <div key={index}>
                            <p>{item.name} — {item.price} ₽</p>

                            <button onClick={() => addToCart(item)} style={{ marginLeft: "10px"}}>+</button>
                            <span> {item.quantity} </span>
                            <button onClick={() => removeFromCart(index)}>-</button>
                        </div>
                    ))}

                    <h3>Итого: {total} ₽</h3>
                </div>
            )}
        </div>
    );
}
