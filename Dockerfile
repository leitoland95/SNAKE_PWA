# Imagen base ligera con Node para servir archivos estáticos
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock si existe
COPY package.json package-lock.json* ./

# Instalar serve
RUN npm install --production

# Copiar archivos públicos
COPY public ./public

# Exponer puerto (Render asigna el puerto por env)
ENV PORT 3000
EXPOSE 3000

# Comando para servir la carpeta public
CMD ["npx", "serve", "public", "-l", "tcp://0.0.0.0:3000"]