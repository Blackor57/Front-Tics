# ==============================================================================
# Etapa 1: Construcción de la aplicación con Node.js (Vite + React)
# ==============================================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias limpias de forma determinista
RUN npm ci

# Copiar todo el código fuente del frontend
COPY . .

# Argumento opcional para configurar la URL del backend durante la compilación
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Compilar la aplicación para producción (genera los estáticos en /app/dist)
RUN npm run build

# ==============================================================================
# Etapa 2: Servidor web de producción ligero con Nginx
# ==============================================================================
FROM nginx:alpine

# Copiar configuración optimizada de Nginx para SPA (React)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos compilados desde la etapa de construcción
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto HTTP estándar
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]