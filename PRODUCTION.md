# Production Deployment Guide / 生产环境部署指南

Deploying **Pwned Proxy** on a Linux server, behind an **nginx reverse proxy**
with HTTPS. Written for someone new to nginx and deployment.

在 Linux 服务器上,把 **Pwned Proxy** 部署到 **nginx 反向代理**后面,并启用
HTTPS。本指南面向不熟悉 nginx 和部署的读者。

---

## 1. How the pieces fit together / 各部分如何协作

**EN.** Three services run in Docker. nginx is the only thing exposed to the
internet; it holds the TLS certificate and forwards traffic to the right place.

**中文.** 三个服务都跑在 Docker 里。只有 nginx 对互联网开放,它持有 TLS 证书,
并把流量转发到正确的地方。

```
                 Internet  (HTTPS :443)
                      │
                ┌─────▼─────┐
                │   nginx   │   holds TLS cert / 持有 TLS 证书
                └─────┬─────┘
        ┌─────────────┴──────────────┐
        │                            │
  yoursite.com                 api.yoursite.com
  React website /              Django: /admin /swagger /api
  网站前端                       后端 (管理后台 / 文档 / API)
        │  /api/ ─────────────►      │
        │                    ┌───────▼────────┐
        │                    │ Gunicorn :8000 │  (not exposed / 不对外开放)
        │                    └───────┬────────┘
        │                    ┌───────▼────────┐
        │                    │  PostgreSQL    │  (internal only / 仅内部)
        │                    └────────────────┘
```

- `yoursite.com` — the public React email checker. Its `/api/` calls are
  proxied to the backend. / 公开的 React 邮箱检测网页,它的 `/api/` 请求被转发到后端。
- `api.yoursite.com` — the Django backend directly: admin panel, Swagger docs,
  and the API for external clients using their own keys. / 直接指向 Django 后端:
  管理后台、Swagger 文档,以及给外部客户端(用自己密钥)调用的 API。

---

## 2. What was changed to make this production-ready / 为支持生产环境做了哪些改动

**EN.** The app was already ~90% ready (Gunicorn, WhiteNoise, Postgres support).
Only a few code fixes in `app/config/settings.py` were needed so it behaves
correctly behind nginx:

**中文.** 这个应用本来就已经准备好约 90%(用了 Gunicorn、WhiteNoise、支持 Postgres)。
只需要在 `app/config/settings.py` 里做几处修复,它就能在 nginx 后面正确运行:

| Fix / 修复 | Why / 原因 |
|---|---|
| `DEBUG`, `DOMAIN`, `CSRF_TRUSTED_ORIGINS` now read from env vars | So the real domain and HTTPS login work / 让真实域名和 HTTPS 登录生效 |
| Enabled `SECURE_PROXY_SSL_HEADER` + `USE_X_FORWARDED_HOST` | So Django trusts nginx's "this was HTTPS" signal / 让 Django 信任 nginx 传来的"这是 HTTPS"信号 |
| Removed a duplicate block that forced SQLite | So Postgres is actually used / 让 Postgres 真正生效 |

**EN.** Everything else is new *deployment* files — no application logic changed.

**中文.** 其余都是新增的*部署*文件,应用逻辑没有改动。

New files / 新增文件:
`PRODUCTION.md`, `docker-compose.prod.yaml`, `nginx/nginx.conf`,
`ui/Dockerfile`, `ui/.dockerignore`, `app/.env.prod.example`.

---

## 3. Prerequisites / 前置条件

- A Linux server (Debian/Ubuntu) with a public IP. / 一台有公网 IP 的 Linux 服务器。
- A domain name you control. / 一个你能管理的域名。
- Docker + Docker Compose installed. / 已安装 Docker 和 Docker Compose。
- Ports **80** and **443** open in the firewall. / 防火墙放行 **80** 和 **443** 端口。

Install Docker if needed / 如需安装 Docker:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin certbot
sudo systemctl enable --now docker
```

---

## 4. Point your domain at the server / 把域名指向服务器

**EN.** In your DNS provider, create two **A records** pointing at the server's
public IP:

**中文.** 在你的 DNS 服务商处,创建两条指向服务器公网 IP 的 **A 记录**:

| Type | Name | Value |
|------|------|-------|
| A | `yoursite.com`     | `YOUR.SERVER.IP` |
| A | `api.yoursite.com` | `YOUR.SERVER.IP` |

Wait a few minutes, then check / 等几分钟后验证:

```bash
dig +short yoursite.com
dig +short api.yoursite.com
```

Both should print your server's IP. / 两条都应打印出你服务器的 IP。

---

## 5. Get the code and configure it / 获取代码并配置

```bash
git clone https://github.com/dtuait/pwned-proxy-combined
cd pwned-proxy-combined
```

### 5a. Backend environment / 后端环境

```bash
cp app/.env.prod.example app/.env
```

Edit `app/.env` and set real values (see comments in the file). At minimum:
编辑 `app/.env`,填入真实值(文件里有注释说明)。至少要改:

- `DJANGO_SECRET_KEY` — a long random string. Generate one:
  ```bash
  python3 -c "import secrets; print(secrets.token_urlsafe(64))"
  ```
- `DJANGO_ALLOWED_HOSTS=yoursite.com,api.yoursite.com`
- `DJANGO_DOMAIN=api.yoursite.com`
- `DJANGO_CSRF_TRUSTED_ORIGINS=https://yoursite.com,https://api.yoursite.com`
- `POSTGRES_PASSWORD` — a long random password. / 一个长随机密码。

### 5b. nginx domains / nginx 域名

**EN.** Open `nginx/nginx.conf` and replace every `yoursite.com` and
`api.yoursite.com` with your real domains.

**中文.** 打开 `nginx/nginx.conf`,把里面所有的 `yoursite.com` 和
`api.yoursite.com` 换成你的真实域名。

```bash
sed -i 's/yoursite.com/example.com/g' nginx/nginx.conf   # optional shortcut / 可选的快捷替换
```

---

## 6. Get a TLS certificate / 获取 TLS 证书

**EN.** nginx needs a certificate before it can serve HTTPS. We use **certbot**
(free, from Let's Encrypt). Run this **before** starting the stack, while port 80
is free:

**中文.** nginx 提供 HTTPS 之前需要证书。我们用 **certbot**(免费,来自
Let's Encrypt)。在启动整个栈**之前**运行(此时 80 端口空闲):

```bash
sudo certbot certonly --standalone \
  -d yoursite.com -d api.yoursite.com \
  --agree-tos -m you@example.com --no-eff-email
```

**EN.** This saves certificates under `/etc/letsencrypt/live/yoursite.com/`,
which the nginx container reads (mounted read-only in the compose file).

**中文.** 证书会保存在 `/etc/letsencrypt/live/yoursite.com/` 下,nginx 容器会读取它
(在 compose 文件里以只读方式挂载)。

> ⚠️ The cert folder is named after the **first** `-d` domain. Keep that domain
> matching the `ssl_certificate` paths in `nginx/nginx.conf`.
> ⚠️ 证书文件夹以**第一个** `-d` 域名命名。请保证它与 `nginx/nginx.conf` 里的
> `ssl_certificate` 路径一致。

---

## 7. Start the stack / 启动服务

```bash
docker compose -f docker-compose.prod.yaml up -d --build
```

**EN.** This builds the frontend, starts nginx, the backend, and Postgres. On
first start the backend runs migrations, collects static files, and creates an
admin user. See the printed credentials:

**中文.** 这会构建前端,并启动 nginx、后端和 Postgres。首次启动时后端会执行数据库
迁移、收集静态文件、并创建管理员账号。查看打印出的登录凭据:

```bash
docker compose -f docker-compose.prod.yaml logs backend | grep -i -A3 admin
```

Now visit / 现在访问:
- `https://yoursite.com` — the public website / 公开网站
- `https://api.yoursite.com/admin/` — the Django admin / Django 管理后台
- `https://api.yoursite.com/swagger/` — the API docs / API 文档

---

## 8. First-time API setup / 首次 API 配置

**EN.** Log into `https://api.yoursite.com/admin/` and:

**中文.** 登录 `https://api.yoursite.com/admin/`,然后:

1. **HIBP Keys** → add your HaveIBeenPwned API key. / 添加你的 HaveIBeenPwned API 密钥。
2. **Domains** → *Import from HIBP*. / 从 HIBP 导入域名。
3. **Groups** → *Seed Groups* → download `seeded_api_keys.json`. / 生成分组密钥并下载。
4. (Optional) To let the public website authenticate with the *Master Group*
   key, uncomment the `X-API-Key` line in `nginx/nginx.conf`, paste the raw key,
   then `docker compose -f docker-compose.prod.yaml restart nginx`. /
   (可选)若想让公开网站用 *Master Group* 密钥认证,取消 `nginx/nginx.conf` 里
   `X-API-Key` 那一行的注释,粘贴原始密钥,再重启 nginx。

---

## 9. Everyday operations / 日常运维

```bash
# View logs / 查看日志
docker compose -f docker-compose.prod.yaml logs -f

# Restart after editing nginx.conf / 修改 nginx.conf 后重启
docker compose -f docker-compose.prod.yaml restart nginx

# Update after a git pull / git pull 后更新
git pull
docker compose -f docker-compose.prod.yaml up -d --build

# Stop everything / 停止全部
docker compose -f docker-compose.prod.yaml down
```

### Certificate renewal / 证书续期

**EN.** Let's Encrypt certs last 90 days. This renews them automatically and
briefly restarts nginx to load the new cert:

**中文.** Let's Encrypt 证书有效期 90 天。下面的命令会自动续期,并短暂重启 nginx 以
加载新证书:

```bash
sudo certbot renew \
  --pre-hook  "docker compose -f $(pwd)/docker-compose.prod.yaml stop nginx" \
  --post-hook "docker compose -f $(pwd)/docker-compose.prod.yaml start nginx"
```

`certbot` already installs a systemd timer that runs `renew` twice a day, so you
usually don't need to schedule anything yourself.
`certbot` 已经安装了一个每天运行两次 `renew` 的 systemd 定时器,所以通常你不用自己
再设置计划任务。

---

## 10. Troubleshooting / 排错

| Symptom / 现象 | Likely cause / 可能原因 |
|---|---|
| `502 Bad Gateway` | Backend not up yet, or crashed. Check `logs backend`. / 后端还没起来或崩溃了。查看后端日志。 |
| `400 Bad Request` on admin | Domain missing from `DJANGO_ALLOWED_HOSTS`. / 域名没写进 `DJANGO_ALLOWED_HOSTS`。 |
| CSRF error on admin login | Domain missing from `DJANGO_CSRF_TRUSTED_ORIGINS` (needs `https://`). / 域名没写进 `DJANGO_CSRF_TRUSTED_ORIGINS`(要带 `https://`)。 |
| Swagger links show `http://` | `X-Forwarded-Proto` not reaching Django — check the nginx `proxy_set_header` lines. / `X-Forwarded-Proto` 没传到 Django,检查 nginx 的 `proxy_set_header`。 |
| nginx won't start, cert error | Certificate path/domain mismatch in `nginx/nginx.conf`. / `nginx/nginx.conf` 里证书路径或域名不匹配。 |
| Admin page has no styling | `collectstatic` failed; check backend logs. / `collectstatic` 失败,查看后端日志。 |

Inspect what's running / 查看运行状态:

```bash
docker compose -f docker-compose.prod.yaml ps
```
