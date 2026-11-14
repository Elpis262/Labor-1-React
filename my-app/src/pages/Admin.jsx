import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getUsers, getAllCoupons, createCoupon, deleteCoupon } from '../api';

export default function Admin() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [couponsList, setCouponsList] = useState([]);
    
    const [newCategory, setNewCategory] = useState('');
    const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', category_id: '', discount_percent: '' });
    const [newProductImage, setNewProductImage] = useState(null);
    const [newProductImagePreview, setNewProductImagePreview] = useState('');
    
    const [editingProduct, setEditingProduct] = useState(null);
    const [editImage, setEditImage] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState('');
    
    const [newCoupon, setNewCoupon] = useState({ code: '', discount_percent: '', user_id: '' });
    const [message, setMessage] = useState('');
    const [deleteCategoryModal, setDeleteCategoryModal] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3001/api/categories').then(res => res.json()).then(setCategories);
        fetch('http://localhost:3001/api/services').then(res => res.json()).then(setProducts);
        getUsers().then(setUsersList).catch(console.error);
        getAllCoupons().then(setCouponsList).catch(console.error);
    }, []);

    function showMessage(text, isError = false) {
        setMessage(text);
        setTimeout(() => setMessage(''), 4000);
    }

    function addCategory(e) {
        e.preventDefault();
        fetch('http://localhost:3001/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newCategory }) })
        .then(async res => { if (!res.ok) { const err = await res.json(); throw new Error(err.error); } return res.json(); })
        .then(data => { setCategories([...categories, data]); setNewCategory(''); showMessage('Категория добавлена'); })
        .catch(err => showMessage(err.message, true));
    }

    function requestDeleteCategory(id, name) { setDeleteCategoryModal({ id, name }); }

    function confirmDeleteCategory() {
        if (!deleteCategoryModal) return;
        const { id } = deleteCategoryModal;
        fetch(`http://localhost:3001/api/categories/${id}`, { method: 'DELETE' })
        .then(async res => { if (!res.ok) { const err = await res.json(); throw new Error(err.error); } return res.json(); })
        .then(() => { setCategories(categories.filter(c => c.id !== id)); setDeleteCategoryModal(null); showMessage('Категория удалена'); })
        .catch(err => showMessage(err.message, true));
    }

    function handleNewImageChange(e) {
        const file = e.target.files[0];
        if (file) { setNewProductImage(file); setNewProductImagePreview(URL.createObjectURL(file)); }
    }

    function addProduct(e) {
        e.preventDefault();
        const price = parseFloat(newProduct.price);
        const discount = parseInt(newProduct.discount_percent) || 0;
        if (price <= 0) return showMessage('Цена должна быть больше 0', true);
        if (price > 999999.99) return showMessage('Максимальная цена — 999 999.99 руб.', true);
        if (discount < 0 || discount >= 100) return showMessage('Скидка от 0 до 99%', true);

        const formData = new FormData();
        formData.append('name', newProduct.name);
        formData.append('description', newProduct.description);
        formData.append('price', price);
        formData.append('category_id', parseInt(newProduct.category_id));
        formData.append('has_discount', discount > 0);
        formData.append('discount_percent', discount);
        formData.append('duration_minutes', 0);
        if (newProductImage) formData.append('image', newProductImage);

        fetch('http://localhost:3001/api/services', { method: 'POST', body: formData })
        .then(async res => { if (!res.ok) { const err = await res.json(); throw new Error(err.error); } return res.json(); })
        .then(data => { setProducts([...products, data]); setNewProduct({ name: '', description: '', price: '', category_id: '', discount_percent: '' }); setNewProductImage(null); setNewProductImagePreview(''); showMessage('Товар добавлен'); })
        .catch(err => showMessage(err.message, true));
    }

    function startEdit(product) { setEditingProduct({ ...product }); setEditImage(null); setEditImagePreview(''); }
    function cancelEdit() { setEditingProduct(null); setEditImage(null); setEditImagePreview(''); }

    function handleEditImageChange(e) {
        const file = e.target.files[0];
        if (file) { setEditImage(file); setEditImagePreview(URL.createObjectURL(file)); }
    }

    function updateProduct(e) {
        e.preventDefault();
        const price = parseFloat(editingProduct.price);
        const discount = parseInt(editingProduct.discount_percent) || 0;
        if (price <= 0) return showMessage('Цена должна быть больше 0', true);
        if (price > 999999.99) return showMessage('Максимальная цена — 999 999.99 руб.', true);
        if (discount < 0 || discount >= 100) return showMessage('Скидка от 0 до 99%', true);

        const formData = new FormData();
        formData.append('name', editingProduct.name);
        formData.append('description', editingProduct.description);
        formData.append('price', price);
        formData.append('category_id', parseInt(editingProduct.category_id));
        formData.append('has_discount', discount > 0);
        formData.append('discount_percent', discount);
        formData.append('duration_minutes', editingProduct.duration_minutes || 0);
        formData.append('image_url', editingProduct.image_url || '');
        if (editImage) formData.append('image', editImage);

        fetch(`http://localhost:3001/api/services/${editingProduct.id}`, { method: 'PUT', body: formData })
        .then(async res => { if (!res.ok) { const err = await res.json(); throw new Error(err.error); } return res.json(); })
        .then(data => { setProducts(products.map(p => p.id === data.id ? data : p)); setEditingProduct(null); setEditImage(null); setEditImagePreview(''); showMessage('Товар обновлен'); })
        .catch(err => showMessage(err.message, true));
    }

    function addCoupon(e) {
        e.preventDefault();
        const discount = parseInt(newCoupon.discount_percent);
        if (!newCoupon.code.trim()) return showMessage('Введите код купона', true);
        if (discount <= 0 || discount >= 100) return showMessage('Скидка от 1 до 99%', true);

        createCoupon({
            code: newCoupon.code.trim(),
            discount_percent: discount,
            type: newCoupon.user_id ? 'personal' : 'general',
            user_id: newCoupon.user_id ? parseInt(newCoupon.user_id) : null
        })
        .then(data => {
            setCouponsList([data, ...couponsList]);
            setNewCoupon({ code: '', discount_percent: '', user_id: '' });
            showMessage('Купон выдан');
        })
        .catch(err => showMessage(err.message, true));
    }

    function handleDeleteCoupon(id) {
        deleteCoupon(id)
        .then(() => { setCouponsList(couponsList.filter(c => c.id !== id)); showMessage('Купон удален'); })
        .catch(err => showMessage(err.message, true));
    }

    if (localStorage.getItem('isAuth') !== 'true' || user?.role_name !== 'admin') {
        return <Navigate to="/login" />;
    }

    return (
        <div className="admin-page">
            <div className="admin-card">
                <h2>Панель администратора</h2>
                {message && <p className={message.includes('Ошибка') || message.includes('должна') || message.includes('Максимальная') || message.includes('Нельзя') || message.includes('Введите') ? 'error' : 'success'}>{message}</p>}

                <div className="admin-section">
                    <h3>Категории</h3>
                    <form onSubmit={addCategory} className="admin-form">
                        <input placeholder="Название категории" value={newCategory} onChange={e => setNewCategory(e.target.value)} required />
                        <button type="submit">Добавить</button>
                    </form>
                    <ul className="category-list">
                        {categories.map(c => (
                            <li key={c.id} className="category-item">
                                <span>{c.name}</span>
                                <button className="delete-category-btn" onClick={() => requestDeleteCategory(c.id, c.name)}>Удалить</button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="admin-section">
                    <h3>Выдать персональный купон</h3>
                    <form onSubmit={addCoupon} className="admin-form">
                        <select value={newCoupon.user_id} onChange={e => setNewCoupon({...newCoupon, user_id: e.target.value})}>
                            <option value="">Общий купон (для всех)</option>
                            {usersList.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>)}
                        </select>
                        <input placeholder="Код купона (например, WELCOME20)" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} required />
                        <input type="number" placeholder="Скидка (1-99%)" min="1" max="99" value={newCoupon.discount_percent} onChange={e => setNewCoupon({...newCoupon, discount_percent: e.target.value})} required />
                        <button type="submit">Выдать купон</button>
                    </form>
                    <div className="coupon-list">
                        {couponsList.map(c => (
                            <div key={c.id} className="coupon-row">
                                <div className="coupon-info">
                                    <strong>{c.code}</strong>
                                    <span>-{c.discount_percent}% | {c.type === 'personal' ? `Персональный: ${c.user_name || 'Удален'}` : 'Общий'}</span>
                                </div>
                                <button className="delete-coupon-btn" onClick={() => handleDeleteCoupon(c.id)}>Удалить</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="admin-section">
                    <h3>Добавить товар</h3>
                    <form onSubmit={addProduct} className="admin-form">
                        <input placeholder="Название" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                        <input placeholder="Описание" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                        <input type="number" placeholder="Цена" min="1" max="999999.99" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                        <select value={newProduct.category_id} onChange={e => setNewProduct({...newProduct, category_id: e.target.value})} required>
                            <option value="">Категория</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input type="number" placeholder="Скидка (0-99%)" min="0" max="99" value={newProduct.discount_percent} onChange={e => setNewProduct({...newProduct, discount_percent: e.target.value})} />
                        <div className="image-upload">
                            <label className="file-label">
                                <input type="file" accept="image/*" onChange={handleNewImageChange} />
                                <span className="file-button">Выбрать картинку</span>
                            </label>
                            {newProductImagePreview && <img src={newProductImagePreview} alt="Preview" className="image-preview" />}
                        </div>
                        <button type="submit">Добавить</button>
                    </form>
                </div>

                <div className="admin-section">
                    <h3>Товары</h3>
                    {editingProduct ? (
                        <div className="edit-form-container">
                            <h4>Редактирование: {editingProduct.name}</h4>
                            <form onSubmit={updateProduct} className="admin-form">
                                <input value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required />
                                <input value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                                <input type="number" min="1" max="999999.99" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} required />
                                <select value={editingProduct.category_id} onChange={e => setEditingProduct({...editingProduct, category_id: e.target.value})} required>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <input type="number" min="0" max="99" value={editingProduct.discount_percent} onChange={e => setEditingProduct({...editingProduct, discount_percent: e.target.value})} />
                                <div className="image-upload">
                                    <label className="file-label">
                                        <input type="file" accept="image/*" onChange={handleEditImageChange} />
                                        <span className="file-button">Изменить картинку</span>
                                    </label>
                                    {editImagePreview ? <img src={editImagePreview} alt="New" className="image-preview" /> : editingProduct.image_url && <img src={editingProduct.image_url} alt="Current" className="image-preview" />}
                                </div>
                                <div className="edit-buttons">
                                    <button type="submit" className="save-btn">Сохранить</button>
                                    <button type="button" className="cancel-btn" onClick={cancelEdit}>Отмена</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="products-list">
                            {products.map(p => (
                                <div key={p.id} className="product-row">
                                    <div className="product-info">
                                        <strong>{p.name}</strong>
                                        <span>{p.price} руб. {p.has_discount && <span className="discount-badge">-{p.discount_percent}%</span>}</span>
                                    </div>
                                    <button className="edit-btn" onClick={() => startEdit(p)}>Изменить</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {deleteCategoryModal && (
                <div className="modal-overlay" onClick={() => setDeleteCategoryModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Удалить категорию?</h3>
                        <p>Удалить "{deleteCategoryModal.name}"?</p>
                        <div className="modal-buttons">
                            <button className="modal-cancel-btn" onClick={() => setDeleteCategoryModal(null)}>Отмена</button>
                            <button className="modal-confirm-btn" onClick={confirmDeleteCategory}>Удалить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}