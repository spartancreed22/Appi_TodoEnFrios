const db = require('../config/database');

class ClienteModel {
    static async getAll() {
        const [rows] = await db.query(`
            SELECT c.*, tp.tipo AS tipo_persona_nombre 
            FROM clientes c 
            INNER JOIN tipo_persona tp ON c.id_tipo_persona = tp.id 
            ORDER BY c.fecha_crea DESC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(`
            SELECT c.*, tp.tipo AS tipo_persona_nombre 
            FROM clientes c 
            INNER JOIN tipo_persona tp ON c.id_tipo_persona = tp.id 
            WHERE c.id_cliente = ?
        `, [id]);
        return rows[0];
    }

    static async getByDocumento(documento) {
        const [rows] = await db.query('SELECT * FROM clientes WHERE numero_documento = ?', [documento]);
        return rows[0];
    }
}

module.exports = ClienteModel;