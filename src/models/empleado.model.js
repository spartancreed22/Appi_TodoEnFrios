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