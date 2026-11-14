const API_URL = 'http://localhost:3001/api';

export async function getCategories() {
    const res = await fetch(`${API_URL}/categories`);
    if (!res.ok) throw new Error('Ошибка загрузки категорий');
    return res.json();
}

export async function getServices(categoryId) {
    const url = categoryId ? `${API_URL}/services?category_id=${categoryId}` : `${API_URL}/services`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Ошибка загрузки услуг');
    return res.json();
}

export async function login(email, password) {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка входа');
    }
    return res.json();
}

export async function createAppointment(data) {
    const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Ошибка создания записи');
    return res.json();
}

export async function register(email, password, fullName) {
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка регистрации');
    }
    return res.json();
}

export async function checkCoupon(code, userId) {
    const res = await fetch(`${API_URL}/coupons/${code}`);
    if (!res.ok) throw new Error('Купон не найден');
    const coupon = await res.json();
    if (coupon.type === 'personal' && coupon.user_id !== userId) {
        throw new Error('Купон не принадлежит вам');
    }
    return coupon;
}

export async function getUserCoupons(userId) {
    const res = await fetch(`${API_URL}/coupons/user/${userId}`);
    if (!res.ok) throw new Error('Ошибка загрузки купонов');
    return res.json();
}

export async function getUserCart(userId) {
    const res = await fetch(`${API_URL}/cart/${userId}`);
    if (!res.ok) throw new Error('Ошибка загрузки корзины');
    return res.json();
}

export async function addToCartDB(userId, serviceId, quantity) {
    const res = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, service_id: serviceId, quantity }),
    });
    if (!res.ok) throw new Error('Ошибка добавления в корзину');
    return res.json();
}

export async function removeFromCartDB(userId, serviceId) {
    const res = await fetch(`${API_URL}/cart/${userId}/${serviceId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Ошибка удаления из корзины');
    return res.json();
}

export async function clearCartDB(userId) {
    const res = await fetch(`${API_URL}/cart/${userId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Ошибка очистки корзины');
    return res.json();
}

export async function getUsers() {
    const res = await fetch(`${API_URL}/users`);
    if (!res.ok) throw new Error('Ошибка загрузки пользователей');
    return res.json();
}

export async function getAllCoupons() {
    const res = await fetch(`${API_URL}/coupons`);
    if (!res.ok) throw new Error('Ошибка загрузки купонов');
    return res.json();
}

export async function createCoupon(data) {
    const res = await fetch(`${API_URL}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка создания купона');
    }
    return res.json();
}

export async function deleteCoupon(id) {
    const res = await fetch(`${API_URL}/coupons/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Ошибка удаления купона');
    return res.json();
}