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