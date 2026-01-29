import express from "express";
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { insertUserSchema, insertAnnouncementSchema, insertProfessionSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for image uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Sadece resim dosyaları yüklenebilir!"));
  }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve uploads folder statically
  app.use("/uploads", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  }, express.static(uploadDir));

  // Middleware to simulate auth (checking token)
  const requireAuth = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Yetkisiz erişim" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = Buffer.from(token, 'base64').toString().split(':');
        if (decoded.length !== 2) throw new Error("Geçersiz token");
        
        const userId = parseInt(decoded[0]);
        const user = await storage.getUser(userId);
        if (!user) throw new Error("Kullanıcı bulunamadı");
        
        req.user = user;
        next();
    } catch (e) {
        return res.status(401).json({ message: "Geçersiz token" });
    }
  };

  // Image Upload Route
  app.post("/api/upload", requireAuth, upload.single("image"), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Dosya yüklenemedi" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      console.log("Registration request body:", req.body);
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.email);
      if (existing) {
        return res.status(400).json({ message: "Bu e-posta adresi zaten kullanımda" });
      }
      const user = await storage.createUser({
        ...input,
        professions: input.professions || [],
        isAdmin: input.isAdmin || false
      });
      // Create a dummy token: base64(id:email)
      const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');
      res.status(201).json({ token, user });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Sunucu hatası" });
      }
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(email);
      
      // Dummy password check (plaintext for mock)
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Geçersiz e-posta veya şifre" });
      }

      const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');
      res.status(200).json({ token, user });
    } catch (err) {
       res.status(400).json({ message: "Geçersiz giriş bilgileri" });
    }
  });

  app.get(api.auth.user.path, requireAuth, (req: any, res) => {
    res.json(req.user);
  });

  app.put(api.auth.updateProfessions.path, requireAuth, async (req: any, res) => {
    try {
        const { professions } = api.auth.updateProfessions.input.parse(req.body);
        const updatedUser = await storage.updateUserProfessions(req.user.id, professions);
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: "Geçersiz veri" });
    }
  });

  app.put(api.auth.updateNotifications.path, requireAuth, async (req: any, res) => {
    try {
        const { emailNotifications } = api.auth.updateNotifications.input.parse(req.body);
        const updatedUser = await storage.updateUserNotificationPreferences(req.user.id, emailNotifications);
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: "Geçersiz veri" });
    }
  });

  app.get("/api/professionals", async (_req, res) => {
    try {
      const professions = await storage.getProfessions();
      res.json(professions);
    } catch (err) {
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  app.get("/api/public/announcements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ilan ID" });
      }
      const announcement = await storage.getAnnouncement(id);
      if (!announcement) {
        return res.status(404).json({ message: "İlan bulunamadı" });
      }
      res.json(announcement);
    } catch (err) {
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  app.get("/api/public/announcements", async (req, res) => {
    try {
      const professionId = req.query.profession_id ? parseInt(req.query.profession_id as string) : undefined;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      let announcements = await storage.getAnnouncements();

      if (professionId !== undefined && !isNaN(professionId)) {
        const profession = await storage.getProfessions().then(profs => profs.find(p => p.id === professionId));
        if (profession) {
          announcements = announcements.filter(a => a.profession === profession.name);
        } else {
          announcements = [];
        }
      }

      const total = announcements.length;
      const paginatedAnnouncements = announcements.slice(offset, offset + limit);

      res.json({
        data: paginatedAnnouncements,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  app.get(api.announcements.list.path, async (_req, res) => {
    const announcements = await storage.getAnnouncements();
    res.json(announcements);
  });

  app.get(api.announcements.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const announcement = await storage.getAnnouncement(id);
    if (!announcement) {
      return res.status(404).json({ message: "İlan bulunamadı" });
    }
    res.json(announcement);
  });

  app.post(api.announcements.create.path, requireAuth, async (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Bu işlem için yönetici yetkisi gereklidir" });
    }
    try {
      const input = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(input);
      res.status(201).json(announcement);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Geçersiz ilan verisi" });
    }
  });

  app.patch(api.announcements.update.path, requireAuth, async (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Bu işlem için yönetici yetkisi gereklidir" });
    }
    const id = parseInt(req.params.id);
    try {
      const input = insertAnnouncementSchema.partial().parse(req.body);
      const announcement = await storage.updateAnnouncement(id, input);
      res.json(announcement);
    } catch (err) {
      res.status(400).json({ message: "Geçersiz veri" });
    }
  });

  app.delete(api.announcements.delete.path, requireAuth, async (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Bu işlem için yönetici yetkisi gereklidir" });
    }
    const id = parseInt(req.params.id);
    const success = await storage.deleteAnnouncement(id);
    if (!success) {
      return res.status(404).json({ message: "İlan bulunamadı" });
    }
    res.json({ success: true });
  });

  // Profession Routes
  app.get(api.professions.list.path, async (_req, res) => {
    const professions = await storage.getProfessions();
    res.json(professions);
  });

  app.post(api.professions.create.path, requireAuth, async (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Bu işlem için yönetici yetkisi gereklidir" });
    }
    try {
      const input = insertProfessionSchema.parse(req.body);
      const profession = await storage.createProfession(input);
      res.status(201).json(profession);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(400).json({ message: "Geçersiz meslek verisi" });
    }
  });

  app.patch(api.professions.update.path, requireAuth, async (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Bu işlem için yönetici yetkisi gereklidir" });
    }
    const id = parseInt(req.params.id);
    try {
      const input = insertProfessionSchema.partial().parse(req.body);
      const profession = await storage.updateProfession(id, input);
      res.json(profession);
    } catch (err) {
      res.status(400).json({ message: "Geçersiz veri" });
    }
  });

  app.delete(api.professions.delete.path, requireAuth, async (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Bu işlem için yönetici yetkisi gereklidir" });
    }
    const id = parseInt(req.params.id);
    const success = await storage.deleteProfession(id);
    if (!success) {
      return res.status(404).json({ message: "Meslek bulunamadı" });
    }
    res.json({ success: true });
  });

  // Notifications
  app.post(api.notifications.subscribe.path, requireAuth, async (req: any, res) => {
    try {
        const input = api.notifications.subscribe.input.parse(req.body);
        await storage.createSubscription({
            endpoint: input.endpoint,
            keys: input.keys
        }, req.user.id);
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(400).json({ message: "Invalid subscription data" });
    }
  });

  app.post(api.notifications.trigger.path, async (req, res) => {
    // ... (existing code)
  });

  // Product Routes
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  app.post("/api/products", requireAuth, async (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Bu işlem için yönetici yetkisi gereklidir" });
    }
    try {
      const input = req.body; // Validation could be added here
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      res.status(400).json({ message: "Geçersiz ürün verisi" });
    }
  });

  app.patch("/api/products/:id", requireAuth, async (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Bu işlem için yönetici yetkisi gereklidir" });
    }
    const id = parseInt(req.params.id);
    try {
      const product = await storage.updateProduct(id, req.body);
      res.json(product);
    } catch (err) {
      res.status(400).json({ message: "Ürün güncellenemedi" });
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req: any, res) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Bu işlem için yönetici yetkisi gereklidir" });
    }
    const id = parseInt(req.params.id);
    const success = await storage.deleteProduct(id);
    if (!success) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }
    res.json({ success: true });
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getAnnouncements();
  if (existing.length > 0) return;

  const mockAnnouncements: any[] = [
    {
      title: "Klinik Psikolog Alımı",
      profession: "Psikolog",
      institution: "Sağlık Bakanlığı",
      description: "Çeşitli devlet hastaneleri için 50 klinik psikolog alımı yapılacaktır. En az 2 yıl deneyim şartı aranmaktadır.",
      url: "https://example.com/job1"
    },
    {
      title: "Kıdemli İnşaat Mühendisi",
      profession: "Mühendis",
      institution: "İstanbul Büyükşehir Belediyesi",
      description: "Şehir merkezindeki altyapı projelerinde görevlendirilmek üzere deneyimli inşaat mühendisleri aranıyor.",
      url: "https://example.com/job2"
    },
    {
      title: "Genel Hemşire Kadrosu",
      profession: "Hemşire",
      institution: "Şehir Hastanesi",
      description: "Acil servis için hemşire alımı yapılacaktır. Vardiyalı çalışma sistemi mevcuttur.",
      url: "https://example.com/job3"
    },
    {
      title: "Cumhuriyet Savcı Yardımcısı",
      profession: "Avukat",
      institution: "Adalet Bakanlığı",
      description: "Hukuk mezunları için giriş seviyesi pozisyon.",
      url: "https://example.com/job4"
    },
    {
      title: "BT Teknisyeni",
      profession: "Teknisyen",
      institution: "Ulusal Üniversite",
      description: "Kampüs ağı ve donanım desteği sağlanacaktır.",
      url: "https://example.com/job5"
    }
  ];

  for (const ann of mockAnnouncements) {
    await storage.createAnnouncement(ann);
  }
  
  // Create a demo user
  const demoUser = await storage.getUserByUsername("demo@demo.com");
  if (!demoUser) {
      await storage.createUser({
          email: "demo@demo.com",
          password: "password", // In real app, hash this!
          professions: ["Psikolog", "Hemşire"],
          isAdmin: true,
          emailNotifications: true
      });
  }
}
