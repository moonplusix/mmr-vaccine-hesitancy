# 信息流行病——疫苗犹豫

这是一个将静态数据海报改造成可交互网页的项目，主题为英国 MMR 疫苗争议、媒体报道与公共卫生背景。

- 在线网页：<https://moonplusix.github.io/mmr-vaccine-hesitancy/>
- 网页入口和静态资源：`dist/`
- 项目脚本与数据说明：`scripts/` 及根目录的资料文件

## 本地预览

安装 Python 3 后，在项目目录运行：

```powershell
python -m http.server 8000 --directory dist
```

然后打开 <http://localhost:8000>。

## 更新网页

网页源文件在 `dist/`。修改并检查后，将更新推送到 `main` 分支，GitHub Actions 会自动运行项目检查并发布 GitHub Pages：

```powershell
npm run check
git add dist README.md
git commit -m "Update interactive poster"
git push origin main
```

也可以在 GitHub 仓库的 **Actions** 页面手动运行 `Deploy GitHub Pages`。