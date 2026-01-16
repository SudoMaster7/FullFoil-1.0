import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class User {
    constructor({ email, password, name, id = null }) {
        this.id = id || this.generateId();
        this.email = email.toLowerCase();
        this.name = name;
        this.password = null; // Will be set via setPassword
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    generateId() {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async setPassword(password) {
        this.password = await bcrypt.hash(password, 10);
    }

    async comparePassword(password) {
        return await bcrypt.compare(password, this.password);
    }

    generateToken() {
        return jwt.sign(
            { id: this.id, email: this.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
    }

    toJSON() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

export default User;
