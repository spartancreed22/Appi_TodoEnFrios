const db = require('../config/database');

class AbonoModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM abonos ORDER BY fecha DESC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM abonos WHERE id_abono = ?', [id]);
        return rows[0];
    }

    static async getByFactura(idFactura) {
        const [rows] = await db.query('SELECT * FROM abonos WHERE id_factura = ?', [idFactura]);
        return rows;
    }
}

module.exports = AbonoModel;