import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/index.js';
import { ApiError } from '../middlewares/errorHandler.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) throw new ApiError(400, 'email and password are required');
    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, 'Email already registered');
    const hashed = await bcrypt.hash(password, config.bcryptSaltRounds);
    const user = await User.create({ name, email, password: hashed, role: role || 'user' });
    const token = jwt.sign({ sub: user._id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, 'email and password are required');
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(401, 'Invalid credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new ApiError(401, 'Invalid credentials');
    const token = jwt.sign({ sub: user._id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '1h' });
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
}

export async function verify(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) throw new ApiError(401, 'Missing Authorization header');
    const payload = jwt.verify(token, config.jwtSecret);
    res.status(200).json({ valid: true, user: payload });
  } catch (err) {
    err.status = 401;
    err.message = 'Invalid or expired token';
    next(err);
  }
}