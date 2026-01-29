import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { Shell } from "@/components/layout/Shell";
import { ProfessionSelector } from "@/components/ui/profession-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bell, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, updateProfessions } = useAuth();
  const { enableNotifications, triggerTestNotification, isSubscribing } = useNotifications();
  const [selected, setSelected] = useState<string[]>(user?.professions || []);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfessions(selected);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Profil ve Ayarlar</h1>
          <p className="text-muted-foreground">Hesap tercihlerinizi ve bildirimlerinizi yönetin.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Meslek Tercihleri</CardTitle>
            <CardDescription>
              İş ilanlarını almak istediğiniz meslek gruplarını seçin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProfessionSelector selected={selected} onChange={setSelected} />
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={isSaving} className="min-w-[120px]">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Değişiklikleri Kaydet
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-accent" />
                  Bildirimler
                </CardTitle>
                <CardDescription>
                  Yeni ilanlar için anlık uyarılar almak üzere anlık bildirimleri etkinleştirin.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
              <div>
                <p className="font-medium text-foreground">Anlık Bildirimler</p>
                <p className="text-sm text-muted-foreground">Bu cihazda uyarı al</p>
              </div>
              <Button onClick={() => enableNotifications()} disabled={isSubscribing} variant="secondary">
                {isSubscribing ? "Etkinleştiriliyor..." : "Bildirimleri Etkinleştir"}
              </Button>
            </div>

            <Separator />
            
            <div className="pt-2">
              <h4 className="text-sm font-semibold mb-2">Test Bildirimi</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Ayarlarınızın doğru çalıştığını doğrulamak için bir test bildirimi gönderin.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => triggerTestNotification.mutate()}
                disabled={triggerTestNotification.isPending}
              >
                {triggerTestNotification.isPending ? "Gönderiliyor..." : "Test Uyarısı Gönder"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
