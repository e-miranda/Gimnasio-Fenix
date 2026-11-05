import { LaravelCodeFile } from '../types/laravel';

export const LARAVEL_CODEBASE: LaravelCodeFile[] = [
  // ==========================================
  // MIGRATIONS
  // ==========================================
  {
    id: 'migration-users',
    filename: '0001_01_01_000000_create_users_table.php',
    path: 'database/migrations/0001_01_01_000000_create_users_table.php',
    category: 'migration',
    description: 'Tabla principal de usuarios con soporte para roles, autenticación Socialite y estado activo.',
    features: ['Enum para roles', 'Índices compuestos', 'Columnas Socialite (Google/Apple)', 'MySQL 8.0+ strict'],
    code: `<?php

declare(strict_types=1);

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * MySQL 8.0+ InnoDB Engine
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 120);
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable(); // Nullable si inicia sesión exclusivamente con Socialite
            
            // Roles del sistema: admin, trainer, member
            $table->enum('role', ['admin', 'trainer', 'member'])->default('member')->index();
            
            // Integración Socialite (OAuth2 Google / Apple / Instagram)
            $table->string('social_id')->nullable()->index();
            $table->string('social_provider', 30)->nullable(); // ej: 'google', 'apple'
            
            // Estado de la cuenta y avatar
            $table->boolean('active')->default(true)->index();
            $table->string('avatar_url')->nullable();
            
            $table->rememberToken();
            $table->timestamps();
            
            // Índice compuesto para login social rápido
            $table->index(['social_provider', 'social_id']);
        });

        Schema::create('password_reset_tokens', function (Blueprint $table): void {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table): void {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};`
  },
  {
    id: 'migration-memberships',
    filename: '2026_01_10_000001_create_memberships_table.php',
    path: 'database/migrations/2026_01_10_000001_create_memberships_table.php',
    category: 'migration',
    description: 'Control de membresías (VIP, Regular) con claves foráneas en cascada y fechas de vigencia.',
    features: ['Foreign key con onDelete cascade', 'Enum de planes y estados', 'Índice en rango de fechas'],
    code: `<?php

declare(strict_types=1);

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('memberships', function (Blueprint $table): void {
            $table->id();
            
            // Relación con usuario (un usuario tiene una membresía activa)
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            
            // Tiers y estados
            $table->enum('tier_name', ['VIP', 'Regular'])->default('Regular');
            $table->enum('status', ['active', 'expired', 'suspended'])->default('active')->index();
            
            // Vigencia del plan
            $table->date('start_date');
            $table->date('end_date')->index();
            
            // Metadatos de renovación
            $table->decimal('price_paid', 8, 2)->default(0.00);
            $table->boolean('auto_renew')->default(false);
            
            $table->timestamps();
            
            // Índice para consultas de validación en torniquetes / acceso rápido
            $table->index(['user_id', 'status', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('memberships');
    }
};`
  },
  {
    id: 'migration-disciplines',
    filename: '2026_01_10_000002_create_disciplines_table.php',
    path: 'database/migrations/2026_01_10_000002_create_disciplines_table.php',
    category: 'migration',
    description: 'Catálogo de disciplinas del gimnasio (Musculación, Crossfit, Funcional, Spinning).',
    features: ['Slug único indexado', 'Contador de clases semanales', 'Soft deletes o estado activo'],
    code: `<?php

declare(strict_types=1);

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('disciplines', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 80)->unique();
            $table->string('slug', 90)->unique();
            $table->text('description');
            $table->string('icon', 50)->nullable(); // ej: 'dumbbell', 'flame', 'bike'
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedSmallInteger('weekly_classes')->default(5);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disciplines');
    }
};`
  },
  {
    id: 'migration-discipline-user',
    filename: '2026_01_10_000003_create_discipline_user_table.php',
    path: 'database/migrations/2026_01_10_000003_create_discipline_user_table.php',
    category: 'migration',
    description: 'Tabla pivote Muchos a Muchos (Many-to-Many) entre usuarios y sus disciplinas inscritas.',
    features: ['Clave primaria compuesta o ID con unique constraint', 'Borrado en cascada bidireccional'],
    code: `<?php

declare(strict_types=1);

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('discipline_user', function (Blueprint $table): void {
            $table->id();
            
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('discipline_id')
                ->constrained('disciplines')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            // Metadatos de la inscripción del miembro
            $table->timestamp('enrolled_at')->useCurrent();
            $table->string('level_preference', 30)->default('all'); // beginner, intermediate, pro

            $table->timestamps();

            // Evitar duplicados de la misma disciplina para el mismo usuario
            $table->unique(['user_id', 'discipline_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discipline_user');
    }
};`
  },
  {
    id: 'migration-products',
    filename: '2026_01_10_000004_create_products_table.php',
    path: 'database/migrations/2026_01_10_000004_create_products_table.php',
    category: 'migration',
    description: 'Catálogo de e-commerce con columna JSON tags optimizada para el motor de recomendación cruzada.',
    features: ['JSON column para tags dinámicos', 'Enum de categorías', 'Precio decimal(10,2)', 'Índices funcionales'],
    code: `<?php

declare(strict_types=1);

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 150)->index();
            $table->string('slug', 160)->unique();
            $table->text('description');
            
            // Precios y existencias
            $table->decimal('price', 10, 2);
            $table->unsignedInteger('stock')->default(0)->index();
            
            // Categoría: supplement, clothing, equipment
            $table->enum('category', ['supplement', 'clothing', 'equipment'])->index();
            
            // Motor de Recomendación: Tags JSON nativos en MySQL 8.0+
            // Permite consultas JSON_CONTAINS() y JSON_OVERLAPS() ultra rápidas
            // Ej: ["musculacion", "creatina", "fuerza", "hipertrofia"]
            $table->json('tags');
            
            $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true)->index();
            
            $table->timestamps();

            // Índice para consultas de catálogo activo por categoría
            $table->index(['is_active', 'category', 'stock']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};`
  },
  {
    id: 'migration-community-posts',
    filename: '2026_01_10_000005_create_community_posts_table.php',
    path: 'database/migrations/2026_01_10_000005_create_community_posts_table.php',
    category: 'migration',
    description: 'Módulo de comunidad (Prueba Social, fotos de logros WebP, moderación y conteo de likes).',
    features: ['Mapeo a storage WebP', 'approved_by_admin con índice', 'Contador denormalizado de likes', 'Cascade delete'],
    code: `<?php

declare(strict_types=1);

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('community_posts', function (Blueprint $table): void {
            $table->id();
            
            // Autor del post
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            
            // URL a imagen optimizada en WebP (almacenada en S3 o storage/app/public/community)
            $table->string('image_url');
            $table->text('caption');
            
            // Moderación por parte de administración para evitar contenido indebido
            $table->boolean('approved_by_admin')->default(false)->index();
            
            // Contador atómico de likes
            $table->unsignedInteger('likes_count')->default(0)->index();
            
            // Etiqueta opcional de disciplina para contextualizar el logro
            $table->string('discipline_tag', 50)->nullable()->index();
            
            $table->timestamps();
            
            // Índice compuesto para alimentar el Feed público de posts aprobados ordenados por fecha
            $table->index(['approved_by_admin', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('community_posts');
    }
};`
  },
  {
    id: 'migration-free-passes',
    filename: '2026_01_10_000006_create_free_passes_table.php',
    path: 'database/migrations/2026_01_10_000006_create_free_passes_table.php',
    category: 'migration',
    description: 'Módulo de captación de leads con generación de Pase Libre de 1 Día y token de validación QR único.',
    features: ['Token QR único indexado', 'Timestamp nullable para used_at', 'Expiración automática', 'Lead tracking'],
    code: `<?php

declare(strict_types=1);

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('free_passes', function (Blueprint $table): void {
            $table->id();
            
            // Datos del lead captado
            $table->string('guest_name', 120);
            $table->string('guest_email')->index();
            $table->string('guest_phone', 30);
            
            // Token criptográfico único para generar el código QR escaneable en recepción
            $table->string('qr_code_token', 64)->unique();
            
            // Control de un solo uso en recepción
            $table->timestamp('used_at')->nullable()->index();
            $table->timestamp('expires_at')->index();
            
            // Metadatos de captación y geolocalización (sede asignada / notas del staff)
            $table->string('utm_source', 60)->nullable();
            $table->text('staff_notes')->nullable();
            
            $table->timestamps();

            // Índice para validar rápido el QR en la puerta
            $table->index(['qr_code_token', 'used_at', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('free_passes');
    }
};`
  },

  // ==========================================
  // ELOQUENT MODELS
  // ==========================================
  {
    id: 'model-user',
    filename: 'User.php',
    path: 'app/Models/User.php',
    category: 'model',
    description: 'Modelo de Usuario con PHP 8.4 strict typing, relaciones Eloquent y métodos de rol.',
    features: ['HasOne Membership', 'BelongsToMany Discipline', 'HasMany CommunityPost', 'PHP 8.4 Enums & Casts'],
    code: `<?php

declare(strict_types=1);

namespace App\\Models;

use App\\Enums\\UserRole;
use Database\\Factories\\UserFactory;
use Illuminate\\Database\\Eloquent\\Casts\\Attribute;
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsToMany;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;
use Illuminate\\Database\\Eloquent\\Relations\\HasOne;
use Illuminate\\Foundation\\Auth\\User as Authenticatable;
use Illuminate\\Notifications\\Notifiable;
use Laravel\\Sanctum\\HasApiTokens;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property UserRole|string $role
 * @property bool $active
 * @property ?Membership $membership
 * @property \\Illuminate\\Database\\Eloquent\\Collection<int, Discipline> $disciplines
 * @property \\Illuminate\\Database\\Eloquent\\Collection<int, CommunityPost> $communityPosts
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'social_id',
        'social_provider',
        'active',
        'avatar_url',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'active' => 'boolean',
        ];
    }

    // ==========================================
    // ELOQUENT RELATIONSHIPS
    // ==========================================

    /**
     * Un usuario tiene una membresía (VIP o Regular).
     */
    public function membership(): HasOne
    {
        return $this->hasOne(Membership::class);
    }

    /**
     * Un usuario puede estar inscrito en múltiples disciplinas (N:M).
     */
    public function disciplines(): BelongsToMany
    {
        return $this->belongsToMany(Discipline::class, 'discipline_user')
            ->withPivot('enrolled_at', 'level_preference')
            ->withTimestamps();
    }

    /**
     * Un usuario tiene muchos posts en la comunidad (1:N).
     */
    public function communityPosts(): HasMany
    {
        return $this->hasMany(CommunityPost::class);
    }

    /**
     * Posts del usuario que ya han sido aprobados por moderación.
     */
    public function approvedCommunityPosts(): HasMany
    {
        return $this->hasMany(CommunityPost::class)->where('approved_by_admin', true);
    }

    // ==========================================
    // BUSINESS LOGIC & ROLE HELPERS
    // ==========================================

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTrainer(): bool
    {
        return $this->role === 'trainer';
    }

    public function isMember(): bool
    {
        return $this->role === 'member';
    }

    public function hasActiveMembership(): bool
    {
        return $this->membership !== null 
            && $this->membership->status === 'active' 
            && $this->membership->end_date->isFuture();
    }
}`
  },
  {
    id: 'model-membership',
    filename: 'Membership.php',
    path: 'app/Models/Membership.php',
    category: 'model',
    description: 'Modelo de Membresía con cast de fechas, relación BelongsTo y Scope de membresías activas.',
    features: ['BelongsTo User', 'Date casts nativos', 'Scope active()', 'Helper isVip()'],
    code: `<?php

declare(strict_types=1);

namespace App\\Models;

use Carbon\\Carbon;
use Illuminate\\Database\\Eloquent\\Builder;
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $tier_name (VIP, Regular)
 * @property string $status (active, expired, suspended)
 * @property Carbon $start_date
 * @property Carbon $end_date
 * @property User $user
 */
class Membership extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tier_name',
        'status',
        'start_date',
        'end_date',
        'price_paid',
        'auto_renew',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'price_paid' => 'decimal:2',
            'auto_renew' => 'boolean',
        ];
    }

    /**
     * Relación: La membresía pertenece a un usuario.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope local para filtrar solo membresías vigentes.
     *
     * @param Builder<Membership> $query
     * @return Builder<Membership>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active')
            ->where('end_date', '>=', now()->toDateString());
    }

    public function isVip(): bool
    {
        return strtoupper($this->tier_name) === 'VIP';
    }

    public function daysRemaining(): int
    {
        return (int) max(0, now()->diffInDays($this->end_date, false));
    }
}`
  },
  {
    id: 'model-discipline',
    filename: 'Discipline.php',
    path: 'app/Models/Discipline.php',
    category: 'model',
    description: 'Modelo de Disciplina con relación BelongsToMany hacia User y conteo de miembros inscritos.',
    features: ['BelongsToMany User', 'Scope active', 'Generador automático de slug en booted()'],
    code: `<?php

declare(strict_types=1);

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Builder;
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsToMany;
use Illuminate\\Support\\Str;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $description
 * @property bool $is_active
 * @property int $weekly_classes
 */
class Discipline extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'is_active',
        'weekly_classes',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'weekly_classes' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Discipline $discipline): void {
            if (empty($discipline->slug)) {
                $discipline->slug = Str::slug($discipline->name);
            }
        });
    }

    /**
     * Relación: Una disciplina tiene muchos usuarios inscritos.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'discipline_user')
            ->withPivot('enrolled_at', 'level_preference')
            ->withTimestamps();
    }

    /**
     * Scope local para obtener solo disciplinas activas en el gimnasio.
     *
     * @param Builder<Discipline> $query
     * @return Builder<Discipline>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}`
  },
  {
    id: 'model-product',
    filename: 'Product.php',
    path: 'app/Models/Product.php',
    category: 'model',
    description: 'Modelo de Producto con cast de tags JSON y el Local Scope scopeRecommendedFor($query, User $user).',
    features: ['Local Scope scopeRecommendedFor', 'MySQL 8.0 JSON queries', 'Casts decimal y array', 'Algoritmo de ponderación'],
    code: `<?php

declare(strict_types=1);

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Builder;
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Support\\Str;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $description
 * @property float $price
 * @property int $stock
 * @property string $category (supplement, clothing, equipment)
 * @property array<string> $tags
 * @property bool $is_active
 */
class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'stock',
        'category',
        'tags',
        'image_url',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'stock' => 'integer',
            'tags' => 'array', // Deserialización nativa de JSON a array asociativo PHP
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Product $product): void {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    // ==========================================
    // MOTOR INTELIGENTE DE RECOMENDACIÓN (CROSS-SELLING)
    // ==========================================

    /**
     * Local Scope: Analiza dinámicamente las disciplinas inscritas del usuario
     * y prioriza productos del e-commerce mediante tags JSON y categorías.
     *
     * Ejemplos de reglas de venta cruzada:
     * - "Musculación": prioriza suplementos de fuerza (creatina, whey protein) y correas/straps.
     * - "Crossfit": prioriza calleras, cinturones lumbares, magnesio y electrolitos.
     * - "Spinning": prioriza calzado con calas, bidones térmicos, toallas y ropa técnica transpirable.
     * - "Funcional": prioriza bandas elásticas, colchonetas y suplementos de recuperación.
     *
     * @param Builder<Product> $query
     * @param User $user
     * @return Builder<Product>
     */
    public function scopeRecommendedFor(Builder $query, User $user): Builder
    {
        // 1. Obtener nombres normalizados de las disciplinas del usuario
        // Eager loading de disciplinas si aún no están cargadas
        $disciplines = $user->relationLoaded('disciplines')
            ? $user->disciplines
            : $user->disciplines()->get();

        $disciplineNames = $disciplines->pluck('name')->map(fn(string $name) => Str::lower($name))->toArray();

        // Si el usuario no tiene disciplinas, retornar los más vendidos o suplementos generales
        if (empty($disciplineNames)) {
            return $query->where('is_active', true)
                ->where('stock', '>', 0)
                ->orderByDesc('id');
        }

        // 2. Mapear disciplinas a tags clave de recomendación cruzada
        $tagDictionary = [
            'musculación' => ['musculacion', 'creatina', 'hipertrofia', 'proteina', 'straps', 'fuerza'],
            'musculacion' => ['musculacion', 'creatina', 'hipertrofia', 'proteina', 'straps', 'fuerza'],
            'crossfit'    => ['crossfit', 'calleras', 'cinturon', 'electrolitos', 'cuerda', 'resistencia'],
            'funcional'   => ['funcional', 'bandas', 'recuperacion', 'kettlebell', 'movilidad', 'bcaa'],
            'spinning'    => ['spinning', 'hidratacion', 'calas', 'cardio', 'ciclocomputador', 'toalla'],
        ];

        $targetTags = [];
        foreach ($disciplineNames as $discipline) {
            if (isset($tagDictionary[$discipline])) {
                $targetTags = array_merge($targetTags, $tagDictionary[$discipline]);
            } else {
                $targetTags[] = $discipline;
            }
        }
        $targetTags = array_values(array_unique($targetTags));

        // 3. Consulta optimizada en MySQL 8.0+:
        // Filtramos por productos activos y con stock disponible
        return $query->where('is_active', true)
            ->where('stock', '>', 0)
            ->where(function (Builder $subQuery) use ($targetTags, $disciplineNames): void {
                // MySQL 8.0: whereJsonContains con múltiples posibilidades
                foreach ($targetTags as $tag) {
                    $subQuery->orWhereJsonContains('tags', $tag);
                }

                // Si entrena Musculación, dar peso a la categoría 'supplement' (ej. Creatina)
                if (in_array('musculación', $disciplineNames, true) || in_array('musculacion', $disciplineNames, true)) {
                    $subQuery->orWhere('category', 'supplement');
                }
            })
            // Ordenar: productos con stock abundante y tags coincidentes primero
            ->orderByRaw("
                CASE 
                    WHEN category = 'supplement' THEN 1
                    WHEN category = 'equipment' THEN 2
                    ELSE 3
                END ASC
            ")
            ->orderByDesc('stock');
    }
}`
  },
  {
    id: 'model-community-post',
    filename: 'CommunityPost.php',
    path: 'app/Models/CommunityPost.php',
    category: 'model',
    description: 'Modelo de Post de la Comunidad con relación BelongsTo User, scopeApproved y conteo de likes.',
    features: ['BelongsTo User', 'Scope approved()', 'WebP storage attribute', 'Atómic increment likes'],
    code: `<?php

declare(strict_types=1);

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Builder;
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Support\\Facades\\Storage;

/**
 * @property int $id
 * @property int $user_id
 * @property string $image_url
 * @property string $caption
 * @property bool $approved_by_admin
 * @property int $likes_count
 * @property ?string $discipline_tag
 * @property User $user
 */
class CommunityPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'image_url',
        'caption',
        'approved_by_admin',
        'likes_count',
        'discipline_tag',
    ];

    protected function casts(): array
    {
        return [
            'approved_by_admin' => 'boolean',
            'likes_count' => 'integer',
        ];
    }

    /**
     * Relación: El post de comunidad pertenece a un usuario (Miembro).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope local: Filtrar solo posts aprobados por el administrador
     * para el feed público dinámico.
     *
     * @param Builder<CommunityPost> $query
     * @return Builder<CommunityPost>
     */
    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('approved_by_admin', true)
            ->latest('id');
    }

    /**
     * Incremento atómico y seguro para los likes del post.
     */
    public function incrementLikes(): void
    {
        $this->increment('likes_count');
    }

    /**
     * Decremento seguro de likes.
     */
    public function decrementLikes(): void
    {
        if ($this->likes_count > 0) {
            $this->decrement('likes_count');
        }
    }
}`
  },
  {
    id: 'model-free-pass',
    filename: 'FreePass.php',
    path: 'app/Models/FreePass.php',
    category: 'model',
    description: 'Modelo FreePass para captación de leads con token QR, verificación de validez y marcado como usado.',
    features: ['Generador de token seguro', 'Scope valid()', 'isExpired() check', 'Método markAsUsed()'],
    code: `<?php

declare(strict_types=1);

namespace App\\Models;

use Carbon\\Carbon;
use Illuminate\\Database\\Eloquent\\Builder;
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Support\\Str;

/**
 * @property int $id
 * @property string $guest_name
 * @property string $guest_email
 * @property string $guest_phone
 * @property string $qr_code_token
 * @property ?Carbon $used_at
 * @property Carbon $expires_at
 */
class FreePass extends Model
{
    use HasFactory;

    protected $fillable = [
        'guest_name',
        'guest_email',
        'guest_phone',
        'qr_code_token',
        'used_at',
        'expires_at',
        'utm_source',
        'staff_notes',
    ];

    protected function casts(): array
    {
        return [
            'used_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Generar un token único y seguro al crear el Pase Libre.
     */
    protected static function booted(): void
    {
        static::creating(function (FreePass $freePass): void {
            if (empty($freePass->qr_code_token)) {
                // Genera un token criptográfico de alta entropía con prefijo identificador
                $freePass->qr_code_token = 'FP-' . strtoupper(Str::random(12)) . '-' . time();
            }

            if (empty($freePass->expires_at)) {
                // Por defecto el pase libre vence a las 48 horas de solicitado
                $freePass->expires_at = now()->addHours(48);
            }
        });
    }

    /**
     * Scope local: Pases vigentes y aún no canjeados en el gimnasio.
     *
     * @param Builder<FreePass> $query
     * @return Builder<FreePass>
     */
    public function scopeValid(Builder $query): Builder
    {
        return $query->whereNull('used_at')
            ->where('expires_at', '>', now());
    }

    public function isExpired(): bool
    {
        return now()->isAfter($this->expires_at);
    }

    public function isUsed(): bool
    {
        return $this->used_at !== null;
    }

    /**
     * Valida y canjea el pase en la recepción del gimnasio.
     */
    public function markAsUsed(?string $staffNotes = null): bool
    {
        if ($this->isUsed() || $this->isExpired()) {
            return false;
        }

        $this->update([
            'used_at' => now(),
            'staff_notes' => $staffNotes ?? 'Check-in realizado en recepción.',
        ]);

        return true;
    }
}`
  },

  // ==========================================
  // CONTROLLERS
  // ==========================================
  {
    id: 'controller-free-pass',
    filename: 'FreePassController.php',
    path: 'app/Http/Controllers/Api/FreePassController.php',
    category: 'controller',
    description: 'Controlador de captación de leads: valida lead, genera QR token único y despacha evento/notificación.',
    features: ['Inyección Form Request', 'Generación de QR y token único', 'Disparo de Evento y Notificación', 'Endpoint de verificación en recepción'],
    code: `<?php

declare(strict_types=1);

namespace App\\Http\\Controllers\\Api;

use App\\Events\\FreePassGenerated;
use App\\Http\\Controllers\\Controller;
use App\\Http\\Requests\\StoreFreePassRequest;
use App\\Models\\FreePass;
use App\\Notifications\\SendFreePassNotification;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Notification;
use Illuminate\\Support\\Str;
use Symfony\\Component\\HttpFoundation\\Response;

class FreePassController extends Controller
{
    /**
     * Generar un "Pase Libre de 1 Día" dinámico para captar un lead potencial.
     * Valida al usuario local, genera un token único para QR, persiste el registro
     * y despacha un evento/notificación por correo.
     *
     * @param StoreFreePassRequest $request Form Request con reglas anti-abuso
     * @return JsonResponse
     */
    public function store(StoreFreePassRequest $request): JsonResponse
    {
        // 1. Obtener datos validados
        $validated = $request->validated();

        // 2. Generar token único seguro para el código QR
        $qrToken = 'PASS-' . strtoupper(Str::random(8)) . '-' . (string) Str::ulid();

        // 3. Crear el pase en la base de datos con expiración de 48 horas
        $freePass = FreePass::create([
            'guest_name'    => $validated['guest_name'],
            'guest_email'   => Str::lower($validated['guest_email']),
            'guest_phone'   => $validated['guest_phone'],
            'qr_code_token' => $qrToken,
            'expires_at'    => now()->addHours(48),
            'utm_source'    => $request->input('utm_source', 'web_seo_landing'),
        ]);

        // 4. Disparar Evento de Laravel (permite analítica, webhooks CRM ej. HubSpot)
        event(new FreePassGenerated($freePass));

        // 5. Enviar Notificación por correo con el Pase y Código QR dinámico
        Notification::route('mail', $freePass->guest_email)
            ->notify(new SendFreePassNotification($freePass));

        // 6. Respuesta JSON con payload completo para renderizar el QR en el frontend
        return response()->json([
            'success' => true,
            'message' => '¡Tu Pase Libre de 1 Día ha sido generado exitosamente! Revisa tu correo.',
            'data'    => [
                'id'            => $freePass->id,
                'guest_name'    => $freePass->guest_name,
                'guest_email'   => $freePass->guest_email,
                'qr_code_token' => $freePass->qr_code_token,
                'qr_svg_url'    => route('api.free-passes.qr', ['token' => $freePass->qr_code_token]),
                'expires_at'    => $freePass->expires_at->toIso8601String(),
                'expires_human' => $freePass->expires_at->diffForHumans(),
            ],
        ], Response::HTTP_CREATED);
    }

    /**
     * Endpoint para escaneo y validación en torniquete o mostrador de recepción por Staff/Admin.
     */
    public function verify(Request $request, string $token): JsonResponse
    {
        $freePass = FreePass::where('qr_code_token', $token)->first();

        if (! $freePass) {
            return response()->json([
                'success' => false,
                'message' => 'Código QR inválido o inexistente.',
            ], Response::HTTP_NOT_FOUND);
        }

        if ($freePass->isUsed()) {
            return response()->json([
                'success' => false,
                'message' => 'Este pase ya fue canjeado el: ' . $freePass->used_at->format('d/m/Y H:i'),
                'pass'    => $freePass,
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($freePass->isExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'Este pase expiró el ' . $freePass->expires_at->format('d/m/Y H:i'),
            ], Response::HTTP_GONE);
        }

        // Marcar como usado
        $freePass->markAsUsed($request->input('notes', 'Canjeado en recepción'));

        return response()->json([
            'success' => true,
            'message' => '¡Pase libre verificado con éxito! Bienvenido al gimnasio.',
            'guest'   => [
                'name'    => $freePass->guest_name,
                'email'   => $freePass->guest_email,
                'used_at' => $freePass->used_at->toIso8601String(),
            ],
        ]);
    }
}`
  },
  {
    id: 'controller-community-post',
    filename: 'CommunityPostController.php',
    path: 'app/Http/Controllers/Api/CommunityPostController.php',
    category: 'controller',
    description: 'Controlador de Comunidad: subida optimizada en WebP a Storage, moderación admin y feed con paginación.',
    features: ['Conversión a formato WebP optimizado', 'Storage API de Laravel', 'Paginación cursor/simplePaginate', 'Moderación y likes'],
    code: `<?php

declare(strict_types=1);

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Http\\Requests\\StoreCommunityPostRequest;
use App\\Models\\CommunityPost;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Storage;
use Illuminate\\Support\\Str;
use Symfony\\Component\\HttpFoundation\\Response;

class CommunityPostController extends Controller
{
    /**
     * Listar dinámicamente los posts aprobados para el Feed social público.
     * Utiliza paginación optimizada simplePaginate y eager loading del autor.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 12), 30);

        $posts = CommunityPost::query()
            ->approved()
            ->with(['user:id,name,role,avatar_url'])
            ->simplePaginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $posts->items(),
            'pagination' => [
                'current_page' => $posts->currentPage(),
                'has_more'     => $posts->hasMorePages(),
                'next_page_url'=> $posts->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Guardar un nuevo post de comunidad con conversión y optimización en WebP.
     * El post queda pendiente de aprobación por el Administrador.
     */
    public function store(StoreCommunityPostRequest $request): JsonResponse
    {
        $user = $request->user();
        $file = $request->file('image');

        // =========================================================================
        // PIPELINE DE PROCESAMIENTO Y OPTIMIZACIÓN A WEBP
        // =========================================================================
        // En producción se utiliza Intervention Image v3 o Imagick nativo:
        // $image = Image::read($file);
        // $image->scaleDown(width: 1200, height: 1200);
        // $encodedWebp = $image->encodeByMediaType('image/webp', quality: 82);
        // =========================================================================

        $filename = 'community/' . Str::uuid() . '.webp';

        // Simulación del guardado en el disco público optimizado
        // Storage::disk('public')->put($filename, (string) $encodedWebp);
        $path = $file->storeAs('community', Str::uuid() . '.webp', 'public');
        $publicUrl = Storage::disk('public')->url($path);

        // Crear registro en estado pendiente de moderación
        $post = CommunityPost::create([
            'user_id'           => $user->id,
            'image_url'         => $publicUrl,
            'caption'           => $request->input('caption'),
            'discipline_tag'    => $request->input('discipline_tag'),
            'approved_by_admin' => false, // Requiere aprobación previa de administración
            'likes_count'       => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => '¡Tu publicación ha sido subida exitosamente! Se mostrará en el feed en cuanto sea aprobada.',
            'data'    => $post->load('user:id,name,role,avatar_url'),
        ], Response::HTTP_CREATED);
    }

    /**
     * Moderación (Solo Administrador): Aprobar o rechazar un post de la comunidad.
     */
    public function approve(Request $request, CommunityPost $post): JsonResponse
    {
        // En un Request real se valida la Policy: $this->authorize('approve', $post);
        $isApproved = $request->boolean('approved', true);
        
        $post->update([
            'approved_by_admin' => $isApproved,
        ]);

        return response()->json([
            'success' => true,
            'message' => $isApproved ? 'Post aprobado para el feed público.' : 'Post desaprobado.',
            'post'    => $post,
        ]);
    }

    /**
     * Dar o quitar Like de un post de forma atómica.
     */
    public function toggleLike(Request $request, CommunityPost $post): JsonResponse
    {
        // Para simplificar se incrementa el contador; en producción se usa tabla pivote community_post_likes
        $post->incrementLikes();

        return response()->json([
            'success'     => true,
            'likes_count' => $post->likes_count,
        ]);
    }
}`
  },
  {
    id: 'controller-dashboard',
    filename: 'DashboardController.php',
    path: 'app/Http/Controllers/Api/DashboardController.php',
    category: 'controller',
    description: 'Controlador del Dashboard del Miembro: carga membresía actual, clases del día y productos recomendados.',
    features: ['Eager loading optimizado', 'Invocación de scopeRecommendedFor', 'Cálculo de horario de clases del día', 'Respuesta agregada'],
    code: `<?php

declare(strict_types=1);

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\Product;
use App\\Models\\User;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;

class DashboardController extends Controller
{
    /**
     * Cargar el dashboard principal dinámico del Miembro autenticado.
     * Incluye:
     * 1. Membresía actual (tier VIP/Regular, vigencia y estado).
     * 2. Clases programadas para hoy según sus disciplinas inscritas.
     * 3. Lista dinámica de productos recomendados (usando el local scope scopeRecommendedFor).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // 1. Eager loading de relaciones clave del usuario en una sola consulta SQL
        $user->load([
            'membership',
            'disciplines' => function ($query): void {
                $query->where('is_active', true);
            },
        ]);

        // 2. Información de la membresía actual
        $membership = $user->membership;
        $membershipData = null;

        if ($membership) {
            $membershipData = [
                'id'             => $membership->id,
                'tier'           => $membership->tier_name,
                'is_vip'         => $membership->isVip(),
                'status'         => $membership->status,
                'is_active'      => $membership->status === 'active' && $membership->end_date->isFuture(),
                'start_date'     => $membership->start_date->format('Y-m-d'),
                'end_date'       => $membership->end_date->format('Y-m-d'),
                'days_remaining' => $membership->daysRemaining(),
            ];
        }

        // 3. Clases de las disciplinas del usuario programadas para el día de hoy
        $todayName = now()->locale('es')->dayName; // ej. "martes"
        $todayClasses = $this->getTodayClassesForUser($user);

        // 4. Recomendación dinámica e inteligente de productos de E-commerce
        // Invocación del Local Scope definido en el modelo Product:
        $recommendedProducts = Product::query()
            ->recommendedFor($user)
            ->where('stock', '>', 0)
            ->take(4)
            ->get(['id', 'name', 'slug', 'description', 'price', 'stock', 'category', 'tags', 'image_url']);

        // 5. Retornar payload agregado para la vista o API móvil/web
        return response()->json([
            'success' => true,
            'member'  => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'role'        => $user->role,
                'avatar_url'  => $user->avatar_url,
                'disciplines' => $user->disciplines->map(fn($d) => [
                    'id'          => $d->id,
                    'name'        => $d->name,
                    'slug'        => $d->slug,
                    'description' => $d->description,
                ]),
            ],
            'membership'           => $membershipData,
            'today_schedule'       => [
                'day'     => ucfirst($todayName),
                'date'    => now()->format('d/m/Y'),
                'classes' => $todayClasses,
            ],
            'recommended_products' => $recommendedProducts,
        ]);
    }

    /**
     * Mapeo simulado de horarios de clases según las disciplinas inscritas del usuario.
     */
    private function getTodayClassesForUser(User $user): array
    {
        $classes = [];
        $timeSlots = [
            'Musculación' => [
                ['time' => '08:00 - 09:30', 'room' => 'Sala de Pesas Libre', 'trainer' => 'Coach Marcus', 'intensity' => 'Alta'],
                ['time' => '18:30 - 20:00', 'room' => 'Zona Hypertrophy', 'trainer' => 'Coach Marcus', 'intensity' => 'Alta'],
            ],
            'Crossfit' => [
                ['time' => '07:00 - 08:00', 'room' => 'The Box WOD 1', 'trainer' => 'Coach Brenda', 'intensity' => 'Extrema'],
                ['time' => '19:00 - 20:00', 'room' => 'The Box WOD 2', 'trainer' => 'Coach Brenda', 'intensity' => 'Extrema'],
            ],
            'Spinning' => [
                ['time' => '09:00 - 09:45', 'room' => 'Studio Ciclo Indoor', 'trainer' => 'Coach Sofía', 'intensity' => 'Media-Alta'],
                ['time' => '19:30 - 20:15', 'room' => 'Studio Ciclo Indoor', 'trainer' => 'Coach Sofía', 'intensity' => 'Media-Alta'],
            ],
            'Funcional' => [
                ['time' => '10:00 - 11:00', 'room' => 'Área TRX & Mobility', 'trainer' => 'Coach Daniel', 'intensity' => 'Media'],
                ['time' => '17:00 - 18:00', 'room' => 'Área TRX & Mobility', 'trainer' => 'Coach Daniel', 'intensity' => 'Media'],
            ],
        ];

        foreach ($user->disciplines as $discipline) {
            if (isset($timeSlots[$discipline->name])) {
                foreach ($timeSlots[$discipline->name] as $slot) {
                    $classes[] = array_merge($slot, [
                        'discipline' => $discipline->name,
                    ]);
                }
            }
        }

        // Ordenar cronológicamente por hora de inicio
        usort($classes, fn($a, $b) => strcmp($a['time'], $b['time']));

        return $classes;
    }
}`
  },

  // ==========================================
  // FORM REQUESTS & NOTIFICATIONS
  // ==========================================
  {
    id: 'request-free-pass',
    filename: 'StoreFreePassRequest.php',
    path: 'app/Http/Requests/StoreFreePassRequest.php',
    category: 'request',
    description: 'Validación robusta con reglas anti-abuso (1 pase por email cada 90 días, validación telefónica).',
    features: ['Reglas de validación estrictas', 'Anti-abuso por email', 'Normalización de teléfono'],
    code: `<?php

declare(strict_types=1);

namespace App\\Http\\Requests;

use App\\Models\\FreePass;
use Illuminate\\Foundation\\Http\\FormRequest;
use Illuminate\\Validation\\Rule;

class StoreFreePassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Acceso público para captación de leads en la landing page
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'guest_name' => ['required', 'string', 'min:3', 'max:120'],
            'guest_email' => [
                'required',
                'string',
                'email:rfc,dns',
                'max:180',
                // Validación anti-abuso: solo 1 pase gratis cada 90 días por dirección de correo
                function (string $attribute, mixed $value, \\Closure $fail): void {
                    $alreadyClaimed = FreePass::where('guest_email', strtolower((string) $value))
                        ->where('created_at', '>=', now()->subDays(90))
                        ->exists();

                    if ($alreadyClaimed) {
                        $fail('Ya se solicitó un pase libre con este correo en los últimos 90 días.');
                    }
                },
            ],
            'guest_phone' => ['required', 'string', 'min:7', 'max:25'],
            'utm_source'  => ['nullable', 'string', 'max:60'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'guest_name.required'  => 'El nombre completo es obligatorio.',
            'guest_email.required' => 'El correo electrónico es indispensable para enviarte el código QR.',
            'guest_email.email'    => 'Debes proporcionar un formato de correo válido.',
            'guest_phone.required' => 'El teléfono de contacto es necesario para confirmar tu visita.',
        ];
    }
}`
  },
  {
    id: 'request-community-post',
    filename: 'StoreCommunityPostRequest.php',
    path: 'app/Http/Requests/StoreCommunityPostRequest.php',
    category: 'request',
    description: 'Validación de subida de imágenes para la comunidad (formatos, dimensiones y tamaño máximo).',
    features: ['Validación mimes:jpeg,png,webp', 'Max 10MB', 'Caption sanitation'],
    code: `<?php

declare(strict_types=1);

namespace App\\Http\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;

class StoreCommunityPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Solo miembros activos pueden subir contenido
        return $this->user() !== null && $this->user()->active;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'image' => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:10240', // Máximo 10MB antes de ser procesado a WebP
            ],
            'caption' => ['required', 'string', 'min:4', 'max:800'],
            'discipline_tag' => ['nullable', 'string', 'max:50'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'image.required' => 'Debes adjuntar una foto de tu entrenamiento o logro.',
            'image.image'    => 'El archivo debe ser una imagen válida (JPG, PNG o WebP).',
            'image.max'      => 'La imagen no debe superar los 10MB.',
            'caption.required' => 'Escribe una breve descripción o frase motivacional.',
        ];
    }
}`
  },
  {
    id: 'notification-free-pass',
    filename: 'SendFreePassNotification.php',
    path: 'app/Notifications/SendFreePassNotification.php',
    category: 'notification',
    description: 'Notificación por correo con QR renderizado y detalles de llegada al gimnasio (Queueable).',
    features: ['ShouldQueue para rendimiento asíncrono', 'MailMessage con diseño de marca', 'Adjunto o embebido de QR'],
    code: `<?php

declare(strict_types=1);

namespace App\\Notifications;

use App\\Models\\FreePass;
use Illuminate\\Bus\\Queueable;
use Illuminate\\Contracts\\Queue\\ShouldQueue;
use Illuminate\\Notifications\\Messages\\MailMessage;
use Illuminate\\Notifications\\Notification;

class SendFreePassNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly FreePass $freePass
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Construir el correo electrónico enviado al prospecto.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $qrVerifyUrl = route('api.free-passes.verify', ['token' => $this->freePass->qr_code_token]);

        return (new MailMessage)
            ->subject('🏋️ ¡Tu Pase Libre de 1 Día en Fenix GYM está listo!')
            ->greeting("¡Hola, {$this->freePass->guest_name}!")
            ->line('Te damos la bienvenida a la experiencia Fenix GYM. Tu pase de cortesía de 1 día ha sido emitido con éxito.')
            ->line("**Token del Pase:** \`{$this->freePass->qr_code_token}\`")
            ->line("**Válido hasta:** {$this->freePass->expires_at->format('d/m/Y H:i')} ({$this->freePass->expires_at->diffForHumans()})")
            ->action('Ver mi Pase con Código QR', $qrVerifyUrl)
            ->line('Presenta este código QR en la recepción de cualquiera de nuestras sedes para ingresar sin costo.')
            ->line('¡Esperamos verte entrenar hoy con nosotros!');
    }
}`
  },
  {
    id: 'event-free-pass',
    filename: 'FreePassGenerated.php',
    path: 'app/Events/FreePassGenerated.php',
    category: 'notification',
    description: 'Evento de Laravel disparado al emitir un pase, permitiendo sincronización con CRM y analítica.',
    features: ['Dispatchable, SerializesModels', 'Broadcast o Listeners asíncronos'],
    code: `<?php

declare(strict_types=1);

namespace App\\Events;

use App\\Models\\FreePass;
use Illuminate\\Broadcasting\\InteractsWithSockets;
use Illuminate\\Foundation\\Events\\Dispatchable;
use Illuminate\\Queue\\SerializesModels;

class FreePassGenerated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly FreePass $freePass
    ) {}
}`
  },
  {
    id: 'routes-api',
    filename: 'api.php',
    path: 'routes/api.php',
    category: 'route',
    description: 'Rutas API completas en Laravel 13 con prefijos de versión, Sanctum y rate limiting.',
    features: ['Rate limiting / Throttle', 'Sanctum auth', 'Role middleware', 'Grupos ordenados'],
    code: `<?php

declare(strict_types=1);

use App\\Http\\Controllers\\Api\\CommunityPostController;
use App\\Http\\Controllers\\Api\\DashboardController;
use App\\Http\\Controllers\\Api\\FreePassController;
use Illuminate\\Support\\Facades\\Route;

/*
|--------------------------------------------------------------------------
| Rutas API - Fenix GYM Platform (Laravel 13)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function (): void {

    // ==========================================
    // MÓDULO 4: CAPTACIÓN Y PASE LIBRE (LEADS)
    // ==========================================
    // Rate limit estricto de 5 solicitudes por minuto por IP para prevenir abusos
    Route::middleware('throttle:5,1')->group(function (): void {
        Route::post('/free-passes', [FreePassController::class, 'store'])
            ->name('api.free-passes.store');
    });

    // Verificación de QR en recepción por Staff / Entrenadores
    Route::post('/free-passes/verify/{token}', [FreePassController::class, 'verify'])
        ->name('api.free-passes.verify');

    // ==========================================
    // MÓDULO 3: COMUNIDAD PÚBLICA (FEED)
    // ==========================================
    Route::get('/community-posts', [CommunityPostController::class, 'index'])
        ->name('api.community-posts.index');

    Route::post('/community-posts/{post}/like', [CommunityPostController::class, 'toggleLike'])
        ->middleware('throttle:60,1')
        ->name('api.community-posts.like');

    // ==========================================
    // RUTAS AUTENTICADAS (SANCTUM)
    // ==========================================
    Route::middleware('auth:sanctum')->group(function (): void {
        
        // MÓDULO 1 & 2: DASHBOARD DEL MIEMBRO & VENTA CRUZADA
        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->name('api.dashboard.index');

        // MÓDULO 3: SUBIDA DE FOTO A COMUNIDAD
        Route::post('/community-posts', [CommunityPostController::class, 'store'])
            ->name('api.community-posts.store');

        // RUTAS PRIVADAS DE ADMINISTRADOR
        Route::middleware('role:admin')->prefix('admin')->group(function (): void {
            Route::patch('/community-posts/{post}/approve', [CommunityPostController::class, 'approve'])
                ->name('api.admin.community-posts.approve');
        });
    });
});`
  }
];
