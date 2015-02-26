# Ice 简介

Ice 是一个 Gulp 的前端编译环境. 它通过启动一个轻量级的 http 服务(experss), 解析给定路径的 gulpfile 和 sub-gulpfile, 从而将 gulp 的 task 分析出来, 发送给前端(React)展示这些 task 并等待前端的编译消息.

Ice 可以被用于任何采用 Gulp 进行组织和编译的项目, 但现阶段他主要服务于 fireball 项目.

## 安装

```bash
git clone https://github.com/fireball-x/ice
bower install
npm install
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
