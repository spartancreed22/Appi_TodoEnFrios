const db = require('../config/database');

class LiquidacionModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM liquidaciones ORDER BY fecha_factura DESC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM liquidaciones WHERE id__factura = ?', [id]);
        return rows[0];
    }

    static async getByPlaca(placa) {
        const [rows] = await db.query('SELECT * FROM liquidaciones WHERE placa = ?', [placa]);
        return rows;
    }
}

module.exports = LiquidacionModel;