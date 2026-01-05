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