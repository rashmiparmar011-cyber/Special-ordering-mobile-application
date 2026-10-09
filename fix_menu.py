import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Replace menu structure wrapper
content = content.replace(
    '<div style="display: flex; flex-direction: column; gap: 12px;">',
    '<div style="display: flex; flex-direction: column; background: white; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;">'
)

# Replace menu item styles
content = content.replace(
    'style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 16px; background: white; border-radius: 12px; border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.04); cursor: pointer;"',
    'style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 16px; background: transparent; border: none; border-bottom: 1px solid #f1f5f9; cursor: pointer;"'
)

# Replace icon backgrounds
content = content.replace(
    'style="width: 32px; height: 32px; background: transparent; color: #3b82f6;',
    'style="width: 32px; height: 32px; background: #3b82f6; border-radius: 8px; color: white;'
)
content = content.replace(
    'style="width: 32px; height: 32px; background: transparent; color: #f97316;',
    'style="width: 32px; height: 32px; background: #f97316; border-radius: 8px; color: white;'
)
content = content.replace(
    'style="width: 32px; height: 32px; background: transparent; color: #22c55e;',
    'style="width: 32px; height: 32px; background: #22c55e; border-radius: 8px; color: white;'
)
content = content.replace(
    'style="width: 32px; height: 32px; background: transparent; color: #a855f7;',
    'style="width: 32px; height: 32px; background: #a855f7; border-radius: 8px; color: white;'
)
content = content.replace(
    'style="width: 32px; height: 32px; background: transparent; color: #ef4444;',
    'style="width: 32px; height: 32px; background: #ef4444; border-radius: 8px; color: white;'
)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
