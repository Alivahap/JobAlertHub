import { z } from "zod";
import { users, announcements, professions, insertUserSchema, insertAnnouncementSchema, insertProfessionSchema } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: "POST" as const,
      path: "/api/auth/register",
      input: insertUserSchema,
      responses: {
        201: z.object({ token: z.string(), user: z.custom<typeof users.$inferSelect>() }),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: "POST" as const,
      path: "/api/auth/login",
      input: z.object({ email: z.string().email(), password: z.string() }),
      responses: {
        200: z.object({ token: z.string(), user: z.custom<typeof users.$inferSelect>() }),
        401: errorSchemas.unauthorized,
      },
    },
    user: {
      method: "GET" as const,
      path: "/api/auth/user",
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    updateProfessions: {
      method: "PUT" as const,
      path: "/api/auth/professions",
      input: z.object({ professions: z.array(z.string()) }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    updateNotifications: {
      method: "PUT" as const,
      path: "/api/auth/notifications",
      input: z.object({ emailNotifications: z.boolean() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    }
  },
  announcements: {
    list: {
      method: "GET" as const,
      path: "/api/announcements",
      responses: {
        200: z.array(z.custom<typeof announcements.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/announcements/:id",
      responses: {
        200: z.custom<typeof announcements.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/announcements",
      input: insertAnnouncementSchema,
      responses: {
        201: z.custom<typeof announcements.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/announcements/:id",
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/announcements/:id",
      input: insertAnnouncementSchema.partial(),
      responses: {
        200: z.custom<typeof announcements.$inferSelect>(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
  },
  professions: {
    list: {
      method: "GET" as const,
      path: "/api/professions",
      responses: {
        200: z.array(z.custom<typeof professions.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/professions",
      input: insertProfessionSchema,
      responses: {
        201: z.custom<typeof professions.$inferSelect>(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/professions/:id",
      input: insertProfessionSchema.partial(),
      responses: {
        200: z.custom<typeof professions.$inferSelect>(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/professions/:id",
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
  },
  notifications: {
    subscribe: {
      method: "POST" as const,
      path: "/api/notifications/subscribe",
      input: z.object({
        endpoint: z.string(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      }),
      responses: {
        201: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
      },
    },
    // Mock endpoint to trigger a notification for testing
    trigger: {
      method: "POST" as const,
      path: "/api/notifications/trigger",
      input: z.object({
        title: z.string(),
        body: z.string(),
        profession: z.string(),
      }),
      responses: {
        200: z.object({ success: z.boolean(), count: z.number() }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
