import { useState } from 'react';

function ProductCard(props) {

    const [count, setCount] = useState(0);
    return (
        <div className="product-card">
            <img src={props.image} alt={props.name}/>
            <h1>Название - {props.name}</h1>
            <h1>Цена - {props.price}</h1>
            <p>Кол-во {count}</p>
            <button onClick={() => setCount(count + 1)}>Добавить в корзину</button>
            
        </div>

    );
}

export default ProductCard;