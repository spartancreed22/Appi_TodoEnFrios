const db = require('../config/database');

class PublicacionModel {
    // Obtener todas las publicaciones activas y vigentes
    static async getAll() {
        const [rows] = await db.query(`
            SELECT * 
            FROM publicaciones 
            WHERE status = 'activo' 
              AND fecha_fin_publi >= CURDATE()
            ORDER BY fecha_inicio_publi DESC
        `);
        return rows;
    }

    // Obtener publicación por ID
    static async getById(id) {
        const [rows] = await db.query(`
            SELECT * 
            FROM publicaciones 
            WHERE id = ?
        `, [id]);
        return rows[0];
    }

    // Obtener publicaciones vigentes (fecha actual entre inicio y fin)
    static async getVigentes() {
        const [rows] = await db.query(`
            SELECT * 
            FROM publicaciones 
            WHERE status = 'activo' 
              AND fecha_inicio_publi <= CURDATE() 
              AND fecha_fin_publi >= CURDATE()
            ORDER BY fecha_inicio_publi DESC
        `);
        return rows;
    }

    // Obtener próximas publicaciones (que aún no han iniciado)
    static async getProximas() {
        const [rows] = await db.query(`
            SELECT * 
            FROM publicaciones 
            WHERE status = 'activo' 
              AND fecha_inicio_publi > CURDATE()
            ORDER BY fecha_inicio_publi ASC
        `);
        return rows;
    }

    // Obtener publicaciones vencidas
    static async getVencidas() {
        const [rows] = await db.query(`
            SELECT * 
            FROM publicaciones 
            WHERE status = 'activo' 
              AND fecha_fin_publi < CURDATE()
            ORDER BY fecha_fin_publi DESC
        `);
        return rows;
    }

    // Buscar publicaciones por título
    static async search(query) {
        const [rows] = await db.query(`
            SELECT * 
            FROM publicaciones 
            WHERE status = 'activo' 
              AND titulo LIKE ?
              AND fecha_fin_publi >= CURDATE()
            ORDER BY fecha_inicio_publi DESC
        `, [`%${query}%`]);
        return rows;
    }
}

module.exports = PublicacionModel;