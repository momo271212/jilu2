# Markdown 文档浏览器

## 文件信息

**文件名**: 新的时间系统设计.html
**原始文件**: 新的时间系统设计.md
**位置**: C:\Users\lenovo\Desktop\记录软件

## 打开方式

### 1. 本地文件（已自动打开）
```
file:///C:/Users/lenovo/Desktop/记录软件/新的时间系统设计.html
```

### 2. 手动打开

**方法 A：双击文件**
- 打开文件夹 `C:\Users\lenovo\Desktop\记录软件`
- 双击 `新的时间系统设计.html`

**方法 B：右键菜单**
- 右键点击文件
- 选择 "打开方式" → "Google Chrome" 或 "Microsoft Edge"

**方法 C：命令行**
```bash
cd "C:\Users\lenovo\Desktop\记录软件"
start 新的时间系统设计.html
```

### 3. 如果浏览器没有自动打开

尝试以下方法：

**Windows PowerShell**:
```powershell
Start-Process "C:\Users\lenovo\Desktop\记录软件\新的时间系统设计.html"
```

**Windows CMD**:
```cmd
start "" "C:\Users\lenovo\Desktop\记录软件\新的时间系统设计.html"
```

## 文档内容概览

### 主题：新的时间系统设计

**核心概念：**
1. **复习间隔时间** - 叶子变黄时间（全局设置）
   - 慢慢来：2小时
   - 适中：1小时
   - 冲刺：30分钟

2. **背诵倒计时时间** - 单次背诵持续时间（每次独立设置）
   - 15分钟、25分钟、45分钟
   - 或自定义分钟+秒

**设计优势：**
- ✅ 概念清晰：两种时间各司其职
- ✅ 使用简单：添加背诵项时不需要考虑时间
- ✅ 灵活倒计时：每次可以设置不同的背诵时长
- ✅ 不强制完成：时间到后暂停，尊重用户实际完成情况

## 文件大小

- **Markdown**: 约 3.5 KB
- **HTML**: 约 5.7 KB

## 下一步

如果需要打开其他 Markdown 文件，可以运行：

```bash
cd "C:\Users\lenovo\Desktop\记录软件"
python convert_md_to_html.py
```

然后手动打开生成的 HTML 文件。
