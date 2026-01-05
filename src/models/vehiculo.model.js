const db = require('../config/database');

class VehiculoModel {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM vehiculos ORDER BY fecha_crea DESC');
        return rows;
    }

    static async getById(placa) {
        const [rows] = await db.query('SELECT * FROM vehiculos WHERE placa = ?', [placa]);
        return rows[0];
    }

    static async getByNit(nit) {
        const [rows] = await db.query('SELECT * FROM vehiculos WHERE nit = ?', [nit]);
        return rows;
    }
}

module.exports = VehiculoModel;