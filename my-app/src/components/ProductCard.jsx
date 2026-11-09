import { useContext } from "react";
import { CartContext } from "../context/CartContext";

function ProductCard(props) {
    const { addToCart } = useContext(CartContext);

    function handleAdd() {
        addToCart({
            name: props.name,
            price: props.price
        });
    }

    return (
        <div className="product-card">
            <img src={props.image} alt={props.name} width="200" height="200" />

            <h2>{props.name}</h2>
            <p>Цена: {props.price} ₽</p>

            <button onClick={handleAdd}>
                В корзину
            </button>
        </div>
    );
}

export default ProductCard;
