import React, { useState, useMemo } from 'react';
import {
  SEED_COMMUNITY_POSTS,
  SEED_DISCIPLINES,
  SEED_FREE_PASSES,
  SEED_MEMBERSHIPS,
  SEED_PRODUCTS,
  SEED_USERS,
  SEED_USER_DISCIPLINES,
  SEED_FACILITIES
} from './data/gymData';
import { CommunityPost, Discipline, FreePass, Product, User } from './types/laravel';
import { Header } from './components/Header';
import { MemberDashboard } from './components/gym/MemberDashboard';
import { EcommerceStore } from './components/gym/EcommerceStore';
import { CommunityFeed } from './components/gym/CommunityFeed';
import { FreePassLeadGen } from './components/gym/FreePassLeadGen';
import { StaffPortal } from './components/gym/StaffPortal';
import { CartDrawer, CartItem } from './components/gym/CartDrawer';
import { CodeExplorer } from './components/studio/CodeExplorer';
import { DatabaseSchemaVisualizer } from './components/studio/DatabaseSchemaVisualizer';
import { ApiSandbox } from './components/studio/ApiSandbox';
import { ArchitectureGuide } from './components/studio/ArchitectureGuide';
import { GitHubDeployGuide } from './components/studio/GitHubDeployGuide';
import { Code2, Database, Terminal, BookOpen, Dumbbell, ShieldCheck, ShoppingBag, Sparkles, Github } from 'lucide-react';

export default function App() {
  // Navigation State
  const [viewMode, setViewMode] = useState<'app' | 'studio'>('app');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [studioTab, setStudioTab] = useState<'code' | 'schema' | 'sandbox' | 'guide' | 'github'>('code');

  // Application Data State
  const [users] = useState<User[]>(SEED_USERS);
  const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[0]); // Carlos Mendoza (Member)
  const [userDisciplinesMap, setUserDisciplinesMap] = useState<Record<number, number[]>>(
    SEED_USER_DISCIPLINES
  );
  const [products] = useState<Product[]>(SEED_PRODUCTS);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(SEED_COMMUNITY_POSTS);
  const [freePasses, setFreePasses] = useState<FreePass[]>(SEED_FREE_PASSES);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Current active user's disciplines
  const currentEnrolledDisciplines = useMemo(() => {
    const ids = userDisciplinesMap[currentUser.id] || [];
    return SEED_DISCIPLINES.filter((d) => ids.includes(d.id));
  }, [currentUser.id, userDisciplinesMap]);

  // Current membership
  const currentMembership = SEED_MEMBERSHIPS[currentUser.id];

  // Dynamic Recommendation Engine mimicking Eloquent scopeRecommendedFor($query, $user)
  const recommendedProducts = useMemo(() => {
    const dNames = currentEnrolledDisciplines.map((d) => d.name.toLowerCase());

    if (dNames.length === 0) {
      return products.filter((p) => p.is_active && p.stock > 0).slice(0, 4);
    }

    // Build target tags
    const tagMap: Record<string, string[]> = {
      musculación: ['musculacion', 'creatina', 'hipertrofia', 'proteina', 'straps', 'fuerza'],
      musculacion: ['musculacion', 'creatina', 'hipertrofia', 'proteina', 'straps', 'fuerza'],
      crossfit: ['crossfit', 'calleras', 'cinturon', 'electrolitos', 'cuerda', 'resistencia'],
      funcional: ['funcional', 'bandas', 'recuperacion', 'kettlebell', 'movilidad', 'bcaa'],
      spinning: ['spinning', 'hidratacion', 'calas', 'cardio', 'ciclocomputador', 'toalla'],
    };

    let targetTags: string[] = [];
    for (const d of dNames) {
      if (tagMap[d]) {
        targetTags = [...targetTags, ...tagMap[d]];
      } else {
        targetTags.push(d);
      }
    }

    const hasMusculacion = dNames.includes('musculación') || dNames.includes('musculacion');

    // Filter and score products
    return [...products]
      .filter((p) => p.is_active && p.stock > 0)
      .map((p) => {
        let score = 0;
        // Tag overlap count
        const matchingTags = p.tags.filter((t) => targetTags.includes(t.toLowerCase())).length;
        score += matchingTags * 10;

        // Weight supplements if musculacion
        if (hasMusculacion && p.category === 'supplement') {
          score += 15;
        }

        return { product: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product)
      .slice(0, 4);
  }, [currentEnrolledDisciplines, products]);

  // Toggle user enrollment in a discipline (simulates discipline_user pivot insert/delete)
  const handleToggleDiscipline = (disciplineId: number) => {
    setUserDisciplinesMap((prev) => {
      const currentList = prev[currentUser.id] || [];
      const exists = currentList.includes(disciplineId);
      const updated = exists
        ? currentList.filter((id) => id !== disciplineId)
        : [...currentList, disciplineId];
      return {
        ...prev,
        [currentUser.id]: updated,
      };
    });
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalCartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  // Community operations
  const handleLikePost = (postId: number) => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const wasLiked = post.is_liked_by_me;
          return {
            ...post,
            is_liked_by_me: !wasLiked,
            likes_count: wasLiked ? post.likes_count - 1 : post.likes_count + 1,
          };
        }
        return post;
      })
    );
  };

  const handleUploadPost = (newPostData: {
    caption: string;
    image_url: string;
    discipline_tag?: string;
    original_size: string;
    webp_size: string;
  }) => {
    const created: CommunityPost = {
      id: Date.now(),
      user_id: currentUser.id,
      user: currentUser,
      image_url: newPostData.image_url,
      caption: newPostData.caption,
      discipline_tag: newPostData.discipline_tag,
      approved_by_admin: currentUser.role === 'admin', // Auto approve if admin, otherwise pending
      likes_count: 0,
      is_liked_by_me: false,
      created_at: new Date().toISOString(),
      original_size: newPostData.original_size,
      webp_optimized_size: newPostData.webp_size,
    };
    setCommunityPosts((prev) => [created, ...prev]);
  };

  const handleToggleApprovePost = (postId: number, approved: boolean) => {
    setCommunityPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, approved_by_admin: approved } : post))
    );
  };

  // Free Pass operations
  const handleGeneratePass = (newPassData: Omit<FreePass, 'id' | 'created_at'>) => {
    const newPass: FreePass = {
      ...newPassData,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };
    setFreePasses((prev) => [newPass, ...prev]);
  };

  const handleVerifyPass = (token: string): { success: boolean; message: string } => {
    const pass = freePasses.find((p) => p.qr_code_token === token);
    if (!pass) {
      return { success: false, message: 'Código QR o token no encontrado en el sistema.' };
    }
    if (pass.used_at) {
      return {
        success: false,
        message: `El pase ya fue canjeado el ${new Date(pass.used_at).toLocaleString('es-ES')}.`,
      };
    }
    if (new Date(pass.expires_at).getTime() < Date.now()) {
      return {
        success: false,
        message: `El pase venció el ${new Date(pass.expires_at).toLocaleString('es-ES')}.`,
      };
    }

    // Mark as used
    setFreePasses((prev) =>
      prev.map((p) => (p.id === pass.id ? { ...p, used_at: new Date().toISOString() } : p))
    );

    return {
      success: true,
      message: `¡Pase verificado con éxito! Acceso concedido a ${pass.guest_name}.`,
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Global Header */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        users={users}
        onUserChange={setCurrentUser}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* ============================================================== */}
        {/* MODE 1: LIVE GYM WEB APPLICATION DEMO */}
        {/* ============================================================== */}
        {viewMode === 'app' && (
          <div className="space-y-8">
            {activeTab === 'dashboard' && (
              <MemberDashboard
                user={currentUser}
                membership={currentMembership}
                disciplines={currentEnrolledDisciplines}
                allDisciplines={SEED_DISCIPLINES}
                onToggleDiscipline={handleToggleDiscipline}
                recommendedProducts={recommendedProducts}
                onAddToCart={handleAddToCart}
                onNavigateToStore={() => setActiveTab('store')}
                facilities={SEED_FACILITIES}
              />
            )}

            {activeTab === 'store' && (
              <EcommerceStore
                products={products}
                user={currentUser}
                userDisciplines={currentEnrolledDisciplines}
                onAddToCart={handleAddToCart}
              />
            )}

            {activeTab === 'community' && (
              <CommunityFeed
                posts={communityPosts}
                currentUser={currentUser}
                onLikePost={handleLikePost}
                onUploadPost={handleUploadPost}
                onToggleApprove={handleToggleApprovePost}
                disciplines={SEED_DISCIPLINES}
              />
            )}

            {activeTab === 'free-pass' && (
              <FreePassLeadGen
                freePasses={freePasses}
                onGeneratePass={handleGeneratePass}
                onVerifyPass={handleVerifyPass}
              />
            )}

            {activeTab === 'staff' && (
              <StaffPortal
                currentUser={currentUser}
                freePasses={freePasses}
                onVerifyPass={handleVerifyPass}
                posts={communityPosts}
                onToggleApprove={handleToggleApprovePost}
                users={users}
              />
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 2: LARAVEL 13 ARCHITECTURE STUDIO */}
        {/* ============================================================== */}
        {viewMode === 'studio' && (
          <div className="space-y-6">
            {/* Studio Navigation Tabs */}
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-wrap items-center gap-2">
              {[
                { id: 'code', label: 'Archivos PHP & PSR-12', icon: Code2, count: 12 },
                { id: 'schema', label: 'Esquema MySQL & ERD', icon: Database, count: 7 },
                { id: 'sandbox', label: 'API Sandbox & Profiler SQL', icon: Terminal },
                { id: 'guide', label: 'Guía de Arquitectura Senior', icon: BookOpen },
                { id: 'github', label: 'Publicar en GitHub', icon: Github, badge: 'Paso a Paso' },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = studioTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStudioTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950/60 text-cyan-300">
                        {tab.count}
                      </span>
                    )}
                    {(tab as any).badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">
                        {(tab as any).badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Studio Sub-views */}
            {studioTab === 'code' && <CodeExplorer />}
            {studioTab === 'schema' && <DatabaseSchemaVisualizer />}
            {studioTab === 'sandbox' && (
              <ApiSandbox
                currentUser={currentUser}
                freePasses={freePasses}
                products={products}
              />
            )}
            {studioTab === 'guide' && <ArchitectureGuide />}
            {studioTab === 'github' && <GitHubDeployGuide />}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => setCart([])}
        user={currentUser}
        isVip={currentMembership?.tier_name === 'VIP'}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-white font-bold">FENIX GYM</span>
            <span>·</span>
            <span>Laravel 13 Architecture</span>
            <span>·</span>
            <span>PHP 8.4+ Strict</span>
            <span>·</span>
            <span>MySQL 8.0+ InnoDB</span>
          </div>
          <div className="text-slate-600 font-mono text-[11px]">
            Diseño para Escalabilidad, Alta Concurrencia y Retención
          </div>
        </div>
      </footer>
    </div>
  );
}
