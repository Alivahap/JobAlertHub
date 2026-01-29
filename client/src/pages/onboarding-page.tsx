import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ProfessionSelector } from "@/components/ui/profession-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const { user, updateProfessions } = useAuth();
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<string[]>(user?.professions || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    if (selected.length === 0) return;
    try {
      setIsSaving(true);
      await updateProfessions(selected);
      setLocation("/");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center pb-8 border-b">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-xl font-serif font-bold text-primary">1</span>
          </div>
          <CardTitle className="text-3xl font-serif text-primary">Mesleğinizi Seçin</CardTitle>
          <CardDescription className="text-lg max-w-2xl mx-auto mt-2">
            Size ilgili iş ilanlarını sunabilmemiz için lütfen ilgilendiğiniz bir veya daha fazla meslek seçin.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          <ProfessionSelector 
            selected={selected} 
            onChange={setSelected} 
            className="mb-8"
          />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t bg-gray-50/50 -mx-8 -mb-8 p-8 rounded-b-xl">
            <div className="text-sm text-muted-foreground">
              {selected.length === 0 ? "Lütfen en az bir tane seçin" : `${selected.length} meslek seçildi`}
            </div>
            
            <Button 
              size="lg" 
              onClick={handleContinue} 
              disabled={selected.length === 0 || isSaving}
              className="w-full sm:w-auto px-8"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  Panale Devam Et
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
