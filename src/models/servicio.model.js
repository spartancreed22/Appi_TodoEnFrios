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