# 部署指南

本指南将帮助您将LoveZs应用部署到生产环境。

## 📋 前置要求

- Linux/Windows服务器
- Node.js 18+
- MongoDB 5.0+
- Nginx (可选，用于反向代理)
- SSL证书 (推荐)

## 🚀 快速部署

### 方法1：使用Docker (推荐)

1. **构建Docker镜像**
```bash
# 构建后端镜像
cd backend
docker build -t lovezs-backend .

# 构建前端镜像
cd ../frontend
docker build -t lovezs-frontend .
```

2. **运行容器**
```bash
# 创建网络
docker network create lovezs-network

# 运行MongoDB
docker run -d --name lovezs-mongo --network lovezs-network \
  -v lovezs-data:/data/db \
  mongo:5.0

# 运行后端
docker run -d --name lovezs-backend --network lovezs-network \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://lovezs-mongo:27017/lovezs \
  -e JWT_SECRET=your_super_secret_key \
  lovezs-backend

# 运行前端
docker run -d --name lovezs-frontend --network lovezs-network \
  -p 3000:3000 \
  lovezs-frontend
```

### 方法2：传统部署

1. **服务器准备**
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装MongoDB
sudo apt-get install gnupg
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

2. **部署应用**
```bash
# 创建应用目录
sudo mkdir -p /var/www/lovezs
cd /var/www/lovezs

# 克隆代码 (或上传代码)
git clone <your-repo-url> .

# 安装后端依赖
cd backend
npm install --production
npm run build

# 安装前端依赖
cd ../frontend
npm install
npm run build

# 配置环境变量
cd ../backend
cp env.example .env
nano .env  # 编辑环境变量
```

3. **使用PM2管理进程**
```bash
# 安装PM2
sudo npm install -g pm2

# 启动后端服务
cd /var/www/lovezs/backend
pm2 start dist/server.js --name lovezs-backend

# 启动前端服务 (如果不使用Nginx)
cd /var/www/lovezs/frontend
pm2 serve build 3000 --name lovezs-frontend --spa

# 保存PM2配置
pm2 save
pm2 startup
```

## 🌐 Nginx配置

1. **安装Nginx**
```bash
sudo apt install nginx
```

2. **配置Nginx**
```nginx
# /etc/nginx/sites-available/lovezs
server {
    listen 80;
    server_name your-domain.com;

    # 后端API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 前端应用
    location / {
        root /var/www/lovezs/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # 上传文件
    location /uploads {
        root /var/www/lovezs/backend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. **启用站点**
```bash
sudo ln -s /etc/nginx/sites-available/lovezs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL证书配置

### 使用Let's Encrypt (免费)
```bash
# 安装Certbot
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# 获取证书
sudo certbot --nginx -d your-domain.com

# 设置自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 数据库配置

### MongoDB生产配置
```javascript
// /etc/mongod.conf
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled

# 创建管理员用户
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})
```

## 🔧 环境变量

创建 `.env` 文件：
```env
# 生产环境配置
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:secure_password@localhost:27017/lovezs
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d
UPLOAD_PATH=/var/www/lovezs/uploads
MAX_FILE_SIZE=10485760
FRONTEND_URL=https://your-domain.com
```

## 📈 监控和维护

### 日志管理
```bash
# 查看应用日志
pm2 logs

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 查看MongoDB日志
sudo tail -f /var/log/mongodb/mongod.log
```

### 备份策略
```bash
# MongoDB备份
mongodump --db lovezs --out /var/backups/lovezs-$(date +%Y%m%d)

# 文件备份
tar -czf /var/backups/uploads-$(date +%Y%m%d).tar.gz /var/www/lovezs/uploads
```

### 性能优化
```bash
# 启用Gzip压缩
# 在Nginx配置中添加:
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# 设置缓存头
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🚨 故障排除

### 常见问题

1. **端口冲突**
```bash
# 检查端口占用
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :5000
```

2. **权限问题**
```bash
# 修复文件权限
sudo chown -R www-data:www-data /var/www/lovezs
sudo chmod -R 755 /var/www/lovezs
```

3. **内存不足**
```bash
# 检查内存使用
free -h
# 增加交换空间
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 🔄 更新部署

```bash
# 停止服务
pm2 stop all

# 拉取最新代码
cd /var/www/lovezs
git pull origin main

# 重新构建
cd backend
npm install
npm run build

cd ../frontend
npm install
npm run build

# 重启服务
pm2 restart all

# 重载Nginx
sudo systemctl reload nginx
```

## 📞 支持

如果您在部署过程中遇到问题，请：

1. 查看应用日志
2. 检查系统资源使用情况
3. 验证环境变量配置
4. 查看本文档的故障排除部分

---

**部署完成后，您的LoveZs应用将在 https://your-domain.com 上线！** 🎉