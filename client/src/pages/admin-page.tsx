import { useAuth } from "@/hooks/use-auth";
import { Shell } from "@/components/layout/Shell";
import { useAnnouncements } from "@/hooks/use-announcements";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAnnouncementSchema, insertProfessionSchema, type Profession, type Announcement } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, Briefcase, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function ProductList({ onEdit }: { onEdit: (product: any) => void }) {
  const { data: products, isLoading } = useQuery<any[]>({
    queryKey: ["/api/products"],
  });
  const { toast } = useToast();

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Başarılı", description: "Ürün silindi." });
    },
  });

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin mx-auto" />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Resim</TableHead>
          <TableHead>Ürün Adı</TableHead>
          <TableHead>Fiyat</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead className="text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
            <TableBody>
        {products?.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-10 h-10 object-cover rounded border"
                />
              )}
            </TableCell>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.price} TL</TableCell>
            <TableCell>{product.category}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(product)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
                      deleteProductMutation.mutate(product.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const { data: announcements, isLoading: loadingAnnouncements } = useAnnouncements();
  const { data: professions, isLoading: loadingProfessions } = useQuery<Profession[]>({
    queryKey: ["/api/professions"],
  });
  const { toast } = useToast();
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editingProfession, setEditingProfession] = useState<Profession | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const announcementForm = useForm({
    resolver: zodResolver(insertAnnouncementSchema),
    defaultValues: {
      title: "",
      profession: "",
      institution: "",
      description: "",
      url: "",
      startDate: "",
      endDate: "",
    },
  });

  const professionForm = useForm({
    resolver: zodResolver(insertProfessionSchema),
    defaultValues: {
      name: "",
    },
  });

  const editAnnouncementForm = useForm({
    resolver: zodResolver(insertAnnouncementSchema),
  });

  const editProfessionForm = useForm({
    resolver: zodResolver(insertProfessionSchema),
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/announcements", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Başarılı", description: "İlan başarıyla eklendi." });
      announcementForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/announcements/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Başarılı", description: "İlan güncellendi." });
      setEditingAnnouncement(null);
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Başarılı", description: "İlan silindi." });
    },
  });

  const createProfessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/professions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professions"] });
      toast({ title: "Başarılı", description: "Meslek başarıyla eklendi." });
      professionForm.reset();
    },
  });

  const updateProfessionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/professions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professions"] });
      toast({ title: "Başarılı", description: "Meslek güncellendi." });
      setEditingProfession(null);
    },
  });

  const deleteProfessionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/professions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professions"] });
      toast({ title: "Başarılı", description: "Meslek silindi." });
    },
  });

  const handleEditAnnouncement = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    editAnnouncementForm.reset({
      title: ann.title,
      profession: ann.profession,
      institution: ann.institution,
      description: ann.description,
      url: ann.url || "",
      startDate: ann.startDate ? new Date(ann.startDate).toISOString().split('T')[0] : "",
      endDate: ann.endDate ? new Date(ann.endDate).toISOString().split('T')[0] : "",
    });
  };

  const handleEditProfession = (prof: Profession) => {
    setEditingProfession(prof);
    editProfessionForm.reset({ name: prof.name });
  };

  if (!user?.isAdmin) {
    return (
      <Shell>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-destructive">Yetkisiz Erişim</h1>
          <p>Bu sayfayı görüntülemek için yönetici yetkiniz olmalıdır.</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Yönetim Paneli</h1>
          <p className="text-muted-foreground">İlanları ve meslek gruplarını yönetin.</p>
        </div>

        <Tabs defaultValue="announcements">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="announcements">İlan Yönetimi</TabsTrigger>
            <TabsTrigger value="products">Ürün Yönetimi</TabsTrigger>
            <TabsTrigger value="professions">Meslek Yönetimi</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Yeni Ürün Ekle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    
                    const imageFile = formData.get("image") as File;
                    let imageUrl = "";

                    if (imageFile && imageFile.size > 0) {
                      const uploadData = new FormData();
                      uploadData.append("image", imageFile);
                      
                      try {
                        const uploadRes = await fetch("/api/upload", {
                          method: "POST",
                          headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                          },
                          body: uploadData
                        });
                        
                        if (!uploadRes.ok) throw new Error("Resim yüklenemedi");
                        const uploadResult = await uploadRes.json();
                        imageUrl = uploadResult.imageUrl;
                      } catch (err) {
                        toast({ title: "Hata", description: "Resim yüklenirken hata oluştu.", variant: "destructive" });
                        return;
                      }
                    }

                    const data = {
                      name: formData.get("name"),
                      description: formData.get("description"),
                      price: parseInt(formData.get("price") as string),
                      category: formData.get("category"),
                      imageUrl: imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
                    };
                    try {
                      await apiRequest("POST", "/api/products", data);
                      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
                      toast({ title: "Başarılı", description: "Ürün başarıyla eklendi." });
                      (e.target as HTMLFormElement).reset();
                    } catch (err) {
                      toast({ title: "Hata", description: "Ürün eklenemedi.", variant: "destructive" });
                    }
                  }} 
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ürün Adı</label>
                      <Input name="name" placeholder="Örn: KPSS Kitabı" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fiyat (Sadece Sayı)</label>
                      <Input name="price" type="number" placeholder="Örn: 150" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Kategori</label>
                      <Input name="category" placeholder="Örn: Kitap" defaultValue="Kitap" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ürün Resmi</label>
                      <Input name="image" type="file" accept="image/*" className="cursor-pointer" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Açıklama</label>
                    <Textarea name="description" placeholder="Ürün detayları..." required />
                  </div>
                  <Button type="submit" className="w-full">Ürünü Kaydet</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mevcut Ürünler</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductList onEdit={(product) => setEditingProduct(product)} />
              </CardContent>
            </Card>

            <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ürün Düzenle</DialogTitle>
                </DialogHeader>
                {editingProduct && (
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      
                      const imageFile = formData.get("image") as File;
                      let imageUrl = editingProduct.imageUrl;

                      if (imageFile && imageFile.size > 0) {
                        const uploadData = new FormData();
                        uploadData.append("image", imageFile);
                        
                        try {
                          const uploadRes = await fetch("/api/upload", {
                            method: "POST",
                            headers: {
                              "Authorization": `Bearer ${localStorage.getItem("token")}`
                            },
                            body: uploadData
                          });
                          
                          if (!uploadRes.ok) throw new Error("Resim yüklenemedi");
                          const uploadResult = await uploadRes.json();
                          imageUrl = uploadResult.imageUrl;
                        } catch (err) {
                          toast({ title: "Hata", description: "Resim yüklenirken hata oluştu.", variant: "destructive" });
                          return;
                        }
                      }

                      const data = {
                        name: formData.get("name"),
                        description: formData.get("description"),
                        price: parseInt(formData.get("price") as string),
                        category: formData.get("category"),
                        imageUrl: imageUrl,
                      };
                      try {
                        await apiRequest("PATCH", `/api/products/${editingProduct.id}`, data);
                        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
                        toast({ title: "Başarılı", description: "Ürün güncellendi." });
                        setEditingProduct(null);
                      } catch (err) {
                        toast({ title: "Hata", description: "Ürün güncellenemedi.", variant: "destructive" });
                      }
                    }} 
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Ürün Adı</label>
                        <Input name="name" defaultValue={editingProduct.name} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fiyat (Sadece Sayı)</label>
                        <Input name="price" type="number" defaultValue={editingProduct.price} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Kategori</label>
                        <Input name="category" defaultValue={editingProduct.category} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Yeni Ürün Resmi (Opsiyonel)</label>
                        <Input name="image" type="file" accept="image/*" className="cursor-pointer" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Açıklama</label>
                      <Textarea name="description" defaultValue={editingProduct.description} required />
                    </div>
                    <Button type="submit" className="w-full">Değişiklikleri Kaydet</Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Yeni İlan Ekle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...announcementForm}>
                  <form onSubmit={announcementForm.handleSubmit((data) => createAnnouncementMutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={announcementForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>İlan Başlığı</FormLabel>
                            <FormControl>
                              <Input placeholder="Örn: Klinik Psikolog Alımı" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={announcementForm.control}
                        name="institution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kurum</FormLabel>
                            <FormControl>
                              <Input placeholder="Örn: Sağlık Bakanlığı" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={announcementForm.control}
                        name="profession"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meslek Grubu</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Meslek seçin" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {professions?.map((p) => (
                                  <SelectItem key={p.id} value={p.name}>
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={announcementForm.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>İlan Linki (Opsiyonel)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={announcementForm.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Başlangıç Tarihi</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={announcementForm.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bitiş Tarihi</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={announcementForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Açıklama</FormLabel>
                          <FormControl>
                            <Textarea placeholder="İlan detaylarını buraya yazın..." className="min-h-[100px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={createAnnouncementMutation.isPending}>
                      {createAnnouncementMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      İlanı Yayınla
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mevcut İlanlar</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAnnouncements ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Başlık</TableHead>
                        <TableHead>Kurum</TableHead>
                        <TableHead>Meslek</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {announcements?.map((ann) => (
                        <TableRow key={ann.id}>
                          <TableCell className="font-medium">{ann.title}</TableCell>
                          <TableCell>{ann.institution}</TableCell>
                          <TableCell>{ann.profession}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditAnnouncement(ann)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bu işlem geri alınamaz. İlan kalıcı olarak silinecektir.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteAnnouncementMutation.mutate(ann.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Sil
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professions" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Yeni Meslek Ekle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...professionForm}>
                  <form onSubmit={professionForm.handleSubmit((data) => createProfessionMutation.mutate(data))} className="flex gap-4">
                    <FormField
                      control={professionForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Örn: Veri Bilimci" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={createProfessionMutation.isPending}>
                      {createProfessionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Ekle
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mevcut Meslekler</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingProfessions ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Meslek Adı</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {professions?.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditProfession(p)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bu mesleği sildiğinizde bu mesleğe bağlı kullanıcı bildirimleri etkilenebilir.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteProfessionMutation.mutate(p.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Sil
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Announcement Dialog */}
      <Dialog open={!!editingAnnouncement} onOpenChange={(open) => !open && setEditingAnnouncement(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>İlanı Düzenle</DialogTitle>
          </DialogHeader>
          <Form {...editAnnouncementForm}>
            <form onSubmit={editAnnouncementForm.handleSubmit((data) => editingAnnouncement && updateAnnouncementMutation.mutate({ id: editingAnnouncement.id, data }))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editAnnouncementForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İlan Başlığı</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editAnnouncementForm.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kurum</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editAnnouncementForm.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meslek Grubu</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {professions?.map((p) => (
                            <SelectItem key={p.id} value={p.name}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editAnnouncementForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İlan Linki</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editAnnouncementForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Başlangıç Tarihi</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editAnnouncementForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bitiş Tarihi</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editAnnouncementForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingAnnouncement(null)}>İptal</Button>
                <Button type="submit" disabled={updateAnnouncementMutation.isPending}>
                  {updateAnnouncementMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kaydet
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Profession Dialog */}
      <Dialog open={!!editingProfession} onOpenChange={(open) => !open && setEditingProfession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mesleği Düzenle</DialogTitle>
          </DialogHeader>
          <Form {...editProfessionForm}>
            <form onSubmit={editProfessionForm.handleSubmit((data) => editingProfession && updateProfessionMutation.mutate({ id: editingProfession.id, data }))} className="space-y-4">
              <FormField
                control={editProfessionForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meslek Adı</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingProfession(null)}>İptal</Button>
                <Button type="submit" disabled={updateProfessionMutation.isPending}>
                  {updateProfessionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kaydet
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
