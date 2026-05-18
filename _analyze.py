from PIL import Image
from collections import Counter

path = r'C:\Users\86156\Desktop\info\下载 (1).jpg'
img = Image.open(path)
print(f'尺寸: {img.size[0]}x{img.size[1]}')
print(f'模式: {img.mode}')
print(f'格式: {img.format}')
print(f'文件大小: {img.fp and "N/A"}')

img_small = img.resize((50, 50))
pixels = list(img_small.getdata())
counter = Counter(pixels)
top5 = counter.most_common(5)
print('主色调 TOP5 (RGB):')
for color, count in top5:
    print(f'  {color} - {count}次')
