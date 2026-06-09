<div align="center">

# ChiriJson Chat

**Servidor WebSocket de alto rendimiento para comunicación en tiempo real**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-FBF0DF?style=for-the-badge&logo=bun&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67AC?style=for-the-badge&logo=zod&logoColor=white)

</div>

---

### Pasos

#### 1️⃣ Clonar el repositorio

```bash
cd bun-chat-websockets
```

#### 2️⃣ Instalar dependencias

```bash
bun install
```

#### 3️⃣ Configurar variables de entorno

```bash
cp .env.template .env
# Editar .env con tus credenciales de PostgreSQL
```

#### 4️⃣ Ejecutar migraciones de Prisma

```bash
bun prisma migrate dev
```

#### 5️⃣ Iniciar el servidor

```bash
bun run dev
```

✅ **Servidor ejecutándose en:** `ws://localhost:3200`

---

## 🌐 Frontend — Cliente Next.js

> Usa **pnpm** como gestor de paquetes en el cliente.

#### 1️⃣ Entrar al directorio

```bash
cd frontend
```

#### 2️⃣ Instalar dependencias

```bash
pnpm install
```

#### 3️⃣ Iniciar el servidor de desarrollo

```bash
pnpm dev
```

✅ **App ejecutándose en:** `http://localhost:3000`

---

## 🔧 Comandos disponibles

```bash
# Backend
bun run dev          # Desarrollo con hot reload
bun run start        # Producción

# Frontend (desde /frontend)
pnpm dev             # Servidor de desarrollo
pnpm build           # Build de producción

# Base de datos
bun prisma migrate dev    # Crear migración
bun prisma studio         # Abrir Prisma Studio
```

---

## 📝 Notas importantes

- ⚠️ Asegurate de que PostgreSQL esté corriendo antes de iniciar el backend
- 🔐 Nunca commitees el archivo `.env`
- 🎯 Usa tipos TypeScript para toda validación

---

<div align="center">

**Hecho con ❤️ Efrain Chiri Nina**

![Licencia](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

</div>
