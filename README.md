# 🍕 Food Store - Frontend Vanilla

Aplicación web completa de tienda de comida desarrollada con **TypeScript Vanilla** (sin frameworks), **Vite** como bundler e integrada con un backend **Spring Boot** REST API.

## 🎯 Descripción del Proyecto

Este es un proyecto académico full-stack que implementa una tienda de alimentos con las siguientes capacidades:

- **Sistema de autenticación** (Login/Registro)
- **Catálogo de productos** con filtros y búsqueda
- **Carrito de compras** persistente
- **Gestión de pedidos** con seguimiento de estados
- **Panel de administración** completo (CRUD de productos, categorías y gestión de pedidos)
- **Perfil de usuario** con estadísticas

---

## 📋 Requisitos Previos

- **Node.js** (versión 16 o superior)
- **pnpm** (gestor de paquetes)
- **Java 21** (para el backend)
- **Gradle** (para el backend)

## Instalación de pnpm

### Windows
```bash
# Usando npm
npm install -g pnpm

# O usando PowerShell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

### macOS/Linux
```bash
# Usando npm
npm install -g pnpm

# O usando curl
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### Verificar instalación
```bash
pnpm --version
```

```bash
cd front-store-vanilla
pnpm install
```

### 3. Levantar el Frontend

#### Modo desarrollo
```bash
pnpm dev
```
El proyecto se abrirá en `http://localhost:5173`

#### Build para producción
```bash
pnpm build
```

#### Preview del build
```bash
pnpm preview
```

---

## 👥 Usuarios por Defecto

### Usuario Administrador
```
Email: admin@admin.com
Password: 123456
```

### Usuario Cliente (crear mediante registro)
El sistema permite registrar nuevos usuarios desde `/src/pages/auth/register/register.html`

---

## 📝 Endpoints del Backend

**Base URL:** `http://localhost:8080`

### Categorías
- `GET /categoria` - Listar todas
- `GET /categoria/{id}` - Obtener por ID
- `POST /categoria` - Crear
- `PUT /categoria/{id}` - Actualizar
- `DELETE /categoria/{id}` - Eliminar (soft delete)

### Productos
- `GET /producto` - Listar todos
- `GET /producto/{id}` - Obtener por ID
- `GET /producto/categoria/{idCategoria}` - Por categoría
- `POST /producto` - Crear
- `PUT /producto/{id}` - Actualizar
- `DELETE /producto/{id}` - Eliminar (soft delete)

### Usuarios
- `GET /usuario` - Listar todos
- `GET /usuario/{id}` - Obtener por ID
- `POST /usuario` - Crear (registro)
- `PUT /usuario/{id}` - Actualizar
- `DELETE /usuario/{id}` - Eliminar (soft delete)

### Pedidos
- `GET /pedido` - Listar todos
- `GET /pedido/{id}` - Obtener por ID
- `GET /pedido/usuario/{idUsuario}` - Por usuario
- `POST /pedido` - Crear
- `PUT /pedido/{id}` - Actualizar estado
- `DELETE /pedido/{id}` - Eliminar (soft delete)

---

## 🔄 Estados de Pedido

El sistema maneja los siguientes estados:

1. **PENDIENTE** - Pedido recién creado
2. **CONFIRMADO** - Pedido confirmado por el administrador
3. **EN_PREPARACION** - En proceso de preparación
4. **ENVIADO** - En camino al cliente
5. **ENTREGADO** - Entregado al cliente
6. **TERMINADO** - Proceso completado
7. **CANCELADO** - Pedido cancelado

---

### Frontend
- El carrito se guarda en `localStorage` (se pierde al limpiar navegador)
- No hay paginación en listados grandes
- Las imágenes de productos son URLs externas

---

## 🧪 Flujo de Prueba Completo

### Escenario 1: Cliente realiza una compra

1. **Registro**
   - Ir a `/src/pages/auth/register/register.html`
   - Registrar nuevo usuario

2. **Explorar catálogo**
   - Navegar productos en `/src/pages/store/home/home.html`
   - Filtrar por categoría
   - Ver detalle del producto

3. **Agregar al carrito**
   - Seleccionar cantidad
   - Agregar productos

4. **Realizar pedido**
   - Ir al carrito `/src/pages/store/cart/cart.html`
   - Completar checkout con dirección y método de pago
   - Confirmar pedido

5. **Ver historial**
   - Ir a `/src/pages/client/orders/orders.html`
   - Ver estado del pedido

### Escenario 2: Administrador gestiona el negocio

1. **Login como admin**
   - Email: `admin@admin.com`
   - Password: `123456`

2. **Ver dashboard**
   - `/src/pages/admin/adminHome/adminHome.html`
   - Ver estadísticas, productos con stock bajo, ingresos

3. **Gestionar productos**
   - Crear, editar o eliminar productos
   - Actualizar stock

4. **Gestionar pedidos**
   - Ver pedidos pendientes
   - Cambiar estado de pedido (Pendiente → Confirmado → En Preparación → etc.)
   - Ver detalle de cada pedido

---

## 🐛 Debugging

### El backend no se conecta
```bash
# Verificar que el backend esté corriendo
curl http://localhost:8080/producto

# Si no responde, verificar:
cd ../2026Pro3
./gradlew bootRun
```

### Error de CORS
- El backend ya tiene CORS habilitado para `*`
- Verificar que no haya otro proceso en el puerto 8080

### LocalStorage no persiste
- Verificar que el navegador no esté en modo incógnito
- Limpiar caché si hay problemas

---

## 📄 Licencia

Proyecto académico para la materia de Programación 3.

---

## 👨‍💻 Autor

Desarrollado como proyecto académico Full-Stack con Vanilla TypeScript + Spring Boot.

## Estructura del Proyecto

```
front-store-vanilla/
├── src/
│   ├── pages/
│   │   ├── admin/          # Páginas del panel de administración
│   │   │   ├── adminHome/
│   │   │   ├── categories/
│   │   │   ├── orders/
│   │   │   └── products/
│   │   ├── auth/           # Páginas de autenticación
│   │   │   ├── login/
│   │   │   └── resgister/
│   │   ├── client/         # Páginas del cliente
│   │   │   ├── orders/
│   │   │   └── profile/
│   │   └── store/          # Páginas de la tienda
│   │       ├── home/
│   │       ├── cart/
│   │       └── productDetail/
│   ├── types/              # Definiciones de TypeScript
│   │   ├── IBackendDtos.ts
│   │   ├── ICart.ts
│   │   ├── ICategoria.ts
│   │   ├── IOrders.ts
│   │   ├── IProduct.ts
│   │   └── IUser.ts
│   ├── utils/              # Utilidades y helpers
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── cart.ts
│   │   ├── mappers.ts
│   │   └── navigate.ts
│   ├── main.ts             # Punto de entrada
│   └── style.css           # Estilos globales
├── index.html
├── package.json
└── tsconfig.json
```

### Frontend (este proyecto)
```
front-store-vanilla/
├── src/
│   ├── pages/
│   │   ├── admin/          # Panel de administración
│   │   │   ├── adminHome/  # Dashboard con estadísticas
│   │   │   ├── categories/ # CRUD Categorías
│   │   │   ├── products/   # CRUD Productos
│   │   │   └── orders/     # Gestión de pedidos
│   │   ├── auth/           # Autenticación
│   │   │   ├── login/      # Login
│   │   │   └── register/   # Registro
│   │   ├── client/         # Área del cliente
│   │   │   ├── orders/     # Historial de pedidos
│   │   │   └── profile/    # Perfil de usuario
│   │   └── store/          # Tienda
│   │       ├── home/       # Catálogo de productos
│   │       ├── cart/       # Carrito de compras
│   │       └── productDetail/ # Detalle del producto
│   ├── types/              # Interfaces TypeScript
│   ├── utils/              # Utilidades
│   │   ├── api.ts         # Cliente HTTP (fetch)
│   │   ├── auth.ts        # Gestión de autenticación
│   │   ├── cart.ts        # Gestión del carrito
│   │   ├── mappers.ts     # Mapeo DTOs backend ↔ frontend
│   │   └── navigate.ts    # Navegación
│   ├── main.ts
│   └── style.css
└── index.html
```

### Backend (Spring Boot)
**Ubicación:** `../2026Pro3/`
- **Tecnología:** Spring Boot 3.4.12 + Java 21
- **Base de datos:** H2 (desarrollo) / PostgreSQL (producción)
- **API REST:** `http://localhost:8080`

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **TypeScript**: Tipado estático para mayor robustez
- **Vite**: Build tool ultra rápido
- **Vanilla JavaScript**: Sin frameworks, HTML/CSS/TS puro
- **pnpm**: Gestor de paquetes eficiente
- **Fetch API**: Cliente HTTP nativo

### Backend
- **Spring Boot 3.4.12**
- **Spring Data JPA** (Hibernate)
- **H2 Database** (desarrollo)
- **PostgreSQL** (producción)
- **BCrypt** (encriptación de contraseñas)
- **Lombok** (reducción de boilerplate)
- **Gradle 8.14.3**

---

## 🚀 Configuración e Instalación

### 1. Iniciar el Backend

```bash
cd ../2026Pro3
./gradlew bootRun
```

El backend estará disponible en `http://localhost:8080`

### 2. Instalar el Frontend

---

## ✨ Características Implementadas

### 🔐 Autenticación y Usuarios
- ✅ Registro de usuarios con validaciones
- ✅ Login (con limitación: sin validación de contraseña en backend)
- ✅ Roles diferenciados: **ADMIN** y **USUARIO**
- ✅ Persistencia de sesión con localStorage
- ✅ Rutas protegidas por rol

### 🛒 Tienda (Cliente)
- ✅ Catálogo de productos con imágenes
- ✅ Filtrado por categoría
- ✅ Búsqueda por nombre/descripción
- ✅ Ordenamiento (precio, nombre)
- ✅ Detalle de producto completo
- ✅ Carrito de compras funcional (localStorage)
- ✅ Control de stock en tiempo real
- ✅ Proceso de checkout completo
- ✅ Historial de pedidos del usuario
- ✅ Seguimiento de estado de pedidos

### 👨‍💼 Panel de Administración
- ✅ Dashboard con estadísticas en tiempo real:
  - Ingresos totales
  - Pedidos pendientes, en preparación y completados
  - Estado del inventario (stock bajo, sin stock)
  - Alertas de productos críticos
- ✅ **CRUD de Categorías** (Crear, Leer, Actualizar, Eliminar)
- ✅ **CRUD de Productos** (con gestión de stock e imágenes)
- ✅ **Gestión de Pedidos**:
  - Ver todos los pedidos
  - Filtrar por estado
  - Cambiar estado (PENDIENTE → CONFIRMADO → EN_PREPARACION → ENVIADO → ENTREGADO → TERMINADO)
  - Ver detalle completo de cada pedido
  - Cancelar pedidos

### 👤 Perfil de Usuario
- ✅ Edición de información personal
- ✅ Cambio de contraseña (UI implementada, requiere backend)
- ✅ Estadísticas personales (pedidos realizados, total gastado)

---

## 🏗️ Arquitectura del Proyecto
