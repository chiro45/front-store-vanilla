# Food Store - Frontend Vanilla

Aplicación web de tienda de comida desarrollada con TypeScript vanilla (sin frameworks) y Vite como bundler.

## Requisitos Previos

- Node.js (versión 16 o superior)
- pnpm (gestor de paquetes)

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

## Instalación del Proyecto

1. Clona el repositorio
```bash
git clone <url-del-repositorio>
cd front-store-vanilla
```

2. Instala las dependencias
```bash
pnpm install
```

## Levantar el Proyecto

### Modo desarrollo
```bash
pnpm dev
```
El proyecto se abrirá en `http://localhost:5173` (o el puerto que Vite asigne).

### Build para producción
```bash
pnpm build
```

### Preview del build
```bash
pnpm preview
```

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

## Tecnologías Utilizadas

- **TypeScript**: Lenguaje de programación tipado
- **Vite**: Build tool y dev server rápido
- **Vanilla JavaScript**: Sin frameworks (HTML, CSS, TypeScript puro)
- **pnpm**: Gestor de paquetes eficiente

## Características

- Sistema de autenticación (login/registro)
- Panel de administración para gestionar productos, categorías y órdenes
- Tienda con catálogo de productos
- Carrito de compras
- Gestión de órdenes para clientes
- Arquitectura basada en componentes modulares
- TypeScript para type safety
