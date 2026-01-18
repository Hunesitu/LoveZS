# LoveZs - 情侣日记网站

一个专为情侣设计的温馨浪漫的个人网站，用于记录日常生活点滴、保存美好回忆。

## ✨ 功能特性

### 🏠 核心功能
- **日记记录系统** - 支持富文本编辑、情绪标签、日期标记和分类管理
- **相册管理** - 照片上传、相册创建、时间轴浏览
- **倒计时提醒** - 纪念日、生日等重要日期提醒
- **数据安全** - 用户认证、数据备份与导出

### 🎨 设计特色
- 温馨浪漫的UI设计，采用柔和的色彩搭配
- 完全响应式，支持桌面端和移动端
- 直观易用的操作界面
- Markdown编辑器支持

## 🚀 快速开始

### 环境要求
- Node.js 18+
- MongoDB 5.0+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd LoveZs
```

2. **安装后端依赖**
```bash
cd backend
npm install
```

3. **安装前端依赖**
```bash
cd ../frontend
npm install
```

4. **配置环境变量**

复制后端环境配置文件：
```bash
cd backend
cp env.example .env
```

编辑 `.env` 文件，设置数据库连接和其他配置：
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lovezs
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=10485760
FRONTEND_URL=http://localhost:3000
```

5. **启动MongoDB服务**
确保MongoDB服务正在运行。

6. **启动后端服务器**
```bash
cd backend
npm run dev
```
服务器将在 http://localhost:5000 启动

7. **启动前端服务器**
```bash
cd frontend
npm start
```
前端将在 http://localhost:3000 启动

## 📁 项目结构

```
LoveZs/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由
│   │   ├── middleware/     # 中间件
│   │   ├── config/         # 配置
│   │   └── types/          # 类型定义
│   ├── uploads/            # 文件上传目录
│   └── package.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API服务
│   │   ├── contexts/       # React上下文
│   │   └── utils/          # 工具函数
│   ├── public/             # 静态资源
│   └── package.json
├── docker/                 # Docker配置
└── docs/                   # 文档
```

## 🛠️ 技术栈

### 后端
- **Node.js** - JavaScript运行时
- **Express.js** - Web框架
- **TypeScript** - 类型安全
- **MongoDB** - 文档数据库
- **Mongoose** - MongoDB对象建模
- **JWT** - 用户认证
- **bcrypt** - 密码加密
- **Multer** - 文件上传

### 前端
- **React 18** - 用户界面库
- **TypeScript** - 类型安全
- **Tailwind CSS** - 实用优先的CSS框架
- **React Router** - 路由管理
- **Axios** - HTTP客户端
- **@uiw/react-md-editor** - Markdown编辑器
- **Lucide React** - 图标库
- **Day.js** - 日期处理

## 🔧 API文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `PUT /api/auth/change-password` - 修改密码

### 日记相关
- `GET /api/diaries` - 获取日记列表
- `POST /api/diaries` - 创建日记
- `GET /api/diaries/:id` - 获取单篇日记
- `PUT /api/diaries/:id` - 更新日记
- `DELETE /api/diaries/:id` - 删除日记
- `GET /api/diaries/meta/categories` - 获取分类列表
- `GET /api/diaries/meta/tags` - 获取标签列表

## 🎯 使用指南

1. **注册账户** - 首次使用需要注册账户
2. **写日记** - 在日记页面创建新的日记记录
3. **添加照片** - 上传照片并创建相册
4. **设置倒计时** - 添加重要日期提醒
5. **数据导出** - 定期备份重要数据

## 🚀 部署说明

### 开发环境
项目已配置为支持热重载的开发环境。

### 生产环境
1. 构建前端应用：
```bash
cd frontend
npm run build
```

2. 构建后端应用：
```bash
cd backend
npm run build
```

3. 配置生产环境的MongoDB数据库
4. 设置环境变量
5. 使用PM2或Docker部署应用

## 🤝 贡献指南

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目贡献的人，特别感谢那些在开源社区中分享知识的人们。

---

**LoveZs** - 让每一刻都成为永恒的回忆 ✨