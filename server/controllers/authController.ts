import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { db } from "../models/db";
import { AuthRequest } from "../middleware/auth";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, full_name, role = "user" } = req.body;

      if (!email || !password || !full_name) {
        res.status(400).json({ error: "Email, password, and full name are required." });
        return;
      }

      const existing = await db.get("SELECT id FROM users WHERE email = ?", [email.toLowerCase().trim()]);
      if (existing) {
        res.status(409).json({ error: "An account with this email already exists." });
        return;
      }

      const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const password_hash = await bcrypt.hash(password, 10);
      const now = new Date().toISOString();

      await db.run(
        `INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, email.toLowerCase().trim(), password_hash, full_name.trim(), role, now, now]
      );

      const token = jwt.sign({ id, email: email.toLowerCase().trim(), role }, config.jwtSecret, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        message: "Registration successful",
        token,
        user: { id, email: email.toLowerCase().trim(), full_name: full_name.trim(), role },
      });
    } catch (err: any) {
      console.error("[AUTH] Register error:", err);
      res.status(500).json({ error: "Internal server error during registration." });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required." });
        return;
      }

      const user = await db.get<any>(
        "SELECT id, email, password_hash, full_name, role FROM users WHERE email = ?",
        [email.toLowerCase().trim()]
      );

      if (!user) {
        res.status(401).json({ error: "Invalid email or password." });
        return;
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        res.status(401).json({ error: "Invalid email or password." });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        message: "Sign in successful",
        token,
        user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      });
    } catch (err: any) {
      console.error("[AUTH] Login error:", err);
      res.status(500).json({ error: "Internal server error during sign in." });
    }
  }

  async me(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    res.json({ user: req.user });
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie("token");
    res.json({ message: "Signed out successfully" });
  }
}

export const authController = new AuthController();
