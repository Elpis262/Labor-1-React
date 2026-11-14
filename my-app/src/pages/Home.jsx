import { useEffect, useState } from 'react';
import '../App.css';
import ProductCard from '../components/ProductCard';

function Home() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCat, setSelectedCat] = useState(null);

    useEffect(() => {
        // Загружаем категории для aside
        fetch('http://localhost:3001/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(() => console.log('Ошибка категорий'));

        // Загружаем товары (с фильтром или все)
        const url = selectedCat 
            ? `http://localhost:3001/api/services?category_id=${selectedCat}` 
            : 'http://localhost:3001/api/services';
            
        fetch(url)
            .then(res => res.json())
            .then(data => setServices(data))
            .catch(() => console.log('Ошибка товаров'));
    }, [selectedCat]);

    return (
        <div className="home-container">
            {/* ASIDE С КАТЕГОРИЯМИ */}
            <aside>
                <h3>Категории</h3>
                <label>
                    <input type="radio" name="cat" checked={selectedCat === null} onChange={() => setSelectedCat(null)} />
                    Все товары
                </label>
                {categories.map(cat => (
                    <label key={cat.id}>
                        <input type="radio" name="cat" checked={selectedCat === cat.id} onChange={() => setSelectedCat(cat.id)} />
                        {cat.name}
                    </label>
                ))}
            </aside>

            {/* КАТАЛОГ ТОВАРОВ */}
            <div className="products">
                {services.map(s => (
                    <ProductCard
                        key={s.id}
                        id={s.id}
                        name={s.name}
                        price={s.price}
                        discount={s.discount_percent}
                        image={s.image_url || 'https://via.placeholder.com/150'}
                    />
                ))}
            </div>
        </div>
    );
}
export default Home;