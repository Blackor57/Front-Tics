FROM nginx:alpine

# Copiar los archivos estáticos al directorio público de Nginx
COPY index.html styles.css app.js /usr/share/nginx/html/

# Copiar tu archivo de configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]