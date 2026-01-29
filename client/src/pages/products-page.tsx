import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Package } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@shared/schema";

export default function ProductsPage() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-primary">Ürünler</h1>
        <p className="text-muted-foreground mt-1">Sınavlara hazırlık kitapları ve yardımcı materyaller.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-xl p-6 space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products?.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-all group overflow-hidden">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl.startsWith("/") ? product.imageUrl : product.imageUrl} 
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package size={48} className="text-muted-foreground/20" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-primary/90">
                    {product.category}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="text-lg font-bold text-accent">
                    {product.price} TL
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 p-6">
                  <Button className="w-full gap-2">
                    <ShoppingCart size={18} />
                    Satın Al
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </Shell>
  );
}
