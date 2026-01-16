import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Load users from file
async function loadUsers() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(USERS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Save users to file
async function saveUsers(users) {
    await ensureDataDir();
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

/**
 * Create a new user
 */
export async function createUser({ email, password, name }) {
    try {
        const users = await loadUsers();

        // Check if email already exists
        if (users.find(u => u.email === email.toLowerCase())) {
            throw new Error('Email já cadastrado');
        }

        const user = new User({ email, name, password: 'temp' });
        await user.setPassword(password);

        users.push(user);
        await saveUsers(users);

        console.log(`✅ User created: ${user.email}`);
        return user;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email) {
    try {
        const users = await loadUsers();
        const userData = users.find(u => u.email === email.toLowerCase());

        if (!userData) return null;

        // Reconstruct User instance with all data including password
        const user = new User({
            email: userData.email,
            name: userData.name,
            password: 'temp',
            id: userData.id
        });

        // Manually set all properties including password
        Object.assign(user, userData);

        return user;
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw error;
    }
}

/**
 * Find user by ID
 */
export async function findUserById(id) {
    try {
        const users = await loadUsers();
        const userData = users.find(u => u.id === id);

        if (!userData) return null;

        const user = new User({
            email: userData.email,
            name: userData.name,
            password: 'temp',
            id: userData.id
        });

        Object.assign(user, userData);

        return user;
    } catch (error) {
        console.error('Error finding user by ID:', error);
        throw error;
    }
}

/**
 * Update user
 */
export async function updateUser(id, updates) {
    try {
        const users = await loadUsers();
        const userIndex = users.findIndex(u => u.id === id);

        if (userIndex === -1) {
            throw new Error('Usuário não encontrado');
        }

        // Update allowed fields
        if (updates.name) users[userIndex].name = updates.name;
        if (updates.email) users[userIndex].email = updates.email.toLowerCase();
        users[userIndex].updatedAt = new Date().toISOString();

        await saveUsers(users);

        return findUserById(id);
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

export default {
    createUser,
    findUserByEmail,
    findUserById,
    updateUser
};
