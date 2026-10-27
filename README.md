# 学信网证件号码脚本（Via 版）

## 下载

点下面链接，右上角「Download raw file」保存：

**https://github.com/xiqing21/chsi-id-script/raw/main/chsi-id-via.user.js**

国内加速（raw 打不开时用）：

**https://ghproxy.net/https://raw.githubusercontent.com/xiqing21/chsi-id-script/main/chsi-id-via.user.js**

**https://cdn.jsdelivr.net/gh/xiqing21/chsi-id-script@main/chsi-id-via.user.js**

## 安装（Via 浏览器）

1. 右下角 **≡** → 左滑一页 → **脚本**
2. 右上角 **＋** → **导入脚本**
3. 选 `chsi-id-via.user.js` → **确定**
4. 确认「启用脚本」和脚本条目开关都开启
5. Via 打开 `https://my.chsi.com.cn` 登录，进「学籍查询」→「高等教育信息」

号码显示为 `141024199806210052`，数字字形与「学制 4 年」等字段一致。

## 改自己的号

用文本编辑器打开脚本，改这一行：

```js
var NEW_ID = '141024199806210052';
```

## 只改显示

脚本改的是浏览器渲染，服务端数据不动。导出 PDF、申请报告拿到的仍是原号。

## 技术细节

完整推导过程、字体映射表、易混淆码位清单在私有仓库 `chsi-font-re`。
