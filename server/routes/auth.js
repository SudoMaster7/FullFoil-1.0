import express from 'express';
import { createUser, findUserByEmail, updateUser } from '../services/userService.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({
                error: 'Dados inválidos',
                message: 'Email, senha e nome são obrigatórios'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Senha muito curta',
                message: 'A senha deve ter no mínimo 6 caracteres'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Email inválido',
                message: 'Por favor, forneça um email válido'
            });
        }

        // Create user
        const user = await createUser({ email, password, name });
        const token = user.generateToken();

        console.log(`✅ User registered: ${user.email}`);

        res.status(201).json({
            success: true,
            token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Register error:', error);

        if (error.message === 'Email já cadastrado') {
            return res.status(409).json({
                error: 'Email em uso',
                message: error.message
            });
        }

        res.status(500).json({
            error: 'Erro no cadastro',
            message: 'Erro ao criar usuário'
        });
    }
});

/**
 * POST /api/auth/login
 * User login
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Dados inválidos',
                message: 'Email e senha são obrigatórios'
            });
        }

        // Find user
        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                error: 'Credenciais inválidas',
                message: 'Email ou senha incorretos'
            });
        }

        // Verify password
        const isValidPassword = await user.comparePassword(password);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Credenciais inválidas',
                message: 'Email ou senha incorretos'
            });
        }

        // Generate token
        const token = user.generateToken();

        console.log(`✅ User logged in: ${user.email}`);

        res.json({
            success: true,
            token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Erro no login',
            message: 'Erro ao realizar login'
        });
    }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user.toJSON()
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            error: 'Erro',
            message: 'Erro ao buscar usuário'
        });
    }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, email } = req.body;
        const updates = {};

        if (name) updates.name = name;
        if (email) updates.email = email;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                error: 'Dados inválidos',
                message: 'Nenhum campo para atualizar'
            });
        }

        const updatedUser = await updateUser(req.userId, updates);

        console.log(`✅ User updated: ${updatedUser.email}`);

        res.json({
            success: true,
            user: updatedUser.toJSON()
        });
    } catch (error) {
        console.error('Update profile error:', error);

        if (error.message === 'Email já cadastrado') {
            return res.status(409).json({
                error: 'Email em uso',
                message: error.message
            });
        }

        res.status(500).json({
            error: 'Erro',
            message: 'Erro ao atualizar perfil'
        });
    }
});

export default router;
