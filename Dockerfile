FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY assets/ /usr/share/nginx/html/assets/ 2>/dev/null || true
EXPOSE 80
CMD ["sh", "-c", "sed -i 's/listen       80;/listen       '${PORT:-80}';/' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
