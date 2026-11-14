import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT,
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Разрешены только изображения'));
        }
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/categories', async (req, res) => {
    try {
        const { name } = req.body;
        const trimmedName = name.trim();
        if (!trimmedName) return res.status(400).json({ error: 'Название не может быть пустым' });
        const existing = await pool.query('SELECT id FROM categories WHERE LOWER(TRIM(name)) = LOWER($1)', [trimmedName]);
        if (existing.rows.length > 0) return res.status(400).json({ error: 'Категория уже существует' });
        const result = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [trimmedName]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const services = await pool.query('SELECT id FROM services WHERE category_id = $1', [id]);
        if (services.rows.length > 0) return res.status(400).json({ error: 'Нельзя удалить категорию с товарами' });
        await pool.query('DELETE FROM categories WHERE id = $1', [id]);
        res.json({ message: 'Категория удалена' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, full_name, role_id FROM users ORDER BY full_name');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/services', async (req, res) => {
    try {
        const { category_id } = req.query;
        let query = 'SELECT s.*, c.name AS category_name FROM services s JOIN categories c ON s.category_id = c.id';
        const params = [];
        if (category_id) {
            query += ' WHERE s.category_id = $1';
            params.push(category_id);
        }
        query += ' ORDER BY s.name';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Товар не найден' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/services', upload.single('image'), async (req, res) => {
    try {
        const { name, description, duration_minutes, price, category_id, has_discount, discount_percent } = req.body;
        const image_url = req.file ? `/images/${req.file.filename}` : '/images/image1.webp';
        const result = await pool.query(
            'INSERT INTO services (name, description, duration_minutes, price, category_id, has_discount, discount_percent, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [name, description, duration_minutes || 0, price, category_id, has_discount || false, discount_percent || 0, image_url]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/services/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, duration_minutes, price, category_id, has_discount, discount_percent } = req.body;
        const image_url = req.file ? `/images/${req.file.filename}` : req.body.image_url;
        const result = await pool.query(
            'UPDATE services SET name=$1, description=$2, duration_minutes=$3, price=$4, category_id=$5, has_discount=$6, discount_percent=$7, image_url=$8 WHERE id=$9 RETURNING *',
            [name, description, duration_minutes || 0, price, category_id, has_discount, discount_percent, image_url, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM services WHERE id = $1', [id]);
        res.json({ message: 'Товар удален' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query(
            'SELECT u.id, u.email, u.full_name, u.role_id, u.password_hash, r.name AS role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1',
            [email]
        );
        const user = result.rows[0];
        if (!user) return res.status(401).json({ error: 'Пользователь не найден' });
        if (user.password_hash !== password) return res.status(401).json({ error: 'Неверный пароль' });
        res.json({ id: user.id, email: user.email, full_name: user.full_name, role_id: user.role_id, role_name: user.role_name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { email, password, full_name } = req.body;
        if (!email || !password || !full_name) return res.status(400).json({ error: 'Заполните все поля' });
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) return res.status(400).json({ error: 'Пользователь уже существует' });
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, full_name, role_id) VALUES ($1, $2, $3, 2) RETURNING id, email, full_name, role_id`,
            [email, password, full_name]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/appointments/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const result = await pool.query(
            'SELECT a.*, s.name AS service_name, s.price AS service_price FROM appointments a JOIN services s ON a.service_id = s.id WHERE a.user_id = $1 ORDER BY a.appointment_date DESC',
            [user_id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/appointments', async (req, res) => {
    try {
        const { user_id, service_id, appointment_date, total_price } = req.body;
        const result = await pool.query(
            "INSERT INTO appointments (user_id, service_id, appointment_date, total_price, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING *",
            [user_id, service_id, appointment_date, total_price]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await pool.query('UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/coupons', async (req, res) => {
    try {
        const result = await pool.query('SELECT c.*, u.full_name AS user_name FROM coupons c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.id DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/coupons/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const result = await pool.query('SELECT * FROM coupons WHERE code = $1', [code]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Купон не найден' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/coupons', async (req, res) => {
    try {
        const { code, discount_percent, type, user_id } = req.body;
        const result = await pool.query(
            'INSERT INTO coupons (code, discount_percent, type, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [code, discount_percent, type, user_id || null]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/coupons/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM coupons WHERE id = $1', [id]);
        res.json({ message: 'Купон удален' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/coupons/user/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const result = await pool.query(`SELECT * FROM coupons WHERE user_id = $1 OR type = 'general'`, [user_id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/cart/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const result = await pool.query(
            `SELECT c.service_id AS id, c.quantity, s.name, s.price, s.image_url FROM cart_items c JOIN services s ON c.service_id = s.id WHERE c.user_id = $1`,
            [user_id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/cart', async (req, res) => {
    try {
        const { user_id, service_id, quantity } = req.body;
        const result = await pool.query(
            `INSERT INTO cart_items (user_id, service_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (user_id, service_id) DO UPDATE SET quantity = cart_items.quantity + $3 RETURNING *`,
            [user_id, service_id, quantity]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/cart/:user_id/:service_id', async (req, res) => {
    try {
        const { user_id, service_id } = req.params;
        await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND service_id = $2', [user_id, service_id]);
        res.json({ message: 'Товар удален из корзины' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/cart/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        await pool.query('DELETE FROM cart_items WHERE user_id = $1', [user_id]);
        res.json({ message: 'Корзина очищена' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'Файл слишком большой. Максимум 5 МБ.' });
    }
    res.status(500).json({ error: err.message || 'Внутренняя ошибка' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`База данных: ${process.env.PG_DATABASE}`);
});