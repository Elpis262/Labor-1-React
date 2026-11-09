import '../App.css'
import ProductCard from '../components/ProductCard';
import image1 from '../images/image1.webp';
import image2 from '../images/image2.webp';
import image3 from '../images/image3.webp';
import image4 from '../images/image4.webp';
import image5 from '../images/image5.webp';

function Home() {
    return (
        <div className="products">
            <ProductCard image={image1} name="Обработка для собак" price={1200} />
            <ProductCard image={image2} name="Обработка для кошек" price={1000} />
            <ProductCard image={image3} name="Капли для глаз" price={800} />
            <ProductCard image={image4} name="Лечебный шампунь" price={1500} />
            <ProductCard image={image5} name="Лакомство" price={500} />
            
        </div>
    );
}

export default Home