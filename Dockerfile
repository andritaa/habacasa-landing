FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html

# Railway uses PORT env var - default nginx template handles it
RUN echo 'server { listen ${PORT:-80}; location / { root /usr/share/nginx/html; index index.html; } }' > /etc/nginx/templates/default.conf.template

EXPOSE 80
