import { Router } from "express";
import { pool } from "../db.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const router = Router()
router.post('/register', async (req, res, next) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ message: '参数传错了' })
        }
        const [existingUsers] = await pool.query(
            'SELECT username FROM users WHERE username = ?',
            [username]
        )
        if (existingUsers[0]) {
            return res.status(409).json({ message: '用户名已存在' })
        }
        const hash = await bcrypt.hash(password, 10)
        const [result] = await pool.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hash]
        )
        const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        })
        res.status(201).json({ user: { id: String(result.insertId), username: username } })
    }
    catch (err) {
        next(err)
    }
})
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ message: '参数传错了' })
        }
        const [record] = await pool.query(
            'SELECT id, username, password FROM users WHERE username = ?',
            [username]
        )
        if (!record[0]) {
            return res.status(401).json({ message: '用户名或密码错误' })
        }
        const match = await bcrypt.compare(password, record[0].password)
        if (!match) {
            return res.status(401).json({ message: '用户名或密码错误' })
        }
        const token = jwt.sign(
            { id: record[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        })
        res.status(200).json({ user: { id: String(record[0].id), username: record[0].username } })
    } catch (err) {
        next(err)
    }
})
router.post('/logout', (_req,res) => {
    res.clearCookie('token', {
        path: '/'
    })
    res.json({ message: '退出成功' })
})

export default router