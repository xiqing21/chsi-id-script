// ==UserScript==
// @name         学信网 - 仅改证件号码（Via版·字体一致）
// @namespace    local.chsi.via
// @version      1.5.0
// @description  证件号码替换为指定号码，保留 Chsi 原字体，字形与相邻字段完全一致
// @creator      local
// @match        *://my.chsi.com.cn/*
// @match        *://www.chsi.com.cn/*
// @match        *://account.chsi.com.cn/*
// @match        *://*.chsi.com.cn/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a, u = !0; return { s: function s() { t = t.call(r); }, n: function n() { u = !0; var r = t.next(); return r.done ? { done: !0 } : { value: r.value, done: u = !1 }; }, e: function e(r) { o = !0, a = r; }, f: function f() { try { u || null == t.return || t.return(); } finally { if (o) throw a; } } }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { var e = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (Array.isArray(r) && (null == e || e === ("undefined" != typeof Symbol && [][Symbol.iterator]) || e === []["@@iterator"])) return r; if (null != e) { for (var t, o = [], a = e.call(r); !(t = a.next()).done;) o.push(t.value); return o; } }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
(function () {
  'use strict';

  // ========== 只改这里 ==========
  var NEW_ID = '141024199806210052';
  // ==============================

  // ===== 数字 → Chsi 字体码位映射（逐字渲染核对 f0 分片）=====
  var DIGIT_CP = {
    '0': 0x109418,
    '1': 0x1062CC,
    '2': 0x104F38,
    '3': 0x106009,
    '4': 0x108CE8,
    '5': 0x1092CF,
    '6': 0x103E60,
    '7': 0x108227,
    '8': 0x107CDA,
    '9': 0x105730
  };
  function encodeToChsi(plain) {
    var out = '';
    for (var i = 0; i < plain.length; i++) {
      var c = plain.charAt(i);
      var cp = DIGIT_CP[c];
      out += cp ? String.fromCodePoint(cp) : c;
    }
    return out;
  }
  var MARK = 'data-chsi-id-patched';
  var LABEL_RE = /^\s*证件号码\s*[:：]?\s*$/;
  var LABEL_IN_TEXT_RE = /证件号码\s*[:：]/;
  var VALUE_STYLE = {
    fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
    fontSize: '14px',
    fontWeight: '400',
    letterSpacing: 'normal',
    color: '#333',
    whiteSpace: 'nowrap'
  };
  function applyStyle(el) {
    // 不再覆盖字体，保留页面原来的 Chsi 字体
    el.style.letterSpacing = 'normal';
    el.style.whiteSpace = 'nowrap';
  }
  function setValueNode(node, value) {
    var _node$getAttribute;
    if (!node || ((_node$getAttribute = node.getAttribute) === null || _node$getAttribute === void 0 ? void 0 : _node$getAttribute.call(node, MARK)) === value) return;
    // 保留原字体（Chsi），只把明文编码成对应码位，字形与旁边字段一致
    while (node.firstChild) node.removeChild(node.firstChild);
    node.textContent = encodeToChsi(value);
    node.setAttribute(MARK, value);
  }

  /** 从「证件号码：」标签节点，定位同一行的值节点 */
  function findValueBesideLabel(labelEl) {
    // 1) 同级下一个兄弟
    var sib = labelEl.nextElementSibling;
    if (sib) return sib;

    // 2) 父级下第二个子元素（常见：li > .xx-lable + .xx-info）
    var parent = labelEl.parentElement;
    if (parent) {
      var kids = _toConsumableArray(parent.children).filter(function (c) {
        return c !== labelEl;
      });
      if (kids.length === 1) return kids[0];
      // 标签后的第一个元素
      var idx = _toConsumableArray(parent.children).indexOf(labelEl);
      if (idx >= 0 && parent.children[idx + 1]) return parent.children[idx + 1];
    }

    // 3) 标签内同时带了值：证件号码：XXXX
    if (LABEL_IN_TEXT_RE.test(labelEl.textContent || '') && !LABEL_RE.test(labelEl.textContent || '')) {
      return labelEl;
    }
    return null;
  }

  /** 处理「整段文本在一个节点」的情况：证件号码：PUA… */
  function patchInlineLabelValue(el) {
    var _el$querySelector;
    var text = el.textContent || '';
    if (!LABEL_IN_TEXT_RE.test(text)) return false;
    // 已经是目标号则跳过
    if (text.includes(NEW_ID) && el.getAttribute(MARK) === NEW_ID) return true;

    // 只动最小叶子：若子元素里有单独 label，交给其它逻辑
    if ((_el$querySelector = el.querySelector) !== null && _el$querySelector !== void 0 && _el$querySelector.call(el, '.xx-lable, .xx-label, [class*="lable"], [class*="label"]')) {
      return false;
    }

    // 重建为：证件号码： + 新号
    el.textContent = '';
    var label = document.createTextNode('证件号码：');
    var span = document.createElement('span');
    span.textContent = encodeToChsi(NEW_ID);
    applyStyle(span);
    span.setAttribute(MARK, NEW_ID);
    el.appendChild(label);
    el.appendChild(span);
    el.setAttribute(MARK, NEW_ID);
    return true;
  }
  function patchOnce() {
    // —— 路径 A：独立标签 .xx-lable / 含「证件号码」的短节点 ——
    var candidates = document.querySelectorAll('div, span, dt, th, label, li, dd, p, td');
    var _iterator = _createForOfIteratorHelper(candidates),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var el = _step.value;
        // 跳过过大容器，避免误伤整块布局
        if (el.children.length > 8) continue;
        var raw = (el.textContent || '').trim();
        if (!raw || raw.length > 40) continue;

        // 纯标签：证件号码：
        if (LABEL_RE.test(raw) || raw === '证件号码' || raw === '证件号码：' || raw === '证件号码:') {
          var _valueEl$parentElemen;
          var valueEl = findValueBesideLabel(el);
          if (!valueEl) continue;

          // 关键：绝不改「学校名称」等其它字段
          var parentText = ((_valueEl$parentElemen = valueEl.parentElement) === null || _valueEl$parentElemen === void 0 ? void 0 : _valueEl$parentElemen.textContent) || '';
          // 值节点若自己看起来像学校标签则跳过
          if (/学校名称|专业|姓名|民族|层次/.test(valueEl.className || '')) continue;

          // 若值节点其实是另一个字段的容器，只改文本节点/最内层
          if (valueEl.children.length === 0) {
            setValueNode(valueEl, NEW_ID);
          } else {
            // 找最内层纯文本子节点
            var leaf = valueEl.querySelector('[class*="value"], [class*="info"], span, em, i') || valueEl;
            // 若 leaf 文本很短或含 PUA / 数字，才替换
            var t = leaf.textContent || '';
            var hasPua = /[\uE000-\uF8FF]/.test(t);
            var looksLikeId = /^\s*[\d\uE000-\uF8FF]{10,}\s*$/.test(t) || hasPua || t.length < 30;
            if (looksLikeId) setValueNode(leaf, NEW_ID);
          }
          continue;
        }
      }

      // —— 路径 B：li 整行「证件号码：xxx」 ——
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    document.querySelectorAll('li, .xj-m-r li, .xl-m-r li, dd').forEach(function (li) {
      var t = (li.textContent || '').trim();
      if (!t.startsWith('证件号码') && !t.includes('证件号码')) return;
      // 排除 modal 说明文案
      if (t.length > 80) return;
      if (/系统没有找到|注册时填写/.test(t)) return;

      // li 内有独立 label
      var label = _toConsumableArray(li.querySelectorAll('div, span, label')).find(function (n) {
        return LABEL_RE.test((n.textContent || '').trim());
      });
      if (label) {
        var valueEl = findValueBesideLabel(label);
        if (valueEl && valueEl !== label) {
          setValueNode(valueEl.children.length ? valueEl.querySelector('span,em,i') || valueEl : valueEl, NEW_ID);
          return;
        }
      }

      // 整行内联
      if (li.children.length <= 2) {
        patchInlineLabelValue(li);
      }
    });

    // —— 路径 C：兜底，按 .xx-lable 精确匹配（学信网常用 class） ——
    document.querySelectorAll('.xx-lable, .xx-label, .xxLable').forEach(function (lab) {
      if (!/证件号码/.test(lab.textContent || '')) return;
      var valueEl = findValueBesideLabel(lab);
      if (valueEl) setValueNode(valueEl, NEW_ID);
    });
  }

  // 防抖，避免 MutationObserver 刷屏
  var timer = 0;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(patchOnce, 80);
  }
  patchOnce();
  // SPA / 异步渲染
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });

  // 再补几次，等字体/接口渲染完
  [300, 800, 1500, 3000].forEach(function (ms) {
    return setTimeout(patchOnce, ms);
  });

  // 控制台自检
  console.log('[chsi-id] ready, NEW_ID =', NEW_ID);
})();