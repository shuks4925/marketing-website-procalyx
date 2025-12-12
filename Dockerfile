# Use official Nginx image
FROM nginx:alpine

# Copy website files to nginx html directory
COPY index.html terms.html privacy.html styles.css script.js Procalyx.png config.json /usr/share/nginx/html/

# Copy assets directory
COPY assets/ /usr/share/nginx/html/assets/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

