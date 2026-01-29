import { useAuth } from "@/hooks/use-auth";
import { useAnnouncements } from "@/hooks/use-announcements";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Building, ExternalLink, FilterX, X } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@shared/routes";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function HomePage() {
  const { user } = useAuth();
  const { data: announcements, isLoading } = useAnnouncements();
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

  useEffect(() => {
    // Show dialog only if user is logged in and hasn't made a choice yet
    if (user && user.emailNotifications === false) {
      const hasPrompted = localStorage.getItem(`notif_prompt_${user.id}`);
      if (!hasPrompted) {
        setShowNotificationDialog(true);
      }
    }
  }, [user]);

  const handleNotificationChoice = async (enable: boolean) => {
    if (!user) return;
    try {
      await apiRequest("PUT", api.auth.updateNotifications.path, { emailNotifications: enable });
      queryClient.invalidateQueries({ queryKey: [api.auth.user.path] });
      localStorage.setItem(`notif_prompt_${user.id}`, "true");
      setShowNotificationDialog(false);
    } catch (error) {
      console.error("Failed to update notification preferences", error);
    }
  };

  // Filter announcements based on user professions
  const filteredAnnouncements = announcements?.filter(a => 
    user?.professions && user.professions.includes(a.profession)
  );

  return (
    <Shell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">İlanlar</h1>
          <p className="text-muted-foreground mt-1">
            Seçtiğiniz meslekler için en son fırsatlar: 
            <span className="font-medium text-foreground ml-1">
              {user?.professions?.join(", ") || "Seçim yapılmadı"}
            </span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {user?.professions?.map(p => (
            <Badge key={p} variant="secondary" className="px-3 py-1">{p}</Badge>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-xl p-6 space-y-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : filteredAnnouncements?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border shadow-sm">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FilterX className="text-muted-foreground" size={32} />
          </div>
          <h3 className="text-xl font-bold text-primary mb-2">Eşleşme Bulunamadı</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Şu anda seçtiğiniz mesleklerle eşleşen bir iş ilanı bulunmamaktadır.
            Profilinize daha fazla meslek eklemeyi deneyin.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredAnnouncements?.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/10 hover:border-l-primary group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">
                      {item.profession}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center bg-gray-50 px-2 py-1 rounded">
                      <CalendarDays size={12} className="mr-1" />
                      {item.date ? format(new Date(item.date), "dd MMM yyyy") : "N/A"}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1 text-sm font-medium">
                    <Building size={14} className="mr-1.5 text-accent" />
                    {item.institution}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.description}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 border-t bg-gray-50/30 p-4">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 group-hover:bg-primary group-hover:text-white transition-colors"
                    onClick={() => setSelectedAnnouncement(item)}
                  >
                    Detayları Görüntüle
                    <ExternalLink size={14} />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* İlan Detay Diyaloğu */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedAnnouncement && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Badge className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-100 no-default-hover-elevate">
                      {selectedAnnouncement.profession}
                    </Badge>
                    <DialogTitle className="text-2xl font-serif font-bold text-primary leading-tight">
                      {selectedAnnouncement.title}
                    </DialogTitle>
                    <DialogDescription className="flex items-center mt-2 text-base font-medium text-foreground">
                      <Building size={18} className="mr-2 text-accent" />
                      {selectedAnnouncement.institution}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={16} />
                    <span>Yayınlanma: {selectedAnnouncement.date ? format(new Date(selectedAnnouncement.date), "dd MMMM yyyy") : "Belirtilmemiş"}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-lg text-primary border-b pb-1">İlan Detayları</h4>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedAnnouncement.description}
                  </p>
                </div>

                {selectedAnnouncement.url && (
                  <div className="pt-4 border-t">
                    <Button asChild className="w-full h-12 text-base font-bold">
                      <a href={selectedAnnouncement.url} target="_blank" rel="noopener noreferrer">
                        Resmi İlana Git <ExternalLink className="ml-2" size={18} />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bildirim Tercihleri</DialogTitle>
            <DialogDescription>
              Yeni ilanlardan anında haberdar olmak ister misiniz?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Seçtiğiniz meslek gruplarına ait yeni bir ilan yayınlandığında size e-posta gönderilmesini onaylıyor musunuz?
            </p>
          </div>
          <DialogFooter className="flex sm:justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                localStorage.setItem(`notif_prompt_${user?.id}`, "true");
                setShowNotificationDialog(false);
              }}
            >
              Daha Sonra
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleNotificationChoice(false)}
              >
                Hayır, Teşekkürler
              </Button>
              <Button
                type="button"
                onClick={() => handleNotificationChoice(true)}
              >
                Evet, E-posta Almak İstiyorum
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
