import markdown
import os

# 读取 markdown 文件
md_file = '新的时间系统设计.md'
with open(md_file, 'r', encoding='utf-8') as f:
    md_content = f.read()

# 转换为 HTML
html_content = markdown.markdown(md_content, extensions=['fenced_code', 'tables'])

# 创建完整的 HTML 文档
full_html = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>新的时间系统设计.md</title>
    <style>
        body {
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        h1 {
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
        }
        h2 {
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 5px;
            margin-top: 30px;
        }
        h3 {
            margin-top: 25px;
        }
        code {
            background-color: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: "SF Mono", Monaco, Consolas, monospace;
        }
        pre {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        pre code {
            background: none;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #4CAF50;
            padding-left: 15px;
            color: #666;
            margin: 20px 0;
        }
        ul, ol {
            padding-left: 25px;
        }
        li {
            margin: 5px 0;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #4CAF50;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
    </style>
</head>
<body>
''' + html_content + '''
</body>
</html>
'''

# 保存 HTML 文件
output_file = '新的时间系统设计.html'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(full_html)

print(f'HTML file created: {output_file}')
