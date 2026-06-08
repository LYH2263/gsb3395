# EDU SMART - 现代化学生管理系统

本系统是一个基于 SSM (Spring + SpringMVC + MyBatis) 后端架构与 Vite + React 前端框架构建的现代化教务管理平台。系统支持角色权限控制、学生档案管理、动态数据统计分析，并具备响应式设计与极致的视觉体验。

## 🛠 技术栈

- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts + Zustand
- **Backend**: Spring 5.3 + Spring MVC + MyBatis 3.5 + MySQL 8.0
- **Infrastructure**: Docker + Docker Compose + Nginx + Tomcat

## 📁 项目结构 (Project Structure)

```text
.
├── backend                 # 后端工程 (Spring + MyBatis)
│   ├── src/main/java       # Java 源代码
│   ├── src/main/resources  # 配置文件及 MyBatis Mapper XML
│   ├── Dockerfile          # 后端容器构建文件
│   └── pom.xml             # Maven 项目配置
├── frontend                # 前端工程 (React + Vite)
│   ├── src                 # 源代码 (组件、页面、API层、Store)
│   ├── tailwind.config.js  # Tailwind CSS 配置
│   ├── Dockerfile          # 前端容器构建文件
│   └── package.json        # Node.js 项目配置
├── docker-compose.yml      # 全局容器编排配置
├── run.sh                  # 一键启动脚本
└── package.sh              # 项目打包归档脚本
```

## 🚀 启动指南 (How to Run)

1. 确保已安装并启动 **Docker Desktop**。
2. 在项目根目录下执行以下命令：
   ```bash
   docker compose up --build
   ```
3. 等待容器构建并启动完成（通常需要 2-5 分钟进行 Maven 依赖下载和项目打包）。

## 🔗 服务地址 (Services)

- **前台展示 (Frontend)**: [http://localhost:33395](http://localhost:33395)
- **后台接口 (Backend)**: [http://localhost:13395/api](http://localhost:13395/api)
- **数据库 (Database)**: `localhost:3306` (用户: `root` / 密码: `root`)

## 🧪 测试账号

| 角色 | 用户名 | 密码 | 权限说明 |
| :--- | :--- | :--- | :--- |
| **管理员 (Admin)** | `admin` | `123456` | 紫色主题 |
| **教师 (Teacher)** | `teacher_wang` | `123456` | 绿色主题 |
| **学生 (Student)** | `student_zhang` | `123456` | 橙色主题 |

## ✅ 核心功能验证 (Verification)

1. **登录验证**: 使用 `admin` 登录，验证紫色主题侧边栏与管理功能。
2. **仪表盘**: 查看动态加载的班级人数分布图（柱状图）与性别比例（饼图）。
3. **学生列表**: 
   - 体验 **分页功能** (每页显示 5 条记录)。
   - 进行 **模糊检索**: 在搜索框输入“张”并按回车。
   - 实现 **条件检索**: 在下拉框中选择“计算机科学2024-1班”并筛选。
4. **编辑与详情**: 
   - 点击列表条目的 "Eye" 图标查看学生完整档案详情卡片。
   - 点击 "Edit" 图标修改电话号码，验证表单默认信息回显与保存 Toast 提示。
5. **添加学生**: 点击“添加学生”，故意留空必填项验证拦截，填写后验证列表动态刷新。

---

## 🎨 设计理念

本系统追求 **Premium** 视觉效果：
- **微交互**: 采用全场 Hover 反馈、加载骨架屏及丝滑的 Slide-up 入场动画。
- **现代化**: 彻底杜绝原生 `alert`，所有交互提示及加载均采用自定义声明式 UI 组件。
- **响应式**: 支持 PC 与平板端的优雅适配，确保各分区（导航、内容、图表）视觉对齐稳定。
