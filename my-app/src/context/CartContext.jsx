import { createContext, useState, useEffect } from "react";
import { getUserCart, addToCartDB, removeFromCartDB, clearCartDB } from "../api";

export const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (user?.id) {
            getUserCart(user.id).then(setCart).catch(console.error);
        } else {
            const saved = localStorage.getItem('cart');
            if (saved) setCart(JSON.parse(saved));
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart, user?.id]);

    async function addToCart(item) {
        if (user?.id) {
            await addToCartDB(user.id, item.id, 1);
            const updated = await getUserCart(user.id);
            setCart(updated);
        } else {
            const found = cart.find(product => product.id === item.id);
            if (found) {
                setCart(cart.map(product => product.id === item.id ? { ...product, quantity: product.quantity + 1 } : product));
            } else {
                setCart([...cart, { ...item, quantity: 1 }]);
            }
        }
    }

    async function removeFromCart(index) {
        const item = cart[index];
        if (user?.id) {
            if (item.quantity > 1) {
                await addToCartDB(user.id, item.id, -1);
            } else {
                await removeFromCartDB(user.id, item.id);
            }
            const updated = await getUserCart(user.id);
            setCart(updated);
        } else {
            if (item.quantity > 1) {
                setCart(cart.map((product, i) => i === index ? { ...product, quantity: product.quantity - 1 } : product));
            } else {
                setCart(cart.filter((_, i) => i !== index));
            }
        }
    }

    async function deleteItem(index) {
        const item = cart[index];
        if (user?.id) {
            await removeFromCartDB(user.id, item.id);
            const updated = await getUserCart(user.id);
            setCart(updated);
        } else {
            setCart(cart.filter((_, i) => i !== index));
        }
    }

    async function clearCart() {
        if (user?.id) {
            await clearCartDB(user.id);
        }
        setCart([]);
    }

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, deleteItem, clearCart, totalCount }}>
            {children}
        </CartContext.Provider>
    );
}