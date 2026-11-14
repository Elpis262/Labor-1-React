import { useContext } from "react";
import { CartContext } from "../context/CartContext";

function ProductCard(props) {
    const { addToCart } = useContext(CartContext);
    const finalPrice = props.discount > 0 ? (props.price * (1 - props.discount / 100)).toFixed(0) : props.price;

    return (
        <div className="product-card">
            <img src={props.image} alt={props.name} width="150" height="150" />
            <h2>{props.name}</h2>
            {props.discount > 0 && <p style={{textDecoration: 'line-through', color: 'gray', fontSize: '12px'}}>{props.price} ₽</p>}
            <p>Цена: {finalPrice} ₽ {props.discount > 0 && <span style={{color: 'red'}}>-{props.discount}%</span>}</p>
            <button onClick={() => addToCart({ id: props.id, name: props.name, price: parseFloat(finalPrice) })}>В корзину</button>
        </div>
    );
}
export default ProductCard;