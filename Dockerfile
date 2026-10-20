# Landing Step4u: site estático servido pelo nginx na porta 80.
# No Coolify: Build Pack = Dockerfile e Ports Exposes = 80.
FROM nginx:1.27-alpine
# curl: o healthcheck do Coolify usa curl.
RUN apk add --no-cache curl
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY . /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/deploy /usr/share/nginx/html/Dockerfile
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD curl -fsS -o /dev/null http://127.0.0.1/ || exit 1
