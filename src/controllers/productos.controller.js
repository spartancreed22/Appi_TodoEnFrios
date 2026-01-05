const ProductoModel = require('../models/producto.model');
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