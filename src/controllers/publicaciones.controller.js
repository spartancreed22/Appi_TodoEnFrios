const PublicacionModel = require('../models/publicacion.model');

class PublicacionesController {
    // GET /api/publicaciones
    static async getAll(req, res) {
        try {
            const publicaciones = await PublicacionModel.getAll();
            
            res.status(200).json({
                success: true,
                data: publicaciones,
                count: publicaciones.length,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error en getAll:', error);
            
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener las publicaciones',
                details: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/publicaciones/:id
    static async getById(req, res) {
        try {
            const { id } = req.params;

            if (isNaN(id) || id <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'ID inválido',
                    message: 'El ID de la publicación debe ser un número positivo',
                    received: id,
                    timestamp: new Date().toISOString()
                });
            }

            const publicacion = await PublicacionModel.getById(id);
            
            if (!publicacion) {
                return res.status(404).json({
                    success: false,
                    error: 'Publicación no encontrada',
                    message: `No existe ninguna publicación con el ID ${id}`,
                    id: id,
                    timestamp: new Date().toISOString()
                });
            }

            res.status(200).json({
                success: true,
                data: publicacion,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error en getById:', error);
            
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudo obtener la publicación',
                details: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/publicaciones/vigentes
    static async getVigentes(req, res) {
        try {
            const publicaciones = await PublicacionModel.getVigentes();
            
            res.status(200).json({
                success: true,
                data: publicaciones,
                count: publicaciones.length,
                message: 'Publicaciones activas actualmente',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error en getVigentes:', error);
            
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener las publicaciones vigentes',
                details: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/publicaciones/proximas
    static async getProximas(req, res) {
        try {
            const publicaciones = await PublicacionModel.getProximas();
            
            res.status(200).json({
                success: true,
                data: publicaciones,
                count: publicaciones.length,
                message: 'Publicaciones próximas a iniciar',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error en getProximas:', error);
            
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener las publicaciones próximas',
                details: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/publicaciones/vencidas
    static async getVencidas(req, res) {
        try {
            const publicaciones = await PublicacionModel.getVencidas();
            
            res.status(200).json({
                success: true,
                data: publicaciones,
                count: publicaciones.length,
                message: 'Publicaciones vencidas',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error en getVencidas:', error);
            
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudieron obtener las publicaciones vencidas',
                details: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/publicaciones/search?q=query
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

            const publicaciones = await PublicacionModel.search(q);

            res.status(200).json({
                success: true,
                data: publicaciones,
                count: publicaciones.length,
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

module.exports = PublicacionesController;