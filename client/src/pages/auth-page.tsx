import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Building2, ShieldCheck, Loader2 } from "lucide-react";
import { insertUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().email("Geçersiz e-posta adresi"),
  password: z.string().min(1, "Şifre gereklidir"),
});

export default function AuthPage() {
  const { login, register, user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { email: "", password: "", professions: [], isAdmin: false } as any,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      await login({
        email: data.username,
        password: data.password
      });
      toast({
        title: "Başarılı",
        description: "Başarıyla giriş yapıldı. Hoş geldiniz!",
      });
    } catch (error) {
      // Error handled in useAuth
    }
  };

  const onRegister = async (data: z.infer<typeof insertUserSchema>) => {
    try {
      await register(data);
      toast({
        title: "Başarılı",
        description: "Hesabınız başarıyla oluşturuldu.",
      });
    } catch (error) {
      // Error handled in useAuth
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-accent rounded-lg text-accent-foreground">
              <Building2 size={32} />
            </div>
            <h1 className="font-serif text-3xl font-bold">Kamu İlan Takip</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed">
            Kamu sektörü iş ilanlarını takip etmek için resmi platform. Kamu kurumlarındaki kariyer fırsatlarından haberdar olun.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
            <ShieldCheck className="w-8 h-8 text-accent shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Resmi ve Güvenli</h3>
              <p className="text-blue-200 text-sm">Kaynakları doğrudan bakanlık veri tabanlarından doğrulayın.</p>
            </div>
          </div>
          <p className="text-xs text-blue-300">© 2024 Türkiye Cumhuriyeti Kamu Personeli Alım İzleme</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-serif font-bold text-primary mb-2">Hoş Geldiniz</h2>
            <p className="text-muted-foreground">Meslek uyarılarınızı yönetmek için giriş yapın.</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Giriş Yap</TabsTrigger>
              <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-posta</FormLabel>
                            <FormControl>
                              <Input placeholder="E-posta adresinizi girin" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Şifre</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loginForm.formState.isSubmitting}>
                        {loginForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sisteme Giriş Yap
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-posta</FormLabel>
                            <FormControl>
                              <Input placeholder="E-posta adresinizi girin" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Şifre</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Bir şifre belirleyin" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full h-12 text-base font-medium" disabled={registerForm.formState.isSubmitting}>
                        {registerForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Hesap Oluştur
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
