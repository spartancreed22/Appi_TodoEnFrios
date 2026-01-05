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