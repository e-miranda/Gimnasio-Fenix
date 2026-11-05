import React, { useState } from 'react';
import { ShoppingBag, Search, Sparkles, Star, Tag, Info, Flame, Eye } from 'lucide-react';
import { Discipline, Product, User } from '../../types/laravel';
import { ImageCarousel } from '../common/ImageCarousel';

interface EcommerceStoreProps {
  products: Product[];
  user: User;
  userDisciplines: Discipline[];
  onAddToCart: (product: Product) => void;
}

export const EcommerceStore: React.FC<EcommerceStoreProps> = ({
  products,
  user,
  userDisciplines,
  onAddToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(new Set(products.flatMap((p) => p.tags)));

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = selectedTag ? p.tags.includes(selectedTag) : true;
    return matchesCategory && matchesSearch && matchesTag;
  });

  // Check if a product is recommended for current user
  const isRecommended = (product: Product) => {
    return userDisciplines.some((d) => {
      const dName = d.name.toLowerCase();
      if (dName.includes('muscula') && (product.tags.includes('musculacion') || product.category === 'supplement')) return true;
      if (dName.includes('crossfit') && (product.tags.includes('crossfit') || product.tags.includes('calleras') || product.tags.includes('cinturon'))) return true;
      if (dName.includes('spinning') && (product.tags.includes('spinning') || product.tags.includes('calas') || product.tags.includes('hidratacion'))) return true;
      if (dName.includes('funcional') && (product.tags.includes('funcional') || product.tags.includes('bandas'))) return true;
      return false;
    });
  };

  const promoHeroImages = [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=1400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1400&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Promotional Carousel */}
      <div className="rounded-2xl overflow-hidden border border-red-500/30 shadow-2xl relative">
        <ImageCarousel
          images={promoHeroImages}
          alt="Promociones Fenix GYM E-Commerce"
          aspectRatio="wide"
          autoPlay={true}
          interval={4500}
          title="TIENDA OFICIAL FENIX // PRECIOS EN BOLIVIANOS (Bs.)"
          subtitle="Suplementación de grado farmacéutico, calzado indoor y equipamiento de palanca. Descuentos automáticos del 15% para miembros VIP."
          badge="NUEVA COLECCIÓN RED EDITION"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 md:pb-0">
          {[
            { id: 'all', label: 'Todos los Productos' },
            { id: 'supplement', label: 'Suplementos & Nutrición' },
            { id: 'clothing', label: 'Ropa & Streetwear' },
            { id: 'equipment', label: 'Equipamiento & Accesorios' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedTag(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar creatina, zapatillas, calleras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
          />
        </div>
      </div>

      {/* Tag Cloud Filter */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
          <Tag className="w-3 h-3 text-red-500" />
          Filtrar por Tags JSON (MySQL 8.0):
        </span>
        {allTags.map((tag) => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(isSelected ? null : tag)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                isSelected
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              #{tag}
            </button>
          );
        })}
        {selectedTag && (
          <button
            onClick={() => setSelectedTag(null)}
            className="text-[11px] text-red-400 hover:underline ml-2"
          >
            Limpiar filtro
          </button>
        )}
      </div>

      {/* Product Grid with Multi-Image Carousels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const recommended = isRecommended(product);
          const productPhotos = product.images && product.images.length > 0 ? product.images : [product.image_url];

          return (
            <div
              key={product.id}
              className={`bg-slate-900 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all group ${
                recommended
                  ? 'border-red-500/60 shadow-lg shadow-red-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Product Photos Carousel */}
                <div className="relative">
                  <ImageCarousel
                    images={productPhotos}
                    alt={product.name}
                    aspectRatio="square"
                    autoPlay={false}
                    showThumbnails={productPhotos.length > 1}
                  />

                  {/* Overlays */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 pointer-events-none">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-950/90 text-red-400 border border-slate-800 backdrop-blur-sm">
                      {product.category}
                    </span>
                    {recommended && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center gap-1 shadow-md shadow-red-600/30">
                        <Sparkles className="w-2.5 h-2.5" />
                        RECOMENDADO
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 z-20 pointer-events-none">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/90 text-emerald-400 border border-slate-800">
                      Stock: {product.stock} un.
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-1 text-red-400 text-xs mb-1">
                    <Star className="w-3.5 h-3.5 fill-red-400" />
                    <span className="font-bold text-slate-200">{product.rating}</span>
                    <span className="text-slate-500">({product.sales_count} ventas)</span>
                  </div>

                  <h3 className="font-bold text-white text-base group-hover:text-red-400 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                    {product.description}
                  </p>

                  {/* JSON tags */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <div className="text-[10px] text-slate-500 font-mono mb-1.5">
                      Column tags (MySQL JSON):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded"
                        >
                          &quot;{tag}&quot;
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price and Action in Bolivianos (Bs.) */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-800/80 mt-2">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Precio en Bolivia</div>
                  <div className="text-xl font-black text-red-400 font-mono">
                    Bs. {product.price.toFixed(2)}
                  </div>
                </div>
                <button
                  onClick={() => onAddToCart(product)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/30 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Añadir al Carrito</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
