const NegocioModel = require('../models/negocio.model');

class NegocioController {
    // GET /api/negocio
    static async getInfo(req, res) {
        try {
            const negocio = await NegocioModel.get();
            
            if (!negocio) {
                return res.status(404).json({
                    success: false,
                    error: 'Información no encontrada',
                    message: 'No se encontró información del negocio en la base de datos',
                    timestamp: new Date().toISOString()
                });
            }

            res.status(200).json({
                success: true,
                data: negocio,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error en getInfo:', error);
            
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudo obtener la información del negocio',
                details: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // GET /api/negocio/exists
    static async checkExists(req, res) {
        try {
            const exists = await NegocioModel.exists();
            
            res.status(200).json({
                success: true,
                exists: exists,
                message: exists 
                    ? 'La información del negocio existe' 
                    : 'No hay información del negocio registrada',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error en checkExists:', error);
            
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'No se pudo verificar la existencia del negocio',
                details: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = NegocioController;