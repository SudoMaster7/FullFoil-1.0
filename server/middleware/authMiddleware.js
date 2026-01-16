import jwt from 'jsonwebtoken';
import { findUserById } from '../services/userService.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Não autorizado',
                message: 'Token não fornecido'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer '

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        const user = await findUserById(decoded.id);

        if (!user) {
            return res.status(401).json({
                error: 'Não autorizado',
                message: 'Usuário não encontrado'
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = user.id;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Não autorizado',
                message: 'Token inválido'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Não autorizado',
                message: 'Token expirado'
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            error: 'Erro interno',
            message: 'Erro ao verificar autenticação'
        });
    }
}

export default authMiddleware;
