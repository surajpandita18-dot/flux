// ─────────────────────────────────────────────────────────
// Flux Beta Feedback Form — Google Apps Script
// Paste this entire file into: Sheet → Extensions → Apps Script
// Then: Deploy → New deployment → Web app → Anyone → Deploy
// Copy the Web app URL and share with beta users.
// ─────────────────────────────────────────────────────────

const SHEET_ID   = '1K7-ie9CHAjuGsBtIb3kTncY28yqCaAp7uTIuPcsmcqo';
const SHEET_NAME = 'Responses';

const HEADERS = [
  'Timestamp',
  'Frequency',
  'Last phase',
  'Card accuracy (1–5)',
  'Tried recommendations?',
  'What stopped logging?',
  'Most useful thing',
  'Expected but missing',
  'Would use in 3 months?',
  '#1 change',
  'Feature wishlist',
  'NPS (0–10)',
  'Final thoughts',
];

function doGet() {
  return HtmlService.createHtmlOutput(getFormHtml())
    .setTitle('Flux — Quick Feedback')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const ss    = SpreadsheetApp.openById(SHEET_ID);
    let   sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length)
           .setFontWeight('bold')
           .setBackground('#f3f4f6');
    }

    const p = e.parameter;
    sheet.appendRow([
      new Date().toISOString(),
      p.frequency  || '',
      p.phase      || '',
      p.accuracy   || '',
      p.tried      || '',
      p.stopped    || '',
      p.useful     || '',
      p.missing    || '',
      p.retention  || '',
      p.top_change || '',
      p.wishlist   || '',
      p.nps        || '',
      p.final      || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getFormHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Flux — Quick Feedback</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:#fafafa;color:#111;min-height:100vh;padding-bottom:60px}
header{background:#fff;border-bottom:1px solid #f0f0f0;padding:20px 24px 16px;position:sticky;top:0;z-index:10}
.logo{font-size:22px;font-weight:800;letter-spacing:-.5px}
.tagline{font-size:13px;color:#9ca3af;margin-top:3px}
.container{max-width:560px;margin:0 auto;padding:28px 20px}
.section{background:#fff;border-radius:20px;padding:24px;margin-bottom:14px;border:1px solid #f0f0f0}
.section-num{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#d1d5db;margin-bottom:6px}
.section-title{font-size:18px;font-weight:700;color:#111;margin-bottom:4px}
.section-sub{font-size:13px;color:#9ca3af;margin-bottom:20px;line-height:1.5}
.q-label{font-size:14px;font-weight:500;color:#374151;margin-bottom:10px;margin-top:22px;display:block}
.q-label:first-of-type{margin-top:0}
.q-optional{font-weight:400;color:#9ca3af}
.radio-group{display:flex;flex-direction:column;gap:8px}
.radio-option{display:flex;align-items:center;gap:10px;padding:13px 14px;border-radius:12px;border:1.5px solid #e5e7eb;cursor:pointer;transition:border-color .15s,background .15s;font-size:14px;color:#374151;line-height:1.4}
.radio-option:has(input:checked){border-color:#111;background:#f9fafb}
input[type=radio],input[type=checkbox]{accent-color:#111;width:16px;height:16px;flex-shrink:0}
textarea{width:100%;min-height:88px;border-radius:12px;border:1.5px solid #e5e7eb;padding:12px 14px;font-size:14px;font-family:inherit;color:#111;resize:vertical;outline:none;line-height:1.55;transition:border-color .15s}
textarea:focus{border-color:#111}
textarea::placeholder{color:#c4c4c4}
.scale-wrap{margin-top:6px}
.scale-row{display:flex;gap:5px}
.scale-btn{flex:1;height:44px;border-radius:10px;border:1.5px solid #e5e7eb;background:#fff;font-size:13px;font-weight:600;color:#6b7280;cursor:pointer;transition:all .15s}
.scale-btn.active{background:#111;color:#fff;border-color:#111}
.scale-labels{display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:#9ca3af}
.submit-wrap{margin-top:6px}
.submit-btn{width:100%;height:54px;background:#111;color:#fff;font-size:16px;font-weight:700;border:none;border-radius:16px;cursor:pointer;transition:opacity .15s}
.submit-btn:disabled{opacity:.4;cursor:not-allowed}
.submit-btn:hover:not(:disabled){opacity:.85}
.error-msg{color:#dc2626;font-size:13px;margin-top:10px;display:none;text-align:center}
.success{text-align:center;padding:80px 24px}
.success-icon{font-size:52px;margin-bottom:20px}
.success-title{font-size:26px;font-weight:800;margin-bottom:10px}
.success-body{font-size:15px;color:#6b7280;line-height:1.65}
@media(prefers-color-scheme:dark){
  body{background:#0f0f0f;color:#f9fafb}
  header{background:#111;border-color:#1f2937}
  .section{background:#111;border-color:#1f2937}
  .section-title{color:#f9fafb}
  .q-label{color:#d1d5db}
  .radio-option{border-color:#374151;color:#d1d5db}
  .radio-option:has(input:checked){border-color:#f9fafb;background:#1f2937}
  textarea{background:#0f0f0f;border-color:#374151;color:#f9fafb}
  textarea:focus{border-color:#f9fafb}
  .scale-btn{background:#111;border-color:#374151;color:#9ca3af}
  .scale-btn.active{background:#f9fafb;color:#111;border-color:#f9fafb}
  .submit-btn{background:#f9fafb;color:#111}
}
</style>
</head>
<body>
<header>
  <div class="logo">Flux</div>
  <div class="tagline">Beta feedback — 3 minutes, helps a lot.</div>
</header>

<div class="container" id="form-wrap">
<form id="form">

  <!-- Section 1 -->
  <div class="section">
    <div class="section-num">1 of 4</div>
    <div class="section-title">How you've been using it</div>
    <div class="section-sub">No right or wrong answers. Honest is more useful than polished.</div>

    <label class="q-label">How often do you open Flux?</label>
    <div class="radio-group">
      <label class="radio-option"><input type="radio" name="frequency" value="daily" required/> Every day</label>
      <label class="radio-option"><input type="radio" name="frequency" value="few_week"/> A few times a week</label>
      <label class="radio-option"><input type="radio" name="frequency" value="once_week"/> About once a week</label>
      <label class="radio-option"><input type="radio" name="frequency" value="rarely"/> Rarely / just tried it once</label>
    </div>

    <label class="q-label">Which phase were you in the last time you opened it?</label>
    <div class="radio-group">
      <label class="radio-option"><input type="radio" name="phase" value="menstrual"/> Rest Mode — period week</label>
      <label class="radio-option"><input type="radio" name="phase" value="follicular"/> Build Mode — week after period</label>
      <label class="radio-option"><input type="radio" name="phase" value="ovulation"/> Peak Mode — mid-cycle</label>
      <label class="radio-option"><input type="radio" name="phase" value="luteal"/> Protect Mode — week before period</label>
      <label class="radio-option"><input type="radio" name="phase" value="unsure"/> Not sure</label>
    </div>
  </div>

  <!-- Section 2 -->
  <div class="section">
    <div class="section-num">2 of 4</div>
    <div class="section-title">Did it actually help?</div>
    <div class="section-sub">Most important section for us.</div>

    <label class="q-label">How accurate did the phase card feel to how you were actually feeling?</label>
    <div class="scale-wrap">
      <div class="scale-row" id="accuracy-row">
        <button type="button" class="scale-btn" data-val="1" onclick="pick('accuracy',this)">1</button>
        <button type="button" class="scale-btn" data-val="2" onclick="pick('accuracy',this)">2</button>
        <button type="button" class="scale-btn" data-val="3" onclick="pick('accuracy',this)">3</button>
        <button type="button" class="scale-btn" data-val="4" onclick="pick('accuracy',this)">4</button>
        <button type="button" class="scale-btn" data-val="5" onclick="pick('accuracy',this)">5</button>
      </div>
      <div class="scale-labels"><span>Not at all</span><span>Spot on</span></div>
    </div>
    <input type="hidden" name="accuracy" id="accuracy-val"/>

    <label class="q-label">Did you try anything the app recommended — a food, a workout, anything?</label>
    <div class="radio-group">
      <label class="radio-option"><input type="radio" name="tried" value="yes_helped"/> Yes — and it helped</label>
      <label class="radio-option"><input type="radio" name="tried" value="yes_noticed"/> I noticed it but didn't act on it</label>
      <label class="radio-option"><input type="radio" name="tried" value="no_forgot"/> No, I forgot to check</label>
      <label class="radio-option"><input type="radio" name="tried" value="no_irrelevant"/> No, it didn't feel relevant</label>
    </div>

    <label class="q-label">Did you log your energy / mood? If not — what stopped you? <span class="q-optional">(optional)</span></label>
    <textarea name="stopped" placeholder="e.g. I forgot, it felt like too many steps, I didn't see the button..."></textarea>
  </div>

  <!-- Section 3 -->
  <div class="section">
    <div class="section-num">3 of 4</div>
    <div class="section-title">Honest reactions</div>
    <div class="section-sub">Skip any question you don't have a strong feeling on.</div>

    <label class="q-label">What's the most useful thing Flux has shown you so far? <span class="q-optional">(optional)</span></label>
    <textarea name="useful" placeholder="e.g. I didn't know caffeine made cramps worse, the mood card felt really validating..."></textarea>

    <label class="q-label">Is there something you expected the app to do that it doesn't? <span class="q-optional">(optional)</span></label>
    <textarea name="missing" placeholder="e.g. I wanted to track my period dates, I expected a calendar, reminders..."></textarea>

    <label class="q-label">Would you still be using Flux in 3 months? Why or why not? <span class="q-optional">(optional)</span></label>
    <textarea name="retention" placeholder="Be honest — even 'probably not' is the most helpful thing you can say."></textarea>
  </div>

  <!-- Section 4 -->
  <div class="section">
    <div class="section-num">4 of 4</div>
    <div class="section-title">Help us decide what to build</div>
    <div class="section-sub">These go directly into the product backlog. Your idea could be the next feature.</div>

    <label class="q-label">What's the #1 thing you'd add or change about Flux right now?</label>
    <textarea name="top_change" required style="min-height:100px" placeholder="Your honest #1 — not what you think we want to hear."></textarea>

    <label class="q-label">Any other features you wish existed? <span class="q-optional">(optional)</span></label>
    <textarea name="wishlist" placeholder="List as many as you want — reminders, partner feature, calendar sync, something else entirely..."></textarea>

    <label class="q-label">How likely are you to recommend Flux to a friend?</label>
    <div class="scale-wrap">
      <div class="scale-row" id="nps-row">
        <button type="button" class="scale-btn" data-val="0"  onclick="pick('nps',this)">0</button>
        <button type="button" class="scale-btn" data-val="1"  onclick="pick('nps',this)">1</button>
        <button type="button" class="scale-btn" data-val="2"  onclick="pick('nps',this)">2</button>
        <button type="button" class="scale-btn" data-val="3"  onclick="pick('nps',this)">3</button>
        <button type="button" class="scale-btn" data-val="4"  onclick="pick('nps',this)">4</button>
        <button type="button" class="scale-btn" data-val="5"  onclick="pick('nps',this)">5</button>
        <button type="button" class="scale-btn" data-val="6"  onclick="pick('nps',this)">6</button>
        <button type="button" class="scale-btn" data-val="7"  onclick="pick('nps',this)">7</button>
        <button type="button" class="scale-btn" data-val="8"  onclick="pick('nps',this)">8</button>
        <button type="button" class="scale-btn" data-val="9"  onclick="pick('nps',this)">9</button>
        <button type="button" class="scale-btn" data-val="10" onclick="pick('nps',this)">10</button>
      </div>
      <div class="scale-labels"><span>Not at all likely</span><span>Definitely</span></div>
    </div>
    <input type="hidden" name="nps" id="nps-val"/>

    <label class="q-label">Anything else you want to say? <span class="q-optional">(optional)</span></label>
    <textarea name="final" placeholder="Open floor — anything goes."></textarea>
  </div>

  <div class="submit-wrap">
    <button type="submit" class="submit-btn" id="submit-btn">Submit feedback</button>
    <div class="error-msg" id="err">Something went wrong. Please try again.</div>
  </div>

</form>
</div>

<div class="success" id="success" style="display:none">
  <div class="success-icon">💜</div>
  <div class="success-title">Thank you.</div>
  <div class="success-body">
    Your feedback goes directly to the people building Flux.<br>
    This genuinely helps us figure out what to build next.
  </div>
</div>

<script>
function pick(name, btn) {
  document.getElementById(name + '-row').querySelectorAll('.scale-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(name + '-val').value = btn.dataset.val;
}

document.getElementById('form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const err = document.getElementById('err');
  btn.disabled = true;
  btn.textContent = 'Submitting…';
  err.style.display = 'none';

  const params = new URLSearchParams(new FormData(this));
  try {
    const res  = await fetch(window.location.href, {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const json = await res.json();
    if (json.ok) {
      document.getElementById('form-wrap').style.display = 'none';
      document.getElementById('success').style.display   = 'block';
    } else {
      throw new Error(json.error || 'Server error');
    }
  } catch {
    btn.disabled    = false;
    btn.textContent = 'Submit feedback';
    err.style.display = 'block';
  }
});
</script>
</body>
</html>`;
}
