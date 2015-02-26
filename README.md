# Ice (gulp build bot)

Ice 是一个 Gulp 的前端编译环境.

## 安装

```bash
bower install .
npm install .
```

## 运行

```bash
# ${your.fireball.dir} 替换为你的路径, 可以使相对路径或者绝对路径
node ice.js -r --path ${your.fireball.dir}
```

之后在 Chrome 页面打开 http://localhost:5050/

## 开发

```bash
# ${your.fireball.dir} 替换为你的路径, 可以使相对路径或者绝对路径
nodemon --watch ice.js ice.js -r --path ${your.fireball.dir}
```
