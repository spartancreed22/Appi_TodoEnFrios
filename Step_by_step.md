# 🚀 GUÍA PASO A PASO: API REST CON EXPRESS + NODE.JS

## **FASE 1: PREPARACIÓN DEL ENTORNO**

### **Paso 1: Instalar Node.js**

1. Descarga Node.js desde: https://nodejs.org/
2. Instala la versión LTS (Long Term Support)
3. Verifica la instalación:
```bash
node --version
npm --version
```

### **Paso 2: Crear estructura de la API**

En la raíz del proyecto `TODOENFRIOS/`, crea la carpeta para la API:

```bash
TODOENFRIOS/
├── api/                    # ← NUEVA CARPETA
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
├── app/
└── ...
```

---

## **FASE 2: INICIALIZAR PROYECTO NODE.JS**

### **Paso 3: Crear el proyecto**

Navega a la carpeta `api/`:
```bash
cd TODOENFRIOS/api
npm init -y
```

### **Paso 4: Instalar dependencias**

```bash
npm install express mysql2 dotenv cors body-parser bcrypt jsonwebtoken
npm install --save-dev nodemon
```

**Dependencias instaladas:**
- `express` - Framework web
- `mysql2` - Conector MySQL
- `dotenv` - Variables de entorno
- `cors` - Cross-Origin Resource Sharing
- `body-parser` - Parseo de JSON
- `bcrypt` - Encriptación de contraseñas
- `jsonwebtoken` - Autenticación JWT
- `nodemon` - Recarga automática (dev)

---

## **FASE 3: CONFIGURACIÓN BÁSICA**

### **Paso 5: Archivo .env**

Crea `api/.env`:
```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=frios_db

# JWT Secret
JWT_SECRET=tu_clave_secreta_super_segura_12345
JWT_EXPIRE=24h

# CORS
ALLOWED_ORIGINS=http://localhost,http://127.0.0.1
```

### **Paso 6: Configuración de la base de datos**

Crea `api/src/config/database.js`:

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00'
});

// Verificar conexión
pool.getConnection()
    .then(connection => {
        console.log('✅ Conexión a MySQL exitosa');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Error al conectar a MySQL:', err.message);
    });

module.exports = pool;
```

---

## **FASE 4: ESTRUCTURA DE LA API**

### **Paso 7: Servidor principal**

Crea `api/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Importar rutas
const productosRoutes = require('./src/routes/productos.routes');
const clientesRoutes = require('./src/routes/clientes.routes');
const usuariosRoutes = require('./src/routes/usuarios.routes');
const authRoutes = require('./src/routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARES
// ========================================
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log de peticiones
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// ========================================
// RUTAS
// ========================================
app.get('/', (req, res) => {
    res.json({
        message: 'API TodoEnFrios - Sistema de Gestión',
        version: '1.0.0',
        status: 'online'
    });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Ruta 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: err.message 
    });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor API corriendo en http://localhost:${PORT}`);
    console.log(`📊 Entorno: ${process.env.NODE_ENV}`);
});
```

### **Paso 8: Middleware de autenticación JWT**

Crea `api/src/middlewares/auth.middleware.js`:

```javascript
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(403).json({ 
            error: 'Token no proporcionado' 
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ 
                error: 'Token inválido o expirado' 
            });
        }

        req.user = decoded;
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    if (req.user.id_tipo_usuario !== 1) {
        return res.status(403).json({ 
            error: 'Acceso denegado. Se requiere permisos de administrador' 
        });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin };
```

---

## **FASE 5: IMPLEMENTAR ENDPOINTS**

### **Paso 9: Modelo de Productos**

Crea `api/src/models/producto.model.js`:

```javascript
const db = require('../config/database');

class ProductoModel {
    // Obtener todos los productos
    static async getAll() {
        const [rows] = await db.query(`
            SELECT 
                p.*, 
                m.nombre AS nombre_marca, 
                c.nombre AS nombre_categoria, 
                med.medida AS nombre_medida 
            FROM productos AS p 
            INNER JOIN marcas AS m ON m.id = p.id_marca 
            INNER JOIN categorias AS c ON c.id = p.id_categoria 
            LEFT JOIN medidas AS med ON med.id = p.id_medida 
            ORDER BY p.fecha_crea DESC
        `);
        return rows;
    }

    // Obtener producto por ID
    static async getById(id) {
        const [rows] = await db.query(
            'SELECT * FROM productos WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // Obtener producto por código
    static async getByCodigo(codigo) {
        const [rows] = await db.query(
            'SELECT * FROM productos WHERE codigo = ?',
            [codigo]
        );
        return rows[0];
    }

    // Crear producto
    static async create(data) {
        const { codigo, nombre, descripcion, precio, stock, id_marca, id_medida, id_categoria, status, usuario_crea } = data;
        
        const [result] = await db.query(
            `INSERT INTO productos 
            (codigo, nombre, descripcion, precio, stock, id_marca, id_medida, id_categoria, status, usuario_crea) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [codigo, nombre, descripcion, precio, stock, id_marca, id_medida, id_categoria, status, usuario_crea]
        );
        
        return result.insertId;
    }

    // Actualizar producto
    static async update(id, data) {
        const { codigo, nombre, descripcion, precio, stock, id_marca, id_medida, id_categoria, status } = data;
        
        const [result] = await db.query(
            `UPDATE productos 
            SET codigo = ?, nombre = ?, descripcion = ?, precio = ?, stock = ?, 
                id_marca = ?, id_medida = ?, id_categoria = ?, status = ?
            WHERE id = ?`,
            [codigo, nombre, descripcion, precio, stock, id_marca, id_medida, id_categoria, status, id]
        );
        
        return result.affectedRows;
    }

    // Eliminar producto
    static async delete(id) {
        const [result] = await db.query('DELETE FROM productos WHERE id = ?', [id]);
        return result.affectedRows;
    }

    // Buscar productos
    static async search(query) {
        const [rows] = await db.query(
            `SELECT p.*, m.nombre AS nombre_marca 
            FROM productos p 
            INNER JOIN marcas m ON p.id_marca = m.id 
            WHERE p.nombre LIKE ? OR p.codigo LIKE ?`,
            [`%${query}%`, `%${query}%`]
        );
        return rows;
    }
}

module.exports = ProductoModel;
```

### **Paso 10: Controlador de Productos**

Crea `api/src/controllers/productos.controller.js`:

```javascript
const ProductoModel = require('../models/producto.model');

class ProductosController {
    // GET /api/productos
    static async getAll(req, res) {
        try {
            const productos = await ProductoModel.getAll();
            res.json({
                success: true,
                data: productos,
                count: productos.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/productos/:id
    static async getById(req, res) {
        try {
            const producto = await ProductoModel.getById(req.params.id);
            
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    error: 'Producto no encontrado'
                });
            }

            res.json({
                success: true,
                data: producto
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // POST /api/productos
    static async create(req, res) {
        try {
            const { codigo } = req.body;

            // Verificar si el código ya existe
            const existe = await ProductoModel.getByCodigo(codigo);
            if (existe) {
                return res.status(400).json({
                    success: false,
                    error: 'El código del producto ya existe'
                });
            }

            const id = await ProductoModel.create(req.body);
            const producto = await ProductoModel.getById(id);

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: producto
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // PUT /api/productos/:id
    static async update(req, res) {
        try {
            const affectedRows = await ProductoModel.update(req.params.id, req.body);

            if (affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Producto no encontrado'
                });
            }

            const producto = await ProductoModel.getById(req.params.id);

            res.json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: producto
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // DELETE /api/productos/:id
    static async delete(req, res) {
        try {
            const affectedRows = await ProductoModel.delete(req.params.id);

            if (affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Producto no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/productos/search?q=query
    static async search(req, res) {
        try {
            const { q } = req.query;

            if (!q) {
                return res.status(400).json({
                    success: false,
                    error: 'Parámetro de búsqueda requerido'
                });
            }

            const productos = await ProductoModel.search(q);

            res.json({
                success: true,
                data: productos,
                count: productos.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = ProductosController;
```

### **Paso 11: Rutas de Productos**

Crea `api/src/routes/productos.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const ProductosController = require('../controllers/productos.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

// Rutas públicas (consulta)
router.get('/', ProductosController.getAll);
router.get('/search', ProductosController.search);
router.get('/:id', ProductosController.getById);

// Rutas protegidas (requieren autenticación)
router.post('/', verifyToken, verifyAdmin, ProductosController.create);
router.put('/:id', verifyToken, verifyAdmin, ProductosController.update);
router.delete('/:id', verifyToken, verifyAdmin, ProductosController.delete);

module.exports = router;
```

---

## **FASE 6: AUTENTICACIÓN**

### **Paso 12: Rutas de autenticación**

Crea `api/src/routes/auth.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { documento, password } = req.body;

        if (!documento || !password) {
            return res.status(400).json({
                success: false,
                error: 'Documento y contraseña son requeridos'
            });
        }

        // Buscar usuario
        const [users] = await db.query(
            'SELECT * FROM usuarios WHERE documento = ?',
            [documento]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        const user = users[0];

        // Verificar contraseña (en tu caso es texto plano, idealmente debería ser bcrypt)
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        // Generar JWT
        const token = jwt.sign(
            {
                documento: user.documento,
                nombres: user.nombres,
                apellidos: user.apellidos,
                id_tipo_usuario: user.id_tipo_usuario
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                documento: user.documento,
                nombres: user.nombres,
                apellidos: user.apellidos,
                tipo_usuario: user.id_tipo_usuario
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
```

---

## **FASE 7: EJECUTAR Y PROBAR**

### **Paso 13: Configurar scripts en package.json**

Edita `api/package.json`:

```json
{
  "name": "todoenfrios-api",
  "version": "1.0.0",
  "description": "API REST para sistema TodoEnFrios",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["api", "rest", "express", "mysql"],
  "author": "TodoEnFrios",
  "license": "MIT"
}
```

### **Paso 14: Iniciar la API**

```bash
cd TODOENFRIOS/api
npm run dev
```

Deberías ver:
```
🚀 Servidor API corriendo en http://localhost:3000
📊 Entorno: development
✅ Conexión a MySQL exitosa
```

### **Paso 15: Probar endpoints con Postman/Thunder Client**

**1. Login:**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
    "documento": "1110460410",
    "password": "1110460410"
}
```

**2. Obtener productos:**
```
GET http://localhost:3000/api/productos
```

**3. Crear producto (requiere token):**
```
POST http://localhost:3000/api/productos
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json

{
    "codigo": "PROD001",
    "nombre": "Compresor X200",
    "descripcion": "Compresor industrial",
    "precio": 2500000.00,
    "stock": 10,
    "id_marca": 2,
    "id_medida": 1,
    "id_categoria": 1,
    "status": "activo",
    "usuario_crea": "API Test"
}
```

---

## **ENDPOINTS IMPLEMENTADOS**

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login de usuario | No |
| GET | `/api/productos` | Listar productos | No |
| GET | `/api/productos/:id` | Obtener producto por ID | No |
| GET | `/api/productos/search?q=` | Buscar productos | No |
| POST | `/api/productos` | Crear producto | Sí (Admin) |
| PUT | `/api/productos/:id` | Actualizar producto | Sí (Admin) |
| DELETE | `/api/productos/:id` | Eliminar producto | Sí (Admin) |

---

## **PRÓXIMOS PASOS**

1. Implementar endpoints para clientes, liquidaciones, servicios
2. Agregar validaciones con `express-validator`
3. Implementar paginación
4. Agregar logs con `winston`
5. Documentar API con Swagger
6. Configurar rate limiting
7. Agregar unit tests con Jest


## Continuación.

Nos faltaron mas archivos y a parte tuvimos errores debido a que nos indica que faltan los archivos de rutas. Vamos a crear toda la estructura completa paso a paso.



# 🚀 SOLUCIÓN COMPLETA - API REST SOLO GET (Empleados, Productos, Publicaciones)

## ❌ **ERROR IDENTIFICADO**

El error indica que faltan los archivos de rutas. Vamos a crear toda la estructura completa paso a paso.

---

## 📋 **PASO 1: CREAR ESTRUCTURA COMPLETA DE CARPETAS**

En `C:\xampp\htdocs\todoEnFrios\appi\`, crea esta estructura:

```
appi/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── abono.model.js
│   │   ├── categoria.model.js
│   │   ├── cliente.model.js
│   │   ├── conductor.model.js
│   │   ├── detalle_fact.model.js
│   │   ├── empleado.model.js
│   │   ├── estado.model.js
│   │   ├── img_producto.model.js
│   │   ├── liquidacion.model.js
│   │   ├── marca.model.js
│   │   ├── medida.model.js
│   │   ├── mi_negocio.model.js
│   │   ├── producto.model.js
│   │   ├── rol.model.js
│   │   ├── servicio.model.js
│   │   ├── tipo_documento.model.js
│   │   ├── tipo_persona.model.js
│   │   ├── tipo_usuario.model.js
│   │   ├── usuario.model.js
│   │   └── vehiculo.model.js
│   ├── controllers/
│   │   ├── empleados.controller.js
│   │   ├── productos.controller.js
│   │   └── publicaciones.controller.js
│   └── routes/
│       ├── empleados.routes.js
│       ├── productos.routes.js
│       └── publicaciones.routes.js
├── .env
├── server.js
└── package.json
```

---

## 📝 **PASO 2: ACTUALIZAR server.js**

Reemplaza `C:\xampp\htdocs\todoEnFrios\appi\server.js` con:

```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Importar rutas
const empleadosRoutes = require('./src/routes/empleados.routes');
const productosRoutes = require('./src/routes/productos.routes');
const publicacionesRoutes = require('./src/routes/publicaciones.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARES
// ========================================
app.use(cors({
    origin: '*', // Permite todas las origins en desarrollo
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log de peticiones
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.path}`);
    next();
});

// ========================================
// RUTAS
// ========================================
app.get('/', (req, res) => {
    res.json({
        message: '🚀 API TodoEnFrios - Sistema de Gestión',
        version: '1.0.0',
        status: 'online',
        endpoints: {
            empleados: '/api/empleados',
            productos: '/api/productos',
            publicaciones: '/api/publicaciones'
        }
    });
});

// Rutas de la API (SOLO GET)
app.use('/api/empleados', empleadosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/publicaciones', publicacionesRoutes);

// Ruta 404
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Ruta no encontrada' 
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor',
        message: err.message 
    });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor API corriendo en http://localhost:${PORT}`);
    console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Endpoints disponibles:`);
    console.log(`   GET /api/empleados`);
    console.log(`   GET /api/productos`);
    console.log(`   GET /api/publicaciones\n`);
});
```

---

## 🗄️ **PASO 3: MODELOS COMPLETOS (MVC)**

### **3.1 - abono.model.js**

```javascript
const db = require('../config/database');

class AbonoModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM abonos ORDER BY fecha DESC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM abonos WHERE id_abono = ?', [id]);
        return rows[0];
    }

    static async getByFactura(idFactura) {
        const [rows] = await db.query('SELECT * FROM abonos WHERE id_factura = ?', [idFactura]);
        return rows;
    }
}

module.exports = AbonoModel;
```

### **3.2 - categoria.model.js**

```javascript
const db = require('../config/database');

class CategoriaModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM categorias ORDER BY nombre ASC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
        return rows[0];
    }

    static async getByTipo(tipo) {
        const [rows] = await db.query('SELECT * FROM categorias WHERE tipo_categoria = ? AND estado = "activo"', [tipo]);
        return rows;
    }
}

module.exports = CategoriaModel;
```

### **3.3 - cliente.model.js**

```javascript
const db = require('../config/database');

class ClienteModel {
    static async getAll() {
        const [rows] = await db.query(`
            SELECT c.*, tp.tipo AS tipo_persona_nombre 
            FROM clientes c 
            INNER JOIN tipo_persona tp ON c.id_tipo_persona = tp.id 
            ORDER BY c.fecha_crea DESC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(`
            SELECT c.*, tp.tipo AS tipo_persona_nombre 
            FROM clientes c 
            INNER JOIN tipo_persona tp ON c.id_tipo_persona = tp.id 
            WHERE c.id_cliente = ?
        `, [id]);
        return rows[0];
    }

    static async getByDocumento(documento) {
        const [rows] = await db.query('SELECT * FROM clientes WHERE numero_documento = ?', [documento]);
        return rows[0];
    }
}

module.exports = ClienteModel;
```

### **3.4 - conductor.model.js**

```javascript
const db = require('../config/database');

class ConductorModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM conductores ORDER BY nombre ASC');
        return rows;
    }

    static async getById(documento) {
        const [rows] = await db.query('SELECT * FROM conductores WHERE documento = ?', [documento]);
        return rows[0];
    }
}

module.exports = ConductorModel;
```

### **3.5 - detalle_fact.model.js**

```javascript
const db = require('../config/database');

class DetalleFactModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM detalle_fact ORDER BY fecha_crea DESC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM detalle_fact WHERE id_deta_producto = ?', [id]);
        return rows[0];
    }

    static async getByFactura(idFact) {
        const [rows] = await db.query('SELECT * FROM detalle_fact WHERE id_fact = ?', [idFact]);
        return rows;
    }
}

module.exports = DetalleFactModel;
```

### **3.6 - empleado.model.js**

```javascript
const db = require('../config/database');

class EmpleadoModel {
    static async getAll() {
        const [rows] = await db.query(`
            SELECT e.*, r.nombre AS nombre_rol 
            FROM empleados e 
            LEFT JOIN roles r ON e.rol = r.id 
            ORDER BY e.fecha_crea DESC
        `);
        return rows;
    }

    static async getById(documento) {
        const [rows] = await db.query(`
            SELECT e.*, r.nombre AS nombre_rol 
            FROM empleados e 
            LEFT JOIN roles r ON e.rol = r.id 
            WHERE e.documento = ?
        `, [documento]);
        return rows[0];
    }

    static async getActivos() {
        const [rows] = await db.query('SELECT * FROM empleados WHERE status = "activo"');
        return rows;
    }
}

module.exports = EmpleadoModel;
```

### **3.7 - estado.model.js**

```javascript
const db = require('../config/database');

class EstadoModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM estados ORDER BY id ASC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM estados WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = EstadoModel;
```

### **3.8 - img_producto.model.js**

```javascript
const db = require('../config/database');

class ImgProductoModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM img_productos WHERE estado = "activo" ORDER BY fecha_crea DESC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM img_productos WHERE id = ?', [id]);
        return rows[0];
    }

    static async getByCodProducto(codProducto) {
        const [rows] = await db.query('SELECT * FROM img_productos WHERE cod_producto = ? AND estado = "activo"', [codProducto]);
        return rows;
    }
}

module.exports = ImgProductoModel;
```

### **3.9 - liquidacion.model.js**

```javascript
const db = require('../config/database');

class LiquidacionModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM liquidaciones ORDER BY fecha_factura DESC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM liquidaciones WHERE id__factura = ?', [id]);
        return rows[0];
    }

    static async getByPlaca(placa) {
        const [rows] = await db.query('SELECT * FROM liquidaciones WHERE placa = ?', [placa]);
        return rows;
    }
}

module.exports = LiquidacionModel;
```

### **3.10 - marca.model.js**

```javascript
const db = require('../config/database');

class MarcaModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM marcas ORDER BY nombre ASC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM marcas WHERE id = ?', [id]);
        return rows[0];
    }

    static async getByTipo(tipo) {
        const [rows] = await db.query('SELECT * FROM marcas WHERE tipo_marca = ? AND status = "activo"', [tipo]);
        return rows;
    }
}

module.exports = MarcaModel;
```

### **3.11 - medida.model.js**

```javascript
const db = require('../config/database');

class MedidaModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM medidas ORDER BY medida ASC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM medidas WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = MedidaModel;
```

### **3.12 - mi_negocio.model.js**

```javascript
const db = require('../config/database');

class MiNegocioModel {
    static async get() {
        const [rows] = await db.query('SELECT * FROM mi_negocio LIMIT 1');
        return rows[0];
    }
}

module.exports = MiNegocioModel;
```

### **3.13 - producto.model.js**

```javascript
const db = require('../config/database');

class ProductoModel {
    static async getAll() {
        const [rows] = await db.query(`
            SELECT 
                p.*, 
                m.nombre AS nombre_marca, 
                c.nombre AS nombre_categoria, 
                med.medida AS nombre_medida 
            FROM productos AS p 
            INNER JOIN marcas AS m ON m.id = p.id_marca 
            INNER JOIN categorias AS c ON c.id = p.id_categoria 
            LEFT JOIN medidas AS med ON med.id = p.id_medida 
            ORDER BY p.fecha_crea DESC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(`
            SELECT 
                p.*, 
                m.nombre AS nombre_marca, 
                c.nombre AS nombre_categoria, 
                med.medida AS nombre_medida 
            FROM productos AS p 
            INNER JOIN marcas AS m ON m.id = p.id_marca 
            INNER JOIN categorias AS c ON c.id = p.id_categoria 
            LEFT JOIN medidas AS med ON med.id = p.id_medida 
            WHERE p.id = ?
        `, [id]);
        return rows[0];
    }

    static async getByCodigo(codigo) {
        const [rows] = await db.query('SELECT * FROM productos WHERE codigo = ?', [codigo]);
        return rows[0];
    }

    static async getConImagenes() {
        const [rows] = await db.query(`
            SELECT 
                p.*, 
                m.nombre AS nombre_marca,
                GROUP_CONCAT(img.url) AS imagenes
            FROM productos AS p 
            INNER JOIN marcas AS m ON m.id = p.id_marca 
            LEFT JOIN img_productos AS img ON img.cod_producto = p.codigo AND img.estado = 'activo'
            GROUP BY p.id
            ORDER BY p.fecha_crea DESC
        `);
        return rows;
    }
}

module.exports = ProductoModel;
```

### **3.14 - rol.model.js**

```javascript
const db = require('../config/database');

class RolModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM roles WHERE status = "activo" ORDER BY nombre ASC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM roles WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = RolModel;
```

### **3.15 - servicio.model.js**

```javascript
const db = require('../config/database');

class ServicioModel {
    static async getAll() {
        const [rows] = await db.query(`
            SELECT s.*, c.nombre AS nombre_categoria 
            FROM servicios s 
            LEFT JOIN categorias c ON s.id_categoria = c.id 
            ORDER BY s.fecha_crea DESC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(`
            SELECT s.*, c.nombre AS nombre_categoria 
            FROM servicios s 
            LEFT JOIN categorias c ON s.id_categoria = c.id 
            WHERE s.id = ?
        `, [id]);
        return rows[0];
    }
}

module.exports = ServicioModel;
```

### **3.16 - tipo_documento.model.js**

```javascript
const db = require('../config/database');

class TipoDocumentoModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM tipo_documento WHERE estado = "activo"');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM tipo_documento WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = TipoDocumentoModel;
```

### **3.17 - tipo_persona.model.js**

```javascript
const db = require('../config/database');

class TipoPersonaModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM tipo_persona WHERE estado = "activo"');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM tipo_persona WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = TipoPersonaModel;
```

### **3.18 - tipo_usuario.model.js**

```javascript
const db = require('../config/database');

class TipoUsuarioModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM tipo_usuario');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM tipo_usuario WHERE id_tipo_usuario = ?', [id]);
        return rows[0];
    }
}

module.exports = TipoUsuarioModel;
```

### **3.19 - usuario.model.js**

```javascript
const db = require('../config/database');

class UsuarioModel {
    static async getAll() {
        const [rows] = await db.query(`
            SELECT u.*, tu.tipo_usuario, e.estado 
            FROM usuarios u 
            LEFT JOIN tipo_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario 
            LEFT JOIN estados e ON u.id_estado = e.id 
            ORDER BY u.fecha_crea DESC
        `);
        return rows;
    }

    static async getById(documento) {
        const [rows] = await db.query(`
            SELECT u.*, tu.tipo_usuario, e.estado 
            FROM usuarios u 
            LEFT JOIN tipo_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario 
            LEFT JOIN estados e ON u.id_estado = e.id 
            WHERE u.documento = ?
        `, [documento]);
        return rows[0];
    }
}

module.exports = UsuarioModel;
```

### **3.20 - vehiculo.model.js**

```javascript
const db = require('../config/database');

class VehiculoModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM vehiculos ORDER BY fecha_crea DESC');
        return rows;
    }

    static async getById(placa) {
        const [rows] = await db.query('SELECT * FROM vehiculos WHERE placa = ?', [placa]);
        return rows[0];
    }

    static async getByNit(nit) {
        const [rows] = await db.query('SELECT * FROM vehiculos WHERE nit = ?', [nit]);
        return rows;
    }
}

module.exports = VehiculoModel;
```

---

## 🎮 **PASO 4: CONTROLADORES (Solo GET)**

### **4.1 - empleados.controller.js**

```javascript
const EmpleadoModel = require('../models/empleado.model');

class EmpleadosController {
    // GET /api/empleados
    static async getAll(req, res) {
        try {
            const empleados = await EmpleadoModel.getAll();
            res.json({
                success: true,
                data: empleados,
                count: empleados.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/empleados/:documento
    static async getById(req, res) {
        try {
            const empleado = await EmpleadoModel.getById(req.params.documento);
            
            if (!empleado) {
                return res.status(404).json({
                    success: false,
                    error: 'Empleado no encontrado'
                });
            }

            res.json({
                success: true,
                data: empleado
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/empleados/activos
    static async getActivos(req, res) {
        try {
            const empleados = await EmpleadoModel.getActivos();
            res.json({
                success: true,
                data: empleados,
                count: empleados.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = EmpleadosController;
```

### **4.2 - productos.controller.js**

```javascript
const ProductoModel = require('../models/producto.model');
const ImgProductoModel = require('../models/img_producto.model');

class ProductosController {
    // GET /api/productos
    static async getAll(req, res) {
        try {
            const productos = await ProductoModel.getAll();
            res.json({
                success: true,
                data: productos,
                count: productos.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/productos/:id
    static async getById(req, res) {
        try {
            const producto = await ProductoModel.getById(req.params.id);
            
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    error: 'Producto no encontrado'
                });
            }

            // Obtener imágenes del producto
            const imagenes = await ImgProductoModel.getByCodProducto(producto.codigo);
            producto.imagenes = imagenes;

            res.json({
                success: true,
                data: producto
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/productos/codigo/:codigo
    static async getByCodigo(req, res) {
        try {
            const producto = await ProductoModel.getByCodigo(req.params.codigo);
            
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    error: 'Producto no encontrado'
                });
            }

            res.json({
                success: true,
                data: producto
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/productos/con-imagenes
    static async getConImagenes(req, res) {
        try {
            const productos = await ProductoModel.getConImagenes();
            res.json({
                success: true,
                data: productos,
                count: productos.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = ProductosController;
```

### **4.3 - publicaciones.controller.js**

```javascript
const MiNegocioModel = require('../models/mi_negocio.model');

class PublicacionesController {
    // GET /api/publicaciones
    static async getInfo(req, res) {
        try {
            const negocio = await MiNegocioModel.get();
            
            if (!negocio) {
                return res.status(404).json({
                    success: false,
                    error: 'Información del negocio no encontrada'
                });
            }

            res.json({
                success: true,
                data: negocio
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = PublicacionesController;
```

---

## 🛣️ **PASO 5: RUTAS (Solo GET)**

### **5.1 - empleados.routes.js**

```javascript
const express = require('express');
const router = express.Router();
const EmpleadosController = require('../controllers/empleados.controller');

router.get('/', EmpleadosController.getAll);
router.get('/activos', EmpleadosController.getActivos);
router.get('/:documento', EmpleadosController.getById);

module.exports = router;
```

### **5.2 - productos.routes.js**

```javascript
const express = require('express');
const router = express.Router();
const ProductosController = require('../controllers/productos.controller');

router.get('/', ProductosController.getAll);
router.get('/con-imagenes', ProductosController.getConImagenes);
router.get('/codigo/:codigo', ProductosController.getByCodigo);
router.get('/:id', ProductosController.getById);

module.exports = router;
```

### **5.3 - publicaciones.routes.js**

```javascript
const express = require('express');
const router = express.Router();
const PublicacionesController = require('../controllers/publicaciones.controller');

router.get('/', PublicacionesController.getInfo);

module.exports = router;
```

---

## ✅ **PASO 6: VERIFICAR Y EJECUTAR**

### **1. Verifica que todos los archivos existan:**

```bash
cd C:\xampp\htdocs\todoEnFrios\appi
dir src\models
dir src\controllers
dir src\routes
```

### **2. Ejecuta el servidor:**

```bash
npm run dev
```

### **3. Deberías ver:**

```
🚀 Servidor API corriendo en http://localhost:3000
📊 Entorno: development
📡 Endpoints disponibles:
   GET /api/empleados
   GET /api/productos
   GET /api/publicaciones

✅ Conexión a MySQL exitosa
```

---

## 🧪 **PASO 7: PROBAR ENDPOINTS**

### **Empleados:**
```
GET http://localhost:3000/api/empleados
GET http://localhost:3000/api/empleados/activos
GET http://localhost:3000/api/empleados/1110460410
```

### **Productos:**
```
GET http://localhost:3000/api/productos
GET http://localhost:3000/api/productos/1
GET http://localhost:3000/api/productos/con-imagenes
GET http://localhost:3000/api/productos/codigo/PROD001
```

### **Publicaciones (Info del Negocio):**
```
GET http://localhost:3000/api/publicaciones
```

---

## 📊 **RESUMEN DE ENDPOINTS CREADOS**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/empleados` | GET | Todos los empleados |
| `/api/empleados/activos` | GET | Empleados activos |
| `/api/empleados/:documento` | GET | Empleado por documento |
| `/api/productos` | GET | Todos los productos |
| `/api/productos/:id` | GET | Producto por ID |
| `/api/productos/codigo/:codigo` | GET | Producto por código |
| `/api/productos/con-imagenes` | GET | Productos con sus imágenes |
| `/api/publicaciones` | GET | Información del negocio |

---

## Ultima Correccion.

ERROR IDENTIFICADO
Hay un error de sintaxis en el archivo empleado.model.js. La línea 30 tiene una "s" extra:
javascriptmodule.exports = EmpleadoModel;s  // ← La "s" al final está causando el error

✅ SOLUCIÓN
Abre el archivo C:\xampp\htdocs\todoEnFrios\appi\src\models\empleado.model.js y reemplázalo con este código corregido:
javascriptconst db = require('../config/database');

class EmpleadoModel {
    static async getAll() {
        const [rows] = await db.query(`
            SELECT e.*, r.nombre AS nombre_rol 
            FROM empleados e 
            LEFT JOIN roles r ON e.rol = r.id 
            ORDER BY e.fecha_crea DESC
        `);
        return rows;
    }

    static async getById(documento) {
        const [rows] = await db.query(`
            SELECT e.*, r.nombre AS nombre_rol 
            FROM empleados e 
            LEFT JOIN roles r ON e.rol = r.id 
            WHERE e.documento = ?
        `, [documento]);
        return rows[0];
    }

    static async getActivos() {
        const [rows] = await db.query('SELECT * FROM empleados WHERE status = "activo"');
        return rows;
    }
}

module.exports = EmpleadoModel;
Cambio realizado: Eliminé la "s" extra al final de la línea 30.



🛡️ AGREGAR STATUS HTTP CORRECTOS
¡SÍ, DEBES AGREGAR STATUS HTTP! Tu API actual ya los tiene implementados, pero te mostraré cómo mejorarlos.
📋 Códigos HTTP que debes usar:
CódigoSignificadoCuándo usarlo200OKPetición exitosa (GET, PUT)201CreatedRecurso creado exitosamente (POST)400Bad RequestDatos inválidos enviados por el cliente401UnauthorizedToken inválido o no autenticado403ForbiddenNo tienes permisos (ej: no eres admin)404Not FoundRecurso no encontrado500Internal Server ErrorError del servidor

🔧 MEJORA DEL server.js CON STATUS HTTP
Reemplaza tu C:\xampp\htdocs\api\server.js con esta versión mejorada:
javascriptconst express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Importar rutas
const empleadosRoutes = require('./src/routes/empleados.routes');
const productosRoutes = require('./src/routes/productos.routes');
const publicacionesRoutes = require('./src/routes/publicaciones.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARES
// ========================================
app.use(cors({
    origin: '*', // En producción, especifica dominios permitidos
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log de peticiones con colores
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString('es-CO');
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ========================================
// RUTAS
// ========================================

// Ruta raíz - Estado de la API
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 API TodoEnFrios - Sistema de Gestión',
        version: '1.0.0',
        status: 'online',
        timestamp: new Date().toISOString(),
        endpoints: {
            empleados: '/api/empleados',
            productos: '/api/productos',
            publicaciones: '/api/publicaciones'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Rutas de la API
app.use('/api/empleados', empleadosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/publicaciones', publicacionesRoutes);

// ========================================
// MANEJO DE ERRORES
// ========================================

// 404 - Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Ruta no encontrada',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// 500 - Error interno del servidor
app.use((err, req, res, next) => {
    console.error('❌ Error interno:', err.stack);
    
    res.status(err.status || 500).json({ 
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error',
        timestamp: new Date().toISOString()
    });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   🚀 API TodoEnFrios INICIADA         ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`📡 Servidor: http://localhost:${PORT}`);
    console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Iniciado: ${new Date().toLocaleString('es-CO')}`);
    console.log('\n📋 Endpoints disponibles:');
    console.log(`   GET  /api/empleados`);
    console.log(`   GET  /api/productos`);
    console.log(`   GET  /api/publicaciones`);
    console.log(`   GET  /health (estado del servidor)`);
    console.log('═════════════════════════════════════════\n');
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\n⚠️  Cerrando servidor...');
    process.exit(0);
});

🎨 MEJORA DE CONTROLADORES CON STATUS HTTP
productos.controller.js mejorado:
javascriptconst ProductoModel = require('../models/producto.model');
const ImgProductoModel = require('../models/img_producto.model');

class ProductosController {
    // GET /api/productos
    static async getAll(req, res) {
        try {
            const productos = await ProductoModel.getAll();
            
            // 200 OK - Petición exitosa
            res.status(200).json({
                success: true,
                data: productos,
                count: productos.length,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error en getAll:', error);
            
            // 500 Internal Server Error
            res.status(500).json({
                success: false,
                error: 'Error al obtener productos',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/productos/:id
    static async getById(req, res) {
        try {
            const { id } = req.params;

            // Validar que el ID sea numérico
            if (isNaN(id)) {
                // 400 Bad Request - Datos inválidos
                return res.status(400).json({
                    success: false,
                    error: 'ID inválido',
                    message: 'El ID debe ser un número',
                    timestamp: new Date().toISOString()
                });
            }

            const producto = await ProductoModel.getById(id);
            
            if (!producto) {
                // 404 Not Found - Recurso no encontrado
                return res.status(404).json({
                    success: false,
                    error: 'Producto no encontrado',
                    id: id,
                    timestamp: new Date().toISOString()
                });
            }

            // Obtener imágenes del producto
            const imagenes = await ImgProductoModel.getByCodProducto(producto.codigo);
            producto.imagenes = imagenes;

            // 200 OK
            res.status(200).json({
                success: true,
                data: producto,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error en getById:', error);
            
            // 500 Internal Server Error
            res.status(500).json({
                success: false,
                error: 'Error al obtener producto',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/productos/codigo/:codigo
    static async getByCodigo(req, res) {
        try {
            const { codigo } = req.params;

            if (!codigo || codigo.trim() === '') {
                // 400 Bad Request
                return res.status(400).json({
                    success: false,
                    error: 'Código inválido',
                    message: 'El código no puede estar vacío',
                    timestamp: new Date().toISOString()
                });
            }

            const producto = await ProductoModel.getByCodigo(codigo);
            
            if (!producto) {
                // 404 Not Found
                return res.status(404).json({
                    success: false,
                    error: 'Producto no encontrado',
                    codigo: codigo,
                    timestamp: new Date().toISOString()
                });
            }

            // 200 OK
            res.status(200).json({
                success: true,
                data: producto,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error en getByCodigo:', error);
            
            // 500 Internal Server Error
            res.status(500).json({
                success: false,
                error: 'Error al obtener producto',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/productos/con-imagenes
    static async getConImagenes(req, res) {
        try {
            const productos = await ProductoModel.getConImagenes();
            
            // 200 OK
            res.status(200).json({
                success: true,
                data: productos,
                count: productos.length,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error en getConImagenes:', error);
            
            // 500 Internal Server Error
            res.status(500).json({
                success: false,
                error: 'Error al obtener productos con imágenes',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = ProductosController;

📊 RESUMEN DE CAMBIOS
✅ Lo que agregamos:

Status HTTP explícitos:

200 para éxito
400 para datos inválidos
404 para recursos no encontrados
500 para errores del servidor


Timestamps: Cada respuesta incluye la fecha/hora
Validaciones: Verificamos que los datos sean correctos antes de consultar la BD
Mensajes claros: Errores descriptivos para debugging
Health check: Endpoint /health para monitorear el servidor
Logs mejorados: Con marca de tiempo y formato claro