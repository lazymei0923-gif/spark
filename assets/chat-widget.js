/* SPARK AI 浮動諮詢 widget — 共用元件
   使用：在頁面 </body> 前加 <script src="assets/chat-widget.js"></script>
   會自動注入 CSS + DOM + 互動行為
*/
(function(){
  if (document.getElementById('spark-chat-fab')) return; // 避免重複注入

  const css = `
    .spark-chat-fab {
      position: fixed; bottom: 28px; right: 28px;
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, #f08a43, #d55d24);
      color: #fff; border: none; cursor: pointer;
      display: grid; place-items: center;
      box-shadow: 0 10px 32px rgba(224,117,50,.45);
      z-index: 998; transition: transform .2s;
    }
    .spark-chat-fab:hover { transform: scale(1.08); }
    .spark-chat-fab::before {
      content: ""; position: absolute; inset: -8px;
      border: 2px solid #e07532; border-radius: 50%;
      opacity: .55; animation: sparkPing 2s infinite;
    }
    @keyframes sparkPing { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.55);opacity:0} }
    .spark-chat-fab.is-open::before { display: none; }

    .spark-chat-panel {
      position: fixed; bottom: 100px; right: 28px;
      width: 380px; max-width: calc(100vw - 40px);
      height: 560px; max-height: calc(100vh - 140px);
      background: #fff; border: 1px solid #E7DDD4;
      border-radius: 18px;
      box-shadow: 0 24px 60px rgba(31,31,31,.18);
      z-index: 999; overflow: hidden;
      display: flex; flex-direction: column;
      transform: translateY(20px) scale(.96); opacity: 0;
      pointer-events: none; transition: all .28s cubic-bezier(.4,0,.2,1);
      font-family: "Noto Sans TC", "Inter", sans-serif;
    }
    .spark-chat-panel.is-open {
      transform: translateY(0) scale(1); opacity: 1; pointer-events: auto;
    }
    .spark-chat-head {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 18px;
      background: linear-gradient(135deg, rgba(224,117,50,.16), rgba(224,117,50,.04));
      border-bottom: 1px solid #E7DDD4;
    }
    .spark-chat-head .ava {
      width: 38px; height: 38px; border-radius: 50%;
      background: linear-gradient(135deg, #f08a43, #d55d24);
      color: #fff; font-weight: 700;
      display: grid; place-items: center;
      box-shadow: 0 4px 12px rgba(224,117,50,.3);
    }
    .spark-chat-head .meta { flex: 1; }
    .spark-chat-head .meta b {
      display: block; font-size: 14px; font-weight: 700;
      letter-spacing: .1em; color: #1F1F1F;
    }
    .spark-chat-head .meta span {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 11px; color: #8B8178; letter-spacing: .06em; margin-top: 3px;
    }
    .spark-chat-head .meta span::before {
      content: ""; width: 7px; height: 7px; border-radius: 50%;
      background: #4ade80; box-shadow: 0 0 8px #4ade80;
    }
    .spark-chat-head .close {
      width: 28px; height: 28px; border-radius: 50%;
      border: none; background: rgba(31,31,31,.06);
      color: #1F1F1F; font-size: 18px; cursor: pointer;
      display: grid; place-items: center; line-height: 1;
    }
    .spark-chat-head .close:hover { background: rgba(31,31,31,.12); }

    .spark-chat-body {
      flex: 1; overflow-y: auto;
      padding: 18px;
      display: flex; flex-direction: column; gap: 12px;
      background: #F7F0E7;
      scroll-behavior: smooth;
    }
    .spark-chat-body .msg {
      display: flex; gap: 8px; max-width: 88%;
    }
    .spark-chat-body .msg.user { flex-direction: row-reverse; align-self: flex-end; }
    .spark-chat-body .msg .mini {
      width: 26px; height: 26px; border-radius: 50%;
      background: linear-gradient(135deg, #f08a43, #d55d24);
      color: #fff; font-size: 10px; font-weight: 700;
      display: grid; place-items: center;
      flex-shrink: 0; margin-top: 3px;
    }
    .spark-chat-body .msg.user .mini {
      background: #FFFFFF; color: #1F1F1F;
      border: 1px solid #E7DDD4;
    }
    .spark-chat-body .msg .bubble {
      padding: 10px 14px; border-radius: 14px;
      font-size: 13px; line-height: 1.7;
      letter-spacing: .03em; color: #1F1F1F;
    }
    .spark-chat-body .msg.bot .bubble {
      background: #FFFFFF; border: 1px solid #E7DDD4;
      border-top-left-radius: 4px;
    }
    .spark-chat-body .msg.user .bubble {
      background: linear-gradient(135deg, #f08a43, #d55d24);
      color: #fff; border-top-right-radius: 4px;
    }
    .spark-chat-body .quick {
      display: flex; flex-wrap: wrap; gap: 6px;
      padding-left: 34px; margin-top: -4px;
    }
    .spark-chat-body .quick button {
      padding: 7px 13px; border-radius: 999px;
      background: #FFFFFF; border: 1px solid rgba(224,117,50,.32);
      color: #C65F2B; font-family: inherit;
      font-size: 12px; letter-spacing: .04em; font-weight: 600;
      cursor: pointer; transition: all .18s;
    }
    .spark-chat-body .quick button:hover {
      background: rgba(224,117,50,.1);
      border-color: #E07532;
    }
    .spark-chat-body .typing {
      display: inline-flex; gap: 4px; padding: 6px 2px;
    }
    .spark-chat-body .typing span {
      width: 6px; height: 6px; border-radius: 50%;
      background: #8B8178; animation: sparkBlink 1.2s infinite ease-in-out;
    }
    .spark-chat-body .typing span:nth-child(2){ animation-delay: .2s }
    .spark-chat-body .typing span:nth-child(3){ animation-delay: .4s }
    @keyframes sparkBlink {
      0%,60%,100%{ opacity:.25; transform: translateY(0) }
      30%{ opacity:1; transform: translateY(-3px) }
    }

    .spark-chat-input {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 14px;
      border-top: 1px solid #E7DDD4;
      background: #fff;
    }
    .spark-chat-input input {
      flex: 1; height: 38px; padding: 0 14px;
      border-radius: 999px; border: 1px solid #D8C8BA;
      background: #F7F0E7; color: #1F1F1F;
      font-family: inherit; font-size: 12.5px;
      outline: none;
    }
    .spark-chat-input input:focus { border-color: #E07532; }
    .spark-chat-input .send {
      width: 38px; height: 38px; border-radius: 50%; border: none;
      background: linear-gradient(135deg, #f08a43, #d55d24);
      color: #fff; cursor: pointer;
      font-size: 16px; flex-shrink: 0;
      box-shadow: 0 3px 10px rgba(224,117,50,.4);
    }

    @media (max-width: 480px) {
      .spark-chat-panel { right: 16px; left: 16px; width: auto; bottom: 92px; height: 70vh; }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const fab = document.createElement('button');
  fab.id = 'spark-chat-fab';
  fab.className = 'spark-chat-fab';
  fab.setAttribute('aria-label', '開啟 AI 諮詢');
  fab.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M12 2C6.48 2 2 5.92 2 10.74c0 2.65 1.42 5.04 3.71 6.61L5 22l4.93-2.86c.66.16 1.36.27 2.07.27 5.52 0 10-3.92 10-8.74S17.52 2 12 2z"/></svg>';

  const panel = document.createElement('div');
  panel.id = 'spark-chat-panel';
  panel.className = 'spark-chat-panel';
  panel.innerHTML = `
    <header class="spark-chat-head">
      <div class="ava">✦</div>
      <div class="meta">
        <b>SPARK AI 諮詢助手</b>
        <span>線上・即時回覆</span>
      </div>
      <button class="close" aria-label="關閉">×</button>
    </header>
    <div class="spark-chat-body" id="spark-chat-body"></div>
    <div class="spark-chat-input">
      <input type="text" placeholder="輸入訊息或選擇上方選項…">
      <button class="send" aria-label="送出">→</button>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const body = panel.querySelector('#spark-chat-body');
  const closeBtn = panel.querySelector('.close');

  // 隱藏原本頁面內的舊版 chat-fab（如有）
  document.querySelectorAll('.chat-fab').forEach(el => {
    if (el !== fab) el.style.display = 'none';
  });

  function open() {
    panel.classList.add('is-open');
    fab.classList.add('is-open');
    if (!body.dataset.started) {
      body.dataset.started = '1';
      startConversation();
    }
  }
  function close() {
    panel.classList.remove('is-open');
    fab.classList.remove('is-open');
  }
  fab.addEventListener('click', () => panel.classList.contains('is-open') ? close() : open());
  closeBtn.addEventListener('click', close);

  // ===== 對話腳本 =====
  function appendBot(html) {
    const msg = document.createElement('div');
    msg.className = 'msg bot';
    msg.innerHTML = `<div class="mini">AI</div><div class="bubble">${html}</div>`;
    body.appendChild(msg);
    scrollBottom();
    return msg;
  }
  function appendUser(text) {
    const msg = document.createElement('div');
    msg.className = 'msg user';
    msg.innerHTML = `<div class="mini">你</div><div class="bubble">${escapeHtml(text)}</div>`;
    body.appendChild(msg);
    scrollBottom();
  }
  function appendQuick(options, onPick) {
    const wrap = document.createElement('div');
    wrap.className = 'quick';
    options.forEach(opt => {
      const b = document.createElement('button');
      b.textContent = opt;
      b.addEventListener('click', () => {
        wrap.remove();
        appendUser(opt);
        onPick(opt);
      });
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
    scrollBottom();
  }
  function appendTyping() {
    const msg = document.createElement('div');
    msg.className = 'msg bot';
    msg.innerHTML = '<div class="mini">AI</div><div class="bubble"><span class="typing"><span></span><span></span><span></span></span></div>';
    body.appendChild(msg);
    scrollBottom();
    return msg;
  }
  function scrollBottom() {
    body.scrollTop = body.scrollHeight;
  }
  function escapeHtml(s) { return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function botSay(html, after = 700) {
    const t = appendTyping();
    await delay(900);
    t.remove();
    appendBot(html);
    await delay(after);
  }

  async function startConversation() {
    await delay(400);
    await botSay('嗨，我是 SPARK AI 👋<br>火花整合行銷的智能諮詢助手。<br>請問你今天想了解哪個服務？', 200);
    appendQuick(
      ['想做品牌設計 / CIS', '想做短影音 + 廣告', '想看看實際案例'],
      step1
    );
  }
  async function step1(pick) {
    await delay(500);
    let nextMsg, opts;
    if (pick.includes('品牌')) {
      nextMsg = '收到 ✓ 品牌設計是我們最常被詢問的入口。<br>請問你目前的品牌處於哪個階段？';
      opts = ['完全還沒開始', '有 logo 但想重新整理', '想加做網站／包裝'];
    } else if (pick.includes('短影音')) {
      nextMsg = '短影音是這兩年回報最高的選項。<br>你目前的廣告預算大約落在哪個區間？';
      opts = ['月預算 5 萬內', '月預算 5-20 萬', '月預算 20 萬以上'];
    } else {
      nextMsg = '我們最近完成的代表作是 Velireo Skin 美業品牌。<br>從零做到 ROAS 4.6x，要看完整案例嗎？';
      opts = ['看完整案例', '看其他產業', '想跟顧問聊聊'];
    }
    await botSay(nextMsg, 200);
    appendQuick(opts, step2);
  }
  async function step2() {
    await delay(500);
    await botSay('好的 ✓ 為了讓顧問準備最適合你的方案，<br>方便先留下聯絡方式嗎？', 200);
    appendQuick(['好，留 LINE', '好，留 Email', '想再看看'], step3);
  }
  async function step3() {
    await delay(500);
    await botSay('太好了 🎉 顧問會在 1 個工作日內聯繫你。<br>同時你也可以先看看 <b style="color:#E07532;">完整案例</b> 或 <b style="color:#E07532;">合作流程</b>。', 0);
  }
})();
