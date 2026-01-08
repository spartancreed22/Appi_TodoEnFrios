const db = require('../config/database');

class ProductoModel {
    static async getAll() {
        const [rows] = await db.query(`
            SELECT 
                p.*, 
                m.nombre AS nombre_marca, 
                c.nombre AS nombre_categoria, 
                med.medida AS nombre_medida 
            FROM productos AS p 
            INNER JOIN marcas AS m ON m.id = p.id_marca 
            INNER JOIN categorias AS c ON c.id = p.id_categoria 
            LEFT JOIN medidas AS med ON med.id = p.id_medida 
            ORDER BY p.fecha_crea DESC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(`
            SELECT 
                p.*, 
                m.nombre AS nombre_marca, 
                c.nombre AS nombre_categoria, 
                med.medida AS nombre_medida 
            FROM productos AS p 
            INNER JOIN marcas AS m ON m.id = p.id_marca 
            INNER JOIN categorias AS c ON c.id = p.id_categoria 
            LEFT JOIN medidas AS med ON med.id = p.id_medida 
            WHERE p.codigo = ?
        `, [id]);
        return rows[0];
    }

    static async getByCodigo(codigo) {
        const [rows] = await db.query('SELECT * FROM productos WHERE codigo = ?', [codigo]);
        return rows[0];
    }

    static async getConImagenes() {
        const [rows] = await db.query(`
            SELECT 
                p.*, 
                m.nombre AS nombre_marca,
                GROUP_CONCAT(img.url) AS imagenes
            FROM productos AS p 
            INNER JOIN marcas AS m ON m.id = p.id_marca 
            LEFT JOIN img_productos AS img ON img.cod_producto = p.codigo AND img.estado = 'activo'
            GROUP BY p.codigo
            ORDER BY p.fecha_crea DESC
        `);
        return rows;
    }

    // NUEVO: Método de búsqueda
    static async search(query) {
        const [rows] = await db.query(`
            SELECT 
                p.*, 
                m.nombre AS nombre_marca, 
                c.nombre AS nombre_categoria, 
                med.medida AS nombre_medida 
            FROM productos p 
            INNER JOIN marcas m ON p.id_marca = m.id 
            INNER JOIN categorias c ON p.id_categoria = c.id
            LEFT JOIN medidas med ON med.id = p.id_medida
            WHERE (p.nombre LIKE ? OR p.codigo LIKE ? OR p.descripcion LIKE ?)
              AND p.status = 'activo'
            ORDER BY p.fecha_crea DESC
            LIMIT 50
        `, [`%${query}%`, `%${query}%`, `%${query}%`]);
        return rows;
    }
}

module.exports = ProductoModel;