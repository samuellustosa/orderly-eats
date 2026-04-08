import { useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, type Product } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { Loader2, Store } from 'lucide-react';
import MenuHeader from '@/components/menu/MenuHeader';
import PromoBanner from '@/components/menu/PromoBanner';
import CategoryNav from '@/components/menu/CategoryNav';
import SearchBar from '@/components/menu/SearchBar';
import ProductCard from '@/components/menu/ProductCard';
import CartSheet from '@/components/menu/CartSheet';

export default function PublicMenu() {
  const { slug } = useParams<{ slug: string }>();
  const { items, addItem, updateQuantity } = useCart();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: menu, isLoading, error } = useQuery({
    queryKey: ['menu', slug],
    queryFn: () => api.getMenu(slug!),
    enabled: !!slug,
  });

  const getItemQuantity = (productId: string) =>
    items.find(i => i.product.id === productId)?.quantity || 0;

  // Group products by category
  const { grouped, categoryNames } = useMemo(() => {
    if (!menu) return { grouped: {} as Record<string, Product[]>, categoryNames: [] as string[] };
    const categories = menu.categories || [];
    const g: Record<string, Product[]> = {};
    menu.products.forEach(p => {
      const cat = categories.find(c => c.id === p.categoryId)?.name || 'Outros';
      if (!g[cat]) g[cat] = [];
      g[cat].push(p);
    });
    return { grouped: g, categoryNames: Object.keys(g) };
  }, [menu]);

  // Filter products
  const filteredGrouped = useMemo(() => {
    const result: Record<string, Product[]> = {};
    const q = search.toLowerCase();
    for (const [cat, products] of Object.entries(grouped)) {
      if (activeCategory && cat !== activeCategory) continue;
      const filtered = q
        ? products.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
        : products;
      if (filtered.length > 0) result[cat] = filtered;
    }
    return result;
  }, [grouped, search, activeCategory]);

  const handleCategorySelect = (cat: string | null) => {
    setActiveCategory(cat);
    if (cat && sectionRefs.current[cat]) {
      sectionRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando cardápio...</p>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <Store className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Loja não encontrada</h1>
        <p className="text-muted-foreground mt-2">Verifique o link e tente novamente.</p>
      </div>
    );
  }

  const totalProducts = Object.values(filteredGrouped).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Store Header */}
      <MenuHeader storeName={menu.store.name} niche={menu.store.niche} phone={menu.store.phone} />

      {/* Promo Banners */}
      <PromoBanner />

      {/* Search */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Category Navigation */}
      <div className="mt-3">
        <CategoryNav
          categories={categoryNames}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />
      </div>

      {/* Products */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        {totalProducts === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">Nenhum produto encontrado.</p>
          </div>
        )}
        {Object.entries(filteredGrouped).map(([category, products]) => (
          <div
            key={category}
            ref={el => { sectionRefs.current[category] = el; }}
          >
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-base font-bold text-foreground">{category}</h2>
              <span className="text-xs text-muted-foreground">({products.length})</span>
            </div>
            <div className="space-y-2">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={getItemQuantity(product.id)}
                  onAdd={() => addItem(product)}
                  onUpdateQty={(qty) => updateQuantity(product.id, qty)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cart */}
      <CartSheet storeId={menu.store.id} />
    </div>
  );
}
