# Stage de build: usar Node 20 para compatibilidad con Vite
FROM node:20-alpine AS build
WORKDIR /app
ENV CI=true

# copiar package.json y lock (si existe) e instalar dependencias
COPY package.json package-lock.json* ./
RUN npm ci --silent

# copiar resto y construir
COPY . .
RUN npm run build

# Stage runtime: nginx sirve los archivos estáticos
FROM nginx:1.25-alpine
# copiar config nginx (asegúrate de fronted/nginx.conf existe y está incluido en el contexto)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]