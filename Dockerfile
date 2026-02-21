FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY images/ /usr/share/nginx/html/images/
RUN mkdir -p /etc/nginx/templates
RUN echo 'server { listen ${PORT}; location / { root /usr/share/nginx/html; index index.html; } }' > /etc/nginx/templates/default.conf.template
