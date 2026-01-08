const ProductoModel = require('../models/producto.model');
const ImgProductoModel = require('../models/img_producto.model');

class ProductosController {
    // GET /api/productos
    static async getAll(req, res) {
        try {
            const productos = await ProductoModel.getAll();
            
            res.status(200).json({
                success: true,
                data: productos,
                count: productos.length,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error en getAll:', error);
            
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener los productos',
                details: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/productos/:id
    static async getById(req, res) {
        try {
            const { id } = req.params;

            if (isNaN(id) || id <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'ID inválido',
                    message: 'El ID del producto debe ser un número positivo',
                    received: id,
                    timestamp: new Date().toISOString()
                });
            }

            const producto = await ProductoModel.getById(id);
            
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    error: 'Producto no encontrado',
                    message: `No existe ningún producto con el ID ${id}`,
                    id: id,
                    timestamp: new Date().toISOString()
                });
            }

            // Obtener imágenes del producto
            const imagenes = await ImgProductoModel.getByCodProducto(producto.codigo);
            producto.imagenes = imagenes || [];

            res.status(200).json({
                success: true,
                data: producto,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error en getById:', error);
            
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudo obtener el producto',
                details: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/productos/codigo/:codigo
    static async getByCodigo(req, res) {
        try {
            const { codigo } = req.params;

            if (!codigo || codigo.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: 'Código inválido',
                    message: 'El código del producto no puede estar vacío',
                    timestamp: new Date().toISOString()
                });
            }

            const producto = await ProductoModel.getByCodigo(codigo);
            
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    error: 'Producto no encontrado',
                    message: `No existe ningún producto con el código ${codigo}`,
                    codigo: codigo,
                    timestamp: new Date().toISOString()
                });
            }

            res.status(200).json({
                success: true,
                data: producto,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error en getByCodigo:', error);
            
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudo obtener el producto',
                details: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/productos/con-imagenes
    static async getConImagenes(req, res) {
        try {
            const productos = await ProductoModel.getConImagenes();
            
            res.status(200).json({
                success: true,
                data: productos,
                count: productos.length,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error en getConImagenes:', error);
            
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener los productos con imágenes',
                details: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/productos/search?q=query
    static async search(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: 'Parámetro de búsqueda requerido',
                    message: 'Debe proporcionar un término de búsqueda',
                    timestamp: new Date().toISOString()
                });
            }

            const productos = await ProductoModel.search(q);

            res.status(200).json({
                success: true,
                data: productos,
                count: productos.length,
                query: q,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error en search:', error);
            
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudo realizar la búsqueda',
                details: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = ProductosController;