# 🏋️ Fenix GYM - Plataforma Web & Arquitectura Laravel 13

Plataforma web integral y moderna para **Fenix GYM** diseñada para alta concurrencia, retención de miembros, e-commerce inteligente en **Bolivianos (Bs.)** y captación local de clientes con códigos QR dinámicos.

Construida bajo los estándares de **Laravel 13**, **PHP 8.4+ (tipado estricto)** y **MySQL 8.0+**, con una interfaz reactiva e interactiva desarrollada en **React 19**, **Vite** y **Tailwind CSS v4**.

---

## 🚀 Módulos del Sistema

1. **Autenticación y Perfiles Multi-Rol:**
   - Soporte para inicio tradicional y login social vía **Laravel Socialite** (Google, Apple, etc.).
   - Roles definidos: `admin`, `trainer` y `member`.
   - Control de membresías (`VIP` y `Regular`) con fechas de vigencia y alertas automáticas de caducidad.

2. **E-Commerce Inteligente con Venta Cruzada (Cross-Selling en Bs.):**
   - Catálogo completo con precios en **Bolivianos (Bs.)** de suplementos, ropa técnica y equipamiento.
   - **Motor de Recomendación Dinámico (`Product::scopeRecommendedFor`):** evalúa en MySQL 8.0 los tags en formato JSON según las disciplinas inscritas del usuario (Musculación, Crossfit, Spinning, Funcional).
   - Descuento automático del 15% para miembros de nivel VIP.

3. **Módulo de Comunidad (FitGram - Prueba Social):**
   - Feed dinámico estilo red social donde los miembros publican fotos de sus entrenamientos y marcas personales.
   - Pipeline de optimización de imágenes en **WebP** usando la Storage API de Laravel (reducción de ancho de banda de más del 95%).
   - Carrusel de **Stories** superiores con visor modal inmersivo.
   - Panel de moderación preventiva (`approved_by_admin = false`) y contador atómico de likes.

4. **Captación de Leads Locales (Pase Libre 1 Día con QR):**
   - Formulario de conversión local con reglas anti-abuso (1 pase por correo cada 90 días).
   - Generación de token criptográfico único (`qr_code_token`) y renderizado de código QR en formato SVG.
   - Disparo de eventos asíncronos (`FreePassGenerated`) y notificación por correo electrónico (`SendFreePassNotification`).
   - Simulador de escáner en mostrador para check-in inmediato en torniquetes.

5. **Laravel 13 Architecture Studio:**
   - Explorador de código fuente PSR-12 con copiado en 1 clic.
   - Diagrama de Esquema de Base de Datos (ERD) con claves foráneas, borrado en cascada e índices multi-valuados.
   - API Sandbox interactivo con perfiles y tiempos de ejecución de consultas SQL en vivo.

---

## 🛠️ Tecnologías y Requisitos

- **Frontend / Simulación Interactiva:**
  - Node.js 18+ o 20+
  - React 19 + TypeScript
  - Vite 8
  - Tailwind CSS v4
  - Motion & Lucide Icons
- **Backend Arquitectónico:**
  - PHP 8.4+ con tipado estricto (`declare(strict_types=1);`)
  - Laravel 13
  - MySQL 8.0+ (InnoDB, JSON columns & multi-valued indexes)
  - Laravel Sanctum & Laravel Socialite

---

## 💻 Instalación y Ejecución Local

### 1. Clonar el Repositorio
```bash
git clone https://github.com/TU-USUARIO/fenix-gym-platform.git
cd fenix-gym-platform
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### 4. Compilar para Producción
```bash
npm run build
```

---

## 📦 Despliegue del Backend en Laravel 13

Para desplegar la API en un entorno con PHP 8.4 y MySQL 8.0:

```bash
# 1. Instalar dependencias de Composer
composer install --optimize-autoloader --no-dev

# 2. Configurar variables de entorno
cp .env.example .env
php artisan key:generate

# 3. Ejecutar las 7 migraciones de base de datos
php artisan migrate

# 4. Poblar datos iniciales (disciplinas, productos en Bs., usuarios)
php artisan db:seed

# 5. Crear enlace simbólico para almacenamiento de fotos WebP
php artisan storage:link

# 6. Iniciar worker de colas para notificaciones de Pases Libres y procesamiento de imágenes
php artisan queue:work --tries=3
```

---

## 📁 Estructura del Código

```text
├── database/migrations/
│   ├── 0001_01_01_000000_create_users_table.php
│   ├── 2026_01_10_000001_create_memberships_table.php
│   ├── 2026_01_10_000002_create_disciplines_table.php
│   ├── 2026_01_10_000003_create_discipline_user_table.php
│   ├── 2026_01_10_000004_create_products_table.php
│   ├── 2026_01_10_000005_create_community_posts_table.php
│   └── 2026_01_10_000006_create_free_passes_table.php
├── app/Models/
│   ├── User.php
│   ├── Membership.php
│   ├── Discipline.php
│   ├── Product.php (Scope scopeRecommendedFor)
│   ├── CommunityPost.php
│   └── FreePass.php
├── app/Http/Controllers/Api/
│   ├── FreePassController.php
│   ├── CommunityPostController.php
│   └── DashboardController.php
└── src/
    ├── components/
    │   ├── gym/ (Dashboard, Store en Bs., FitGram, FreePass, Staff)
    │   ├── studio/ (CodeExplorer, DatabaseSchemaVisualizer, ApiSandbox)
    │   └── common/ (ImageCarousel, QrCodeSvg)
    └── data/ (Seed data y modelos)
```

---

## 📄 Licencia

Este proyecto está bajo la licencia [Apache 2.0](LICENSE).
