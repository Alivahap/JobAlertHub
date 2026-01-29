import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { authFetch } from "./use-auth";
import { Announcement } from "@shared/schema";

export function useAnnouncements() {
  return useQuery({
    queryKey: [api.announcements.list.path],
    queryFn: async () => {
      const res = await authFetch(api.announcements.list.path);
      if (!res.ok) throw new Error("Failed to fetch announcements");
      return await res.json() as Announcement[];
    },
  });
}

export function useAnnouncement(id: number) {
  return useQuery({
    queryKey: [api.announcements.get.path, id],
    queryFn: async () => {
      const url = api.announcements.get.path.replace(":id", String(id));
      const res = await authFetch(url);
      if (!res.ok) throw new Error("Failed to fetch announcement");
      return await res.json() as Announcement;
    },
    enabled: !!id,
  });
}
