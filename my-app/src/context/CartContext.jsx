import { createContext, useState } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);

    function addToCart(item) {
    const found = cart.find(product => product.name === item.name);

    if (found) {
        setCart(cart.map(product =>
            product.name === item.name
                ? { ...product, quantity: product.quantity + 1 }
                : product
        ));
    } else {
        setCart([...cart, { ...item, quantity: 1 }]);
    }
}

    function removeFromCart(index) {
    if (cart[index].quantity > 1) {
        setCart(cart.map((item, i) =>
            i === index
                ? { ...item, quantity: item.quantity - 1 }
                : item
        ));
    } else {
        setCart(cart.filter((_, i) => i !== index));
    }
}

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
}