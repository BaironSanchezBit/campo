const express = require('express');
const conectarDB = require('./config/db');
const authRoutes = require('./auth/auth.routers');
const productRoutes = require('./producto/producto.routers');
const paymentRoutes = require('./payment/payment.routers');
const pedidosRoutes = require('./pedido/pedido.routers');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
require('dotenv').config();

// Conectar a la base de datos
conectarDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));  // Aumenta el límite del body
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));  // Aumenta el límite del body

// Sirve los archivos estáticos de la carpeta "uploads"
app.use('/uploads', express.static('../uploads'));

// Rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/pagos', paymentRoutes);
app.use('/api/pedido', pedidosRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`El servidor está corriendo en el puerto ${PORT}`);
});
