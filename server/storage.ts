import { 
  users, announcements, pushSubscriptions, professions, products,
  type User, type InsertUser, type Announcement, type InsertAnnouncement, 
  type PushSubscription, type InsertPushSubscription,
  type Profession, type InsertProfession,
  type Product, type InsertProduct
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfessions(userId: number, professions: string[]): Promise<User>;
  updateUserNotificationPreferences(userId: number, emailNotifications: boolean): Promise<User>;
  deleteAnnouncement(id: number): Promise<boolean>;
  
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement>;
  
  getProfessions(): Promise<Profession[]>;
  createProfession(profession: InsertProfession): Promise<Profession>;
  updateProfession(id: number, profession: Partial<InsertProfession>): Promise<Profession>;
  deleteProfession(id: number): Promise<boolean>;

  createSubscription(sub: InsertPushSubscription, userId: number): Promise<PushSubscription>;
  getSubscriptionsByProfession(profession: string): Promise<PushSubscription[]>;
  
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private announcements: Map<number, Announcement>;
  private professions: Map<number, Profession>;
  private subscriptions: Map<number, PushSubscription>;
  private products: Map<number, Product>;
  private currentUserId: number;
  private currentAnnouncementId: number;
  private currentProfessionId: number;
  private currentSubId: number;
  private currentProductId: number;

  constructor() {
    this.users = new Map();
    this.announcements = new Map();
    this.professions = new Map();
    this.subscriptions = new Map();
    this.products = new Map();
    this.currentUserId = 1;
    this.currentAnnouncementId = 1;
    this.currentProfessionId = 1;
    this.currentSubId = 1;
    this.currentProductId = 1;

    // Seed initial products
    const initialProducts: InsertProduct[] = [
      { name: "Kamu Personeli Seçme Sınavı Hazırlık Rehberi", description: "KPSS için kapsamlı çalışma kitabı.", price: 150, category: "Kitap", imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400" },
      { name: "Mülakat Teknikleri ve Soruları", description: "Kamu mülakatlarına hazırlık için altın kurallar.", price: 85, category: "Kitap", imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400" },
      { name: "Güncel Bilgiler El Kitabı 2026", description: "Sınavlar için en güncel bilgiler.", price: 45, category: "Kitap", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400" }
    ];
    initialProducts.forEach(p => this.createProduct(p));

    // Seed initial professions
    const initialProfessions = [
      "Psikolog", "Hemşire", "Mühendis", "Memur", "Öğretmen", "Doktor", 
      "Teknisyen", "Avukat", "Mimar", "Sosyal Çalışmacı", "Diyetisyen", 
      "Fizyoterapist", "Laborant", "Güvenlik Görevlisi", "Şoför", "Hizmetli", 
      "İşçi", "Tekniker", "Programcı", "Veznedar", "İstatistikçi", 
      "Kütüphaneci", "Müfettiş", "Uzman Yardımcısı"
    ];
    initialProfessions.forEach(name => {
      const id = this.currentProfessionId++;
      this.professions.set(id, { id, name });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      professions: insertUser.professions || [], // Ensure array
      isAdmin: insertUser.isAdmin || false,
      emailNotifications: insertUser.emailNotifications || false
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserProfessions(userId: number, professions: string[]): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, professions };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserNotificationPreferences(userId: number, emailNotifications: boolean): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, emailNotifications };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values()).sort((a, b) => {
        // Sort by date descending if date exists, otherwise by ID
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
    });
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    return this.announcements.delete(id);
  }

  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    return this.announcements.get(id);
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const id = this.currentAnnouncementId++;
    const newAnnouncement: Announcement = { 
      ...announcement, 
      id,
      date: new Date(),
      startDate: announcement.startDate ? new Date(announcement.startDate) : null,
      endDate: announcement.endDate ? new Date(announcement.endDate) : null,
      url: announcement.url || null 
    };
    this.announcements.set(id, newAnnouncement);
    return newAnnouncement;
  }

  async updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement> {
    const existing = await this.getAnnouncement(id);
    if (!existing) throw new Error("İlan bulunamadı");
    const updated = { 
      ...existing, 
      ...announcement,
      startDate: announcement.startDate ? new Date(announcement.startDate) : existing.startDate,
      endDate: announcement.endDate ? new Date(announcement.endDate) : existing.endDate
    };
    this.announcements.set(id, updated);
    return updated;
  }

  async getProfessions(): Promise<Profession[]> {
    return Array.from(this.professions.values()).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }

  async createProfession(profession: InsertProfession): Promise<Profession> {
    const id = this.currentProfessionId++;
    const newProfession: Profession = { ...profession, id };
    this.professions.set(id, newProfession);
    return newProfession;
  }

  async updateProfession(id: number, profession: Partial<InsertProfession>): Promise<Profession> {
    const existing = Array.from(this.professions.values()).find(p => p.id === id);
    if (!existing) throw new Error("Meslek bulunamadı");
    const updated = { ...existing, ...profession };
    this.professions.set(id, updated);
    return updated;
  }

  async deleteProfession(id: number): Promise<boolean> {
    return this.professions.delete(id);
  }

  async createSubscription(sub: InsertPushSubscription, userId: number): Promise<PushSubscription> {
    const id = this.currentSubId++;
    const newSub: PushSubscription = { ...sub, id, userId };
    this.subscriptions.set(id, newSub);
    return newSub;
  }

  async getSubscriptionsByProfession(profession: string): Promise<PushSubscription[]> {
    const subs: PushSubscription[] = [];
    for (const sub of this.subscriptions.values()) {
        if (!sub.userId) continue;
        const user = await this.getUser(sub.userId);
        if (user && user.professions && (user.professions as string[]).includes(profession)) {
            subs.push(sub);
        }
    }
    return subs;
  }

  async getAllSubscriptions(): Promise<PushSubscription[]> {
    return Array.from(this.subscriptions.values());
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const existing = await this.getProduct(id);
    if (!existing) throw new Error("Ürün bulunamadı");
    const updated = { ...existing, ...product };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
}

export const storage = new MemStorage();
