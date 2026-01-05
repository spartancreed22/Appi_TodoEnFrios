# 📋 DOCUMENTACIÓN TÉCNICA DEL PROYECTO TODOENFRIOS

## 🏗️ ARQUITECTURA DEL SISTEMA

### **Stack Tecnológico Actual**

**Backend:**
- **Lenguaje:** PHP 7.4+
- **Arquitectura:** MVC (Model-View-Controller)
- **Base de Datos:** MySQL/MariaDB 10.4.32
- **Servidor:** Apache (XAMPP)
- **Gestor BD:** phpMyAdmin

**Frontend:**
- **HTML5, CSS3, JavaScript**
- **Framework CSS:** Bootstrap 5
- **Librerías JS:** jQuery, DataTables
- **Iconos:** Boxicons, Font Awesome

---

## 📂 ESTRUCTURA DEL PROYECTO

```
TODOENFRIOS/
├── app/
│   ├── admin/               # Panel de administración
│   │   ├── components/      # Componentes reutilizables (sidebar, header, footer)
│   │   ├── controllers/     # Lógica de negocio y procesamiento de datos
│   │   ├── views/          # Vistas HTML/PHP del admin
│   │   └── index.php       # Punto de entrada admin
│   ├── auth/               # Sistema de autenticación
│   │   ├── components/     # Componentes de login/registro
│   │   ├── controllers/    # Controladores de sesión
│   │   ├── views/         # Vistas de login
│   │   └── index.php
│   ├── config/            # Configuración de BD y constantes
│   ├── uploads/           # Archivos subidos (imágenes productos)
│   │   └── productos/
│   └── index.php          # Punto de entrada principal
├── assets/
│   ├── css/              # Estilos personalizados
│   ├── images/           # Recursos visuales
│   ├── js/              # Scripts JavaScript
│   └── vendor/          # Librerías de terceros
├── functions/           # Funciones PHP globales
├── validation/          # Validaciones del lado del servidor
└── .htaccess           # Configuración Apache
```

---

## 🗄️ MODELO DE DATOS

### **Entidades Principales**

#### **1. Usuarios y Autenticación**
- `usuarios` - Usuarios del sistema
- `tipo_usuario` - Roles (admin, empleado, conductor)
- `empleados` - Información detallada de empleados
- `tipo_documento` - Tipos de documentos de identidad

#### **2. Clientes**
- `clientes` - Clientes (personas naturales/jurídicas)
- `tipo_persona` - Natural o Jurídica

#### **3. Inventario**
- `productos` - Catálogo de productos
- `servicios` - Servicios ofrecidos
- `marcas` - Marcas de productos
- `categorias` - Categorización de productos/servicios
- `medidas` - Unidades de medida
- `img_productos` - Imágenes de productos

#### **4. Operaciones**
- `liquidaciones` - Facturas de compra/venta
- `detalle_fact` - Detalle de productos/servicios facturados
- `abonos` - Pagos parciales de facturas
- `vehiculos` - Vehículos asociados a empresas
- `conductores` - Conductores de vehículos

#### **5. Configuración**
- `mi_negocio` - Información de la empresa
- `estados` - Estados globales del sistema
- `roles` - Roles personalizados

---

## 🔐 SEGURIDAD IMPLEMENTADA

✅ **Prepared Statements** (PDO) - Prevención de SQL Injection  
✅ **Validación de sesiones** - Control de acceso  
✅ **Sanitización de inputs** - htmlspecialchars()  
✅ **Validación de archivos** - Tamaño y tipo de imágenes  
✅ **Control de permisos** - Por rol de usuario  

---

