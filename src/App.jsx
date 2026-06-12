import React, { useState, useEffect, useMemo, useRef } from "react";
import { storage } from "./storage.js";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend,
} from "recharts";

/* ─────────────────────────────────────────────
   마음 가계부 · Mind Ledger v2
   인지심리학 원리를 설계에 반영한 입출금 앱
   1) 손실 회피: "남은 돈" 중심 프레이밍
   2) 멘탈 어카운팅: 카테고리 봉투 예산
   3) 마찰 최소화: 3초 빠른 입력 + 즉각 피드백
   4) 청킹: 한 문장 인사이트로 분석 요약
   5) 목표 구배: 저축 목표 진행률 시각화
   6) 공정 비교: 지난달 "같은 날짜까지" 비교
───────────────────────────────────────────── */

const EXPENSE_CATS = [
  { id: "food", label: "식비", emoji: "🍚", color: "#C4554D" },
  { id: "cafe", label: "카페·간식", emoji: "☕", color: "#D98E48" },
  { id: "transport", label: "교통", emoji: "🚌", color: "#3F7CAC" },
  { id: "shopping", label: "쇼핑", emoji: "🛍️", color: "#9A6FB0" },
  { id: "housing", label: "주거·공과금", emoji: "🏠", color: "#5B8C5A" },
  { id: "leisure", label: "문화·여가", emoji: "🎬", color: "#E0A526" },
  { id: "health", label: "의료·건강", emoji: "💊", color: "#4FA3A5" },
  { id: "etc", label: "기타", emoji: "📦", color: "#8A8F98" },
];
const INCOME_CATS = [
  { id: "salary", label: "급여", emoji: "💼", color: "#1B6E53" },
  { id: "side", label: "부수입", emoji: "🌱", color: "#3F8F6B" },
  { id: "allowance", label: "용돈", emoji: "🎁", color: "#6BAF92" },
  { id: "etc_in", label: "기타수입", emoji: "✨", color: "#8A8F98" },
];
const ALL_CATS = [...EXPENSE_CATS, ...INCOME_CATS];
const catOf = (id) =>
  ALL_CATS.find((c) => c.id === id) || { id, label: id, emoji: "❓", color: "#999" };
const catByLabel = (s, type) => {
  const pool = type === "income" ? INCOME_CATS : EXPENSE_CATS;
  return (
    pool.find((c) => c.id === s || c.label === s) ||
    ALL_CATS.find((c) => c.id === s || c.label === s) ||
    (type === "income" ? INCOME_CATS[3] : EXPENSE_CATS[7])
  );
};

const KRW = (n) => "₩" + Math.round(Math.abs(n)).toLocaleString("ko-KR");
const signedKRW = (n) => (n < 0 ? "−" : "+") + KRW(n);

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const monthKey = (iso) => iso.slice(0, 7);
const daysInMonth = (y, m) => new Date(y, m, 0).getDate();
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const STORAGE_KEY = "mind-ledger:v1"; // localStorage 키
const DEFAULT_DATA = {
  transactions: [],
  budget: { total: 1000000, perCat: {} },
  goal: { amount: 0 }, // 월 저축 목표
};

/* ══════════ CSV 유틸 ══════════ */
const csvEscape = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;

function txsToCSV(txs) {
  const header = "date,type,category,amount,memo";
  const rows = [...txs]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((t) =>
      [t.date, t.type, csvEscape(catOf(t.category).label), t.amount, csvEscape(t.memo || "")].join(",")
    );
  return "\uFEFF" + [header, ...rows].join("\n"); // BOM: 엑셀 한글 깨짐 방지
}

// 따옴표를 처리하는 한 줄 CSV 파서
function parseCSVLine(line) {
  const out = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ",") { out.push(cur); cur = ""; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseCSV(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  const result = { txs: [], skipped: 0 };
  for (const line of lines) {
    const cols = parseCSVLine(line);
    if (cols.length < 4) { result.skipped++; continue; }
    const [dateRaw, typeRaw, catRaw, amtRaw, memoRaw = ""] = cols;
    if (/date|날짜/i.test(dateRaw)) continue; // 헤더
    const date = dateRaw.replace(/[./]/g, "-").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { result.skipped++; continue; }
    const type =
      /^(income|수입|입금)$/i.test(typeRaw) ? "income" :
      /^(expense|지출|출금)$/i.test(typeRaw) ? "expense" : null;
    if (!type) { result.skipped++; continue; }
    const amount = Math.abs(parseInt(String(amtRaw).replace(/[^\d-]/g, ""), 10));
    if (!amount) { result.skipped++; continue; }
    result.txs.push({
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      date, type, amount,
      category: catByLabel(catRaw, type).id,
      memo: memoRaw,
    });
  }
  return result;
}

export default function MindLedger() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("home");
  const [saveState, setSaveState] = useState("idle");
  const [flash, setFlash] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const flashTimer = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await storage.get(STORAGE_KEY);
        const parsed = r ? JSON.parse(r.value) : DEFAULT_DATA;
        setData({ ...DEFAULT_DATA, ...parsed, goal: { ...DEFAULT_DATA.goal, ...(parsed.goal || {}) } });
      } catch {
        setData(DEFAULT_DATA);
      }
    })();
  }, []);

  const persist = async (next) => {
    setData(next);
    setSaveState("saving");
    try {
      await storage.set(STORAGE_KEY, JSON.stringify(next));
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1200);
    } catch {
      setSaveState("error");
    }
  };

  const showFlash = (msg, tone = "expense") => {
    clearTimeout(flashTimer.current);
    setFlash({ msg, tone });
    flashTimer.current = setTimeout(() => setFlash(null), 2600);
  };

  const calcMonth = (d) => {
    const mk = monthKey(todayISO());
    const txs = d.transactions.filter((t) => monthKey(t.date) === mk);
    const spent = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const remaining = d.budget.total - spent;
    const now = new Date();
    const dim = daysInMonth(now.getFullYear(), now.getMonth() + 1);
    const daysLeft = dim - now.getDate() + 1;
    return { txs, spent, income, remaining, daysLeft, dim, mk };
  };

  const addTx = (tx) => {
    const next = { ...data, transactions: [tx, ...data.transactions] };
    persist(next);
    const remain = calcMonth(next).remaining;
    showFlash(
      tx.type === "expense"
        ? `−${KRW(tx.amount)} 기록됨 · 이번 달 남은 돈 ${KRW(Math.max(remain, 0))}`
        : `+${KRW(tx.amount)} 들어옴 · 잘 챙겼어요`,
      tx.type
    );
  };
  const removeTx = (id) =>
    persist({ ...data, transactions: data.transactions.filter((t) => t.id !== id) });
  const setBudget = (budget) => persist({ ...data, budget });
  const setGoal = (goal) => persist({ ...data, goal });

  /* ── CSV 내보내기/가져오기 ── */
  const exportCSV = () => {
    if (data.transactions.length === 0) { showFlash("내보낼 기록이 없어요"); return; }
    const blob = new Blob([txsToCSV(data.transactions)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `마음가계부_${todayISO()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showFlash(`${data.transactions.length}건 CSV로 내보냈어요`, "income");
  };

  const importCSV = (file, mode) => {
    const reader = new FileReader();
    reader.onload = () => {
      const { txs, skipped } = parseCSV(String(reader.result || ""));
      if (txs.length === 0) {
        showFlash(`가져올 수 있는 행이 없어요${skipped ? ` (${skipped}행 건너뜀)` : ""}`);
        return;
      }
      const base = mode === "replace" ? [] : data.transactions;
      persist({ ...data, transactions: [...txs, ...base] });
      showFlash(
        `${txs.length}건 가져옴${skipped ? ` · ${skipped}행 건너뜀` : ""}${mode === "replace" ? " (기존 기록 대체)" : ""}`,
        "income"
      );
    };
    reader.onerror = () => showFlash("파일을 읽지 못했어요");
    reader.readAsText(file, "utf-8");
  };

  if (!data)
    return (
      <div className="ml-root">
        <Style />
        <div className="ml-loading">장부를 펼치는 중…</div>
      </div>
    );

  const M = calcMonth(data);

  return (
    <div className="ml-root">
      <Style />
      <header className="ml-header">
        <div>
          <h1 className="ml-title">마음 가계부</h1>
          <p className="ml-sub">덜 쓰게 만드는 건 의지가 아니라 설계예요</p>
        </div>
        <div className="ml-header-right">
          <span className={`ml-save ml-save-${saveState}`}>
            {saveState === "saving" ? "저장 중" : saveState === "saved" ? "저장됨 ✓" : saveState === "error" ? "저장 실패" : ""}
          </span>
          <button className="ml-gear" aria-label="설정" title="설정"
            onClick={() => setSettingsOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3.2" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01A1.7 1.7 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01A1.7 1.7 0 0 0 20.91 10H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" />
            </svg>
          </button>
        </div>
      </header>

      {flash && <div className={`ml-flash ml-flash-${flash.tone}`}>{flash.msg}</div>}

      <nav className="ml-tabs" role="tablist">
        {[["home", "오늘"], ["history", "내역"], ["insight", "분석"]].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id}
            className={`ml-tab ${tab === id ? "on" : ""}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      {tab === "home" && (
        <Home M={M} data={data} addTx={addTx} setBudget={setBudget} setGoal={setGoal} />
      )}
      {tab === "history" && <History data={data} removeTx={removeTx} />}
      {tab === "insight" && <Insight data={data} M={M} />}

      {settingsOpen && (
        <SettingsSheet
          onClose={() => setSettingsOpen(false)}
          exportCSV={exportCSV}
          importCSV={importCSV}
          txCount={data.transactions.length}
          clearAll={() => persist({ ...data, transactions: [] })}
        />
      )}

      <footer className="ml-foot">데이터는 이 기기의 브라우저에만 저장됩니다 · 백업은 ⚙ → CSV 내보내기</footer>
    </div>
  );
}

/* ══════════ 오늘(홈) ══════════ */
function Home({ M, data, addTx, setBudget, setGoal }) {
  const dailyAllow = M.remaining > 0 ? Math.floor(M.remaining / M.daysLeft) : 0;
  const ratio = Math.min(Math.max(M.remaining / (data.budget.total || 1), 0), 1);
  const danger = ratio < 0.2;

  const todaySpent = M.txs
    .filter((t) => t.type === "expense" && t.date === todayISO())
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="ml-stack">
      <section className={`ml-hero ${danger ? "danger" : ""}`}>
        <span className="ml-eyebrow">이번 달 남은 돈</span>
        <div className="ml-big">
          {M.remaining >= 0 ? KRW(M.remaining) : `−${KRW(M.remaining)}`}
        </div>
        <div className="ml-gauge" aria-hidden="true">
          <div className="ml-gauge-fill" style={{ width: `${ratio * 100}%` }} />
        </div>
        <div className="ml-hero-row">
          <span>예산 {KRW(data.budget.total)}</span>
          <span>지출 {KRW(M.spent)}</span>
          <span>{M.daysLeft}일 남음</span>
        </div>
        <div className="ml-daily">
          <strong>하루 {KRW(dailyAllow)}</strong>씩 쓸 수 있어요
          {todaySpent > 0 && (
            <span className={todaySpent > dailyAllow ? "over" : "ok"}>
              {" · 오늘 "}{KRW(todaySpent)}
              {todaySpent > dailyAllow ? " (오늘치 초과)" : " 사용"}
            </span>
          )}
        </div>
        <p className="ml-why">
          쓴 돈이 아니라 <b>남은 돈</b>을 먼저 보여주는 이유 — 사람은 같은 금액이라도
          잃는 쪽에 약 2배 민감해요(손실 회피). 줄어드는 게 보이면 손이 한 번 멈춥니다.
        </p>
      </section>

      <QuickAdd addTx={addTx} />
      <SavingsGoal M={M} data={data} setGoal={setGoal} />
      <Envelopes M={M} data={data} setBudget={setBudget} />
    </div>
  );
}

/* ── 목표 저축액 (목표 구배 효과) ── */
function SavingsGoal({ M, data, setGoal }) {
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(data.goal.amount || "");

  const goal = data.goal.amount || 0;
  const saved = M.income - M.spent; // 이번 달 순저축
  const pct = goal > 0 ? Math.min(Math.max(saved / goal, 0), 1) : 0;
  const left = goal - saved;
  const perDayNeeded = left > 0 && M.daysLeft > 0 ? Math.ceil(left / M.daysLeft) : 0;

  const save = () => {
    setGoal({ amount: Math.max(parseInt(draft, 10) || 0, 0) });
    setEdit(false);
  };

  return (
    <section className="ml-card">
      <div className="ml-card-head">
        <h2>이번 달 저축 목표 <span className="ml-tag">목표 구배</span></h2>
        <button className="ml-ghost" onClick={() => { setDraft(data.goal.amount || ""); setEdit(!edit); }}>
          {edit ? "닫기" : goal > 0 ? "목표 수정" : "목표 정하기"}
        </button>
      </div>

      {edit ? (
        <div className="ml-edit">
          <label className="ml-edit-row">
            <span>월 저축 목표</span>
            <input className="ml-input" type="number" inputMode="numeric" placeholder="예: 300000"
              value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()} />
          </label>
          <button className="ml-submit income" onClick={save}>목표 저장</button>
        </div>
      ) : goal === 0 ? (
        <p className="ml-empty">
          목표가 구체적인 숫자가 되면 행동이 따라와요.<br />
          "많이 모으자"보다 "이번 달 30만원"이 강합니다.
        </p>
      ) : (
        <>
          <div className="ml-goal-row">
            <div className="ml-goal-num">
              <span className="ml-goal-saved">{saved >= 0 ? KRW(saved) : `−${KRW(saved)}`}</span>
              <span className="ml-goal-of"> / {KRW(goal)}</span>
            </div>
            <span className="ml-goal-pct">{Math.round(pct * 100)}%</span>
          </div>
          <div className="ml-bar ml-bar-lg">
            <div className="ml-bar-fill" style={{
              width: `${pct * 100}%`,
              background: pct >= 1 ? "#1B6E53" : pct >= 0.7 ? "#3F8F6B" : "#6BAF92",
            }} />
          </div>
          <p className="ml-goal-msg">
            {pct >= 1
              ? "🎉 목표 달성! 초과분은 다음 달 목표를 올릴 근거가 돼요."
              : saved < 0
              ? "이번 달은 아직 지출이 수입보다 많아요. 남은 기간 동안 만회할 수 있습니다."
              : pct >= 0.7
              ? `목표까지 ${KRW(left)} — 거의 다 왔어요. 사람은 목표에 가까울수록 속도가 붙어요(목표 구배). 이 구간을 이용하세요.`
              : `목표까지 ${KRW(left)} · 남은 ${M.daysLeft}일 동안 하루 ${KRW(perDayNeeded)}씩 아끼면 닿아요.`}
          </p>
        </>
      )}
    </section>
  );
}

/* ── 3초 빠른 입력 ── */
function QuickAdd({ addTx }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState("food");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState(todayISO());
  const cats = type === "expense" ? EXPENSE_CATS : INCOME_CATS;

  useEffect(() => { setCat(type === "expense" ? "food" : "salary"); }, [type]);

  const bump = (v) => setAmount(String((parseInt(amount || "0", 10) || 0) + v));

  const submit = () => {
    const amt = parseInt(amount, 10);
    if (!amt || amt <= 0) return;
    addTx({
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      type, amount: amt, category: cat, memo: memo.trim(), date,
    });
    setAmount(""); setMemo("");
  };

  return (
    <section className="ml-card">
      <div className="ml-card-head">
        <h2>빠른 기록</h2>
        <div className="ml-seg">
          <button className={type === "expense" ? "on exp" : ""} onClick={() => setType("expense")}>지출</button>
          <button className={type === "income" ? "on inc" : ""} onClick={() => setType("income")}>수입</button>
        </div>
      </div>

      <div className="ml-amount-row">
        <input className="ml-amount" type="number" inputMode="numeric" placeholder="0"
          value={amount} onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()} aria-label="금액" />
        <span className="ml-won">원</span>
      </div>
      <div className="ml-bumps">
        {[1000, 5000, 10000, 50000].map((v) => (
          <button key={v} onClick={() => bump(v)}>+{v.toLocaleString()}</button>
        ))}
        <button onClick={() => setAmount("")}>지움</button>
      </div>

      <div className="ml-chips">
        {cats.map((c) => (
          <button key={c.id}
            className={`ml-chip ${cat === c.id ? "on" : ""}`}
            style={cat === c.id ? { borderColor: c.color, background: c.color + "1A", color: "#1c2421" } : {}}
            onClick={() => setCat(c.id)}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <div className="ml-row2">
        <input className="ml-input" placeholder="메모 (선택)" value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()} />
        <input className="ml-input ml-date" type="date" value={date}
          onChange={(e) => setDate(e.target.value)} />
      </div>

      <button className={`ml-submit ${type}`} onClick={submit} disabled={!amount}>
        {type === "expense" ? "지출 기록하기" : "수입 기록하기"}
      </button>
    </section>
  );
}

/* ── 멘탈 어카운팅: 봉투 예산 ── */
function Envelopes({ M, data, setBudget }) {
  const [edit, setEdit] = useState(false);
  const [draftTotal, setDraftTotal] = useState(data.budget.total);
  const [draftPer, setDraftPer] = useState(data.budget.perCat || {});

  const spentBy = {};
  M.txs.filter((t) => t.type === "expense").forEach((t) => {
    spentBy[t.category] = (spentBy[t.category] || 0) + t.amount;
  });

  const rows = EXPENSE_CATS
    .map((c) => ({ ...c, budget: data.budget.perCat?.[c.id] || 0, spent: spentBy[c.id] || 0 }))
    .filter((r) => r.budget > 0 || r.spent > 0);

  const save = () => {
    const per = {};
    Object.entries(draftPer).forEach(([k, v]) => {
      const n = parseInt(v, 10);
      if (n > 0) per[k] = n;
    });
    setBudget({ total: parseInt(draftTotal, 10) || 0, perCat: per });
    setEdit(false);
  };

  return (
    <section className="ml-card">
      <div className="ml-card-head">
        <h2>봉투 예산 <span className="ml-tag">멘탈 어카운팅</span></h2>
        <button className="ml-ghost" onClick={() => { setDraftTotal(data.budget.total); setDraftPer(data.budget.perCat || {}); setEdit(!edit); }}>
          {edit ? "닫기" : "예산 설정"}
        </button>
      </div>
      <p className="ml-hint">
        돈에 칸막이를 만들면 "전체에서 조금"이 아니라 "이 봉투에서 크게" 나가는 게 보여요.
      </p>

      {edit ? (
        <div className="ml-edit">
          <label className="ml-edit-row">
            <span>월 전체 예산</span>
            <input className="ml-input" type="number" value={draftTotal}
              onChange={(e) => setDraftTotal(e.target.value)} />
          </label>
          {EXPENSE_CATS.map((c) => (
            <label key={c.id} className="ml-edit-row">
              <span>{c.emoji} {c.label}</span>
              <input className="ml-input" type="number" placeholder="0"
                value={draftPer[c.id] ?? ""}
                onChange={(e) => setDraftPer({ ...draftPer, [c.id]: e.target.value })} />
            </label>
          ))}
          <button className="ml-submit expense" onClick={save}>예산 저장</button>
        </div>
      ) : rows.length === 0 ? (
        <p className="ml-empty">아직 봉투가 비어 있어요. "예산 설정"으로 카테고리별 한도를 정해보세요.</p>
      ) : (
        <div className="ml-envs">
          {rows.map((r) => {
            const pct = r.budget > 0 ? Math.min(r.spent / r.budget, 1) : 0;
            const over = r.budget > 0 && r.spent > r.budget;
            return (
              <div key={r.id} className="ml-env">
                <div className="ml-env-top">
                  <span>{r.emoji} {r.label}</span>
                  <span className={over ? "over" : ""}>
                    {KRW(r.spent)}{r.budget > 0 && ` / ${KRW(r.budget)}`}
                    {over && " 초과!"}
                  </span>
                </div>
                {r.budget > 0 && (
                  <div className="ml-bar">
                    <div className="ml-bar-fill" style={{
                      width: `${pct * 100}%`,
                      background: over ? "#C4554D" : pct > 0.8 ? "#E0A526" : r.color,
                    }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ══════════ 설정 시트 (⚙) ══════════ */
function SettingsSheet({ onClose, exportCSV, importCSV, txCount, clearAll }) {
  const fileRef = useRef(null);
  const modeRef = useRef("append");
  const [confirmClear, setConfirmClear] = useState(false);

  const pick = (mode) => {
    modeRef.current = mode;
    fileRef.current?.click();
  };
  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f) { importCSV(f, modeRef.current); onClose(); }
    e.target.value = "";
  };

  return (
    <div className="ml-overlay" onClick={onClose}>
      <div className="ml-sheet" role="dialog" aria-label="설정" onClick={(e) => e.stopPropagation()}>
        <div className="ml-sheet-head">
          <h2>설정</h2>
          <button className="ml-del ml-sheet-close" aria-label="닫기" onClick={onClose}>×</button>
        </div>

        <div className="ml-set-group">
          <h3>CSV 백업·복원</h3>
          <p className="ml-hint">
            형식: date, type(지출/수입), category, amount, memo — 엑셀에서 바로 열립니다.
          </p>
          <div className="ml-csv-btns">
            <button className="ml-csv-btn" onClick={() => { exportCSV(); }}>
              ⬇ CSV 내보내기 <span className="ml-cnt">({txCount}건)</span>
            </button>
            <button className="ml-csv-btn" onClick={() => pick("append")}>⬆ 가져오기 (추가)</button>
            <button className="ml-csv-btn warn" onClick={() => pick("replace")}>⬆ 가져오기 (전체 교체)</button>
          </div>
          <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={onFile} />
        </div>

        <div className="ml-set-group">
          <h3>데이터 관리</h3>
          <p className="ml-hint">삭제 전에 위에서 CSV로 내보내 두는 걸 권장해요.</p>
          {confirmClear ? (
            <div className="ml-csv-btns">
              <button className="ml-csv-btn warn" onClick={() => { clearAll(); setConfirmClear(false); onClose(); }}>
                정말 삭제 ({txCount}건 모두)
              </button>
              <button className="ml-csv-btn" onClick={() => setConfirmClear(false)}>취소</button>
            </div>
          ) : (
            <button className="ml-csv-btn warn" onClick={() => setConfirmClear(true)}
              disabled={txCount === 0}>
              기록 전체 삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════ 내역 (월별) ══════════ */
function History({ data, removeTx }) {
  const [ym, setYm] = useState(monthKey(todayISO()));
  const [y, m] = ym.split("-").map(Number);

  const shift = (d) => {
    const nd = new Date(y, m - 1 + d, 1);
    setYm(`${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, "0")}`);
  };
  const isCurrent = ym === monthKey(todayISO());

  const monthTxs = useMemo(
    () => data.transactions.filter((t) => monthKey(t.date) === ym),
    [data.transactions, ym]
  );
  const income = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const spent = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const groups = useMemo(() => {
    const byDate = {};
    [...monthTxs]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .forEach((t) => { (byDate[t.date] = byDate[t.date] || []).push(t); });
    return Object.entries(byDate);
  }, [monthTxs]);

  return (
    <div className="ml-stack">
      <section className="ml-card ml-month-nav-card">
        <div className="ml-month-nav">
          <button className="ml-nav-btn" aria-label="이전 달" onClick={() => shift(-1)}>◀</button>
          <span className="ml-month-label">{y}년 {m}월</span>
          <button className="ml-nav-btn" aria-label="다음 달" onClick={() => shift(1)} disabled={isCurrent}>▶</button>
        </div>
        <div className="ml-month-sum">
          <div><span className="ml-sum-label">수입</span><span className="pos">+{KRW(income)}</span></div>
          <div><span className="ml-sum-label">지출</span><span className="neg">−{KRW(spent)}</span></div>
          <div><span className="ml-sum-label">순액</span>
            <span className={income - spent >= 0 ? "pos" : "neg"}>{signedKRW(income - spent)}</span>
          </div>
        </div>
        {!isCurrent && (
          <button className="ml-ghost ml-today-btn" onClick={() => setYm(monthKey(todayISO()))}>
            이번 달로
          </button>
        )}
      </section>

      {groups.length === 0 ? (
        <p className="ml-empty ml-card">
          {y}년 {m}월에는 기록이 없어요.
          {isCurrent && ' "오늘" 탭에서 첫 기록을 남겨보세요.'}
        </p>
      ) : (
        groups.map(([date, txs]) => {
          const d = new Date(date + "T00:00:00");
          const sum = txs.reduce((s, t) => s + (t.type === "expense" ? -t.amount : t.amount), 0);
          return (
            <section key={date} className="ml-card">
              <div className="ml-day-head">
                <span>{d.getDate()}일 ({WEEKDAYS[d.getDay()]})</span>
                <span className={sum < 0 ? "neg" : "pos"}>{signedKRW(sum)}</span>
              </div>
              {txs.map((t) => {
                const c = catOf(t.category);
                return (
                  <div key={t.id} className="ml-tx">
                    <span className="ml-tx-emoji" style={{ background: c.color + "22" }}>{c.emoji}</span>
                    <div className="ml-tx-mid">
                      <span className="ml-tx-cat">{c.label}</span>
                      {t.memo && <span className="ml-tx-memo">{t.memo}</span>}
                    </div>
                    <span className={`ml-tx-amt ${t.type}`}>
                      {t.type === "expense" ? "−" : "+"}{KRW(t.amount)}
                    </span>
                    <button className="ml-del" aria-label="삭제" onClick={() => removeTx(t.id)}>×</button>
                  </div>
                );
              })}
            </section>
          );
        })
      )}
    </div>
  );
}

/* ══════════ 분석 ══════════ */
function Insight({ data, M }) {
  const exp = M.txs.filter((t) => t.type === "expense");

  const byCat = useMemo(() => {
    const m = {};
    exp.forEach((t) => (m[t.category] = (m[t.category] || 0) + t.amount));
    return Object.entries(m)
      .map(([id, v]) => ({ ...catOf(id), value: v }))
      .sort((a, b) => b.value - a.value);
  }, [M.txs]);

  /* 월별 비교: 최근 6개월 */
  const monthly = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const txs = data.transactions.filter((t) => monthKey(t.date) === mk);
      arr.push({
        name: `${d.getMonth() + 1}월`,
        mk,
        지출: txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        수입: txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      });
    }
    return arr;
  }, [data.transactions]);

  /* 공정 비교: 지난달 같은 날짜까지 */
  const fairCompare = useMemo(() => {
    const now = new Date();
    const day = now.getDate();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMk = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
    const prevSpent = data.transactions
      .filter((t) => t.type === "expense" && monthKey(t.date) === prevMk &&
        parseInt(t.date.slice(8, 10), 10) <= day)
      .reduce((s, t) => s + t.amount, 0);
    return { prevSpent, day, hasPrev: data.transactions.some((t) => monthKey(t.date) === prevMk) };
  }, [data.transactions]);

  const last14 = useMemo(() => {
    const arr = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const v = data.transactions
        .filter((t) => t.type === "expense" && t.date === iso)
        .reduce((s, t) => s + t.amount, 0);
      arr.push({ name: `${d.getDate()}일`, 지출: v });
    }
    return arr;
  }, [data.transactions]);

  const byWeekday = useMemo(() => {
    const sum = Array(7).fill(0), cnt = Array(7).fill(0);
    const seen = new Set();
    data.transactions.filter((t) => t.type === "expense").forEach((t) => {
      const w = new Date(t.date + "T00:00:00").getDay();
      sum[w] += t.amount;
      if (!seen.has(t.date)) { seen.add(t.date); cnt[w]++; }
    });
    return WEEKDAYS.map((w, i) => ({ name: w, 평균: cnt[i] ? Math.round(sum[i] / cnt[i]) : 0 }));
  }, [data.transactions]);

  /* 청킹: 한 문장 인사이트 */
  const insights = [];
  if (exp.length > 0) {
    const total = exp.reduce((s, t) => s + t.amount, 0);
    const top = byCat[0];
    insights.push(`이번 달 지출의 ${Math.round((top.value / total) * 100)}%가 ${top.emoji} ${top.label}예요. 줄일 곳을 하나만 고른다면 여기부터.`);

    if (fairCompare.hasPrev) {
      const diff = M.spent - fairCompare.prevSpent;
      if (fairCompare.prevSpent > 0 || M.spent > 0) {
        insights.push(
          diff <= 0
            ? `지난달 ${fairCompare.day}일까지보다 ${KRW(diff)} 덜 썼어요. 월말 합계가 아니라 같은 시점끼리 비교해야 공정한 비교예요.`
            : `지난달 ${fairCompare.day}일까지보다 ${KRW(diff)} 더 썼어요. 아직 ${M.daysLeft}일 남았으니 방향을 바꿀 시간은 충분해요.`
        );
      }
    }

    const wk = byWeekday.reduce((a, b) => (b.평균 > a.평균 ? b : a));
    if (wk.평균 > 0) insights.push(`${wk.name}요일에 평균 ${KRW(wk.평균)}로 가장 많이 써요. 그날만 미리 한도를 정해두면 효과가 커요.`);

    const small = exp.filter((t) => t.amount <= 10000);
    if (small.length >= 5) {
      const sSum = small.reduce((s, t) => s + t.amount, 0);
      insights.push(`1만원 이하 소액 지출이 ${small.length}건, 합치면 ${KRW(sSum)}. 작아서 안 보이던 돈이 모이면 이만큼이에요.`);
    }
    if (M.remaining < 0) insights.push(`예산을 ${KRW(M.remaining)} 넘었어요. 자책보다 다음 달 예산을 현실에 맞게 조정하는 게 지속에 유리해요.`);
  }

  if (data.transactions.length === 0)
    return <p className="ml-empty ml-card">기록이 쌓이면 여기서 소비 패턴을 보여드릴게요.</p>;

  const hasMultiMonth = monthly.filter((m) => m.지출 > 0 || m.수입 > 0).length >= 2;

  return (
    <div className="ml-stack">
      {insights.length > 0 && (
        <section className="ml-card">
          <h2>이번 달 핵심 한 줄 <span className="ml-tag">청킹</span></h2>
          <ul className="ml-insights">
            {insights.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </section>
      )}

      <section className="ml-card">
        <h2>월별 비교 (최근 6개월)</h2>
        {!hasMultiMonth && (
          <p className="ml-hint">두 달 이상 기록이 쌓이면 추세가 보이기 시작해요.</p>
        )}
        <div className="ml-chart">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e7e4" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 10 }} width={50}
                tickFormatter={(v) => (v >= 10000 ? `${Math.round(v / 10000)}만` : v)} />
              <Tooltip formatter={(v) => KRW(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="수입" fill="#1B6E53" radius={[4, 4, 0, 0]} />
              <Bar dataKey="지출" fill="#C4554D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="ml-month-table">
          {monthly.filter((m) => m.지출 > 0 || m.수입 > 0).map((m) => (
            <div key={m.mk} className="ml-month-row">
              <span>{m.name}</span>
              <span className="pos">+{KRW(m.수입)}</span>
              <span className="neg">−{KRW(m.지출)}</span>
              <span className={m.수입 - m.지출 >= 0 ? "pos" : "neg"}>
                순 {signedKRW(m.수입 - m.지출)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {byCat.length > 0 && (
        <section className="ml-card">
          <h2>어디에 쓰고 있나</h2>
          <div className="ml-chart">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byCat} dataKey="value" nameKey="label"
                  innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {byCat.map((c) => <Cell key={c.id} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={(v) => KRW(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="ml-legend">
            {byCat.map((c) => (
              <span key={c.id}><i style={{ background: c.color }} /> {c.label} {KRW(c.value)}</span>
            ))}
          </div>
        </section>
      )}

      <section className="ml-card">
        <h2>최근 14일 흐름</h2>
        <div className="ml-chart">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e7e4" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={1} />
              <YAxis tick={{ fontSize: 10 }} width={50}
                tickFormatter={(v) => (v >= 10000 ? `${v / 10000}만` : v)} />
              <Tooltip formatter={(v) => KRW(v)} />
              <Bar dataKey="지출" fill="#1B4D3E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="ml-card">
        <h2>요일별 평균 지출</h2>
        <p className="ml-hint">패턴이 보이면 의지 대신 "그 요일의 규칙"으로 대응할 수 있어요.</p>
        <div className="ml-chart">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={byWeekday}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis hide />
              <Tooltip formatter={(v) => KRW(v)} />
              <Bar dataKey="평균" fill="#3F7CAC" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

/* ══════════ 스타일 ══════════ */
function Style() {
  return (
    <style>{`
      .ml-root {
        --ink:#1C2421; --paper:#F2F5F3; --card:#FFFFFF;
        --green:#1B4D3E; --red:#C4554D; --amber:#E0A526; --mut:#6B7570;
        max-width:560px; margin:0 auto; padding:20px 16px 40px;
        font-family:"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",system-ui,sans-serif;
        color:var(--ink); background:var(--paper); min-height:100vh;
        box-sizing:border-box;
      }
      .ml-root *{box-sizing:border-box}
      .ml-loading{padding:80px 0;text-align:center;color:var(--mut)}
      .ml-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
      .ml-title{font-size:22px;font-weight:800;margin:0;letter-spacing:-0.5px}
      .ml-sub{margin:2px 0 0;font-size:12px;color:var(--mut)}
      .ml-save{font-size:11px;color:var(--mut);min-height:14px}
      .ml-save-error{color:var(--red)}

      .ml-flash{position:sticky;top:8px;z-index:10;margin-bottom:10px;
        padding:10px 14px;border-radius:12px;font-size:13px;font-weight:600;
        animation:mlPop .25s ease;box-shadow:0 6px 18px rgba(0,0,0,.12)}
      .ml-flash-expense{background:var(--ink);color:#fff}
      .ml-flash-income{background:var(--green);color:#fff}
      @keyframes mlPop{from{transform:translateY(-6px);opacity:0}to{transform:none;opacity:1}}
      @media (prefers-reduced-motion: reduce){.ml-flash{animation:none}}

      .ml-tabs{display:flex;gap:6px;margin-bottom:14px}
      .ml-tab{flex:1;padding:9px 0;border:1px solid #DDE3DF;border-radius:999px;
        background:var(--card);font-size:14px;font-weight:600;color:var(--mut);cursor:pointer}
      .ml-tab.on{background:var(--ink);color:#fff;border-color:var(--ink)}
      .ml-tab:focus-visible,.ml-root button:focus-visible{outline:2px solid var(--green);outline-offset:2px}

      .ml-stack{display:flex;flex-direction:column;gap:14px}
      .ml-card{background:var(--card);border-radius:16px;padding:16px;border:1px solid #E5EAE7}
      .ml-card h2{font-size:15px;margin:0 0 6px;font-weight:700}
      .ml-card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
      .ml-tag{font-size:10px;font-weight:600;color:var(--green);background:#1B4D3E14;
        padding:2px 7px;border-radius:999px;vertical-align:2px}
      .ml-hint{font-size:12px;color:var(--mut);margin:0 0 10px;line-height:1.5}
      .ml-empty{font-size:13px;color:var(--mut);text-align:center;padding:18px 8px;line-height:1.6}
      .ml-ghost{border:1px solid #DDE3DF;background:none;border-radius:999px;
        padding:5px 12px;font-size:12px;cursor:pointer;color:var(--ink);flex-shrink:0}

      /* 히어로 */
      .ml-hero{background:linear-gradient(160deg,#1B4D3E,#143A30);color:#fff;
        border-radius:20px;padding:20px 18px}
      .ml-hero.danger{background:linear-gradient(160deg,#7C3A34,#5E2B26)}
      .ml-eyebrow{font-size:12px;opacity:.8;letter-spacing:.5px}
      .ml-big{font-size:38px;font-weight:800;letter-spacing:-1px;margin:4px 0 10px;
        font-variant-numeric:tabular-nums}
      .ml-gauge{height:10px;background:rgba(255,255,255,.18);border-radius:999px;overflow:hidden}
      .ml-gauge-fill{height:100%;background:#fff;border-radius:999px;transition:width .5s ease}
      .ml-hero-row{display:flex;justify-content:space-between;font-size:12px;opacity:.85;margin-top:8px}
      .ml-daily{margin-top:12px;font-size:14px}
      .ml-daily strong{font-size:16px}
      .ml-daily .over{color:#FFD2CC;font-weight:600}
      .ml-daily .ok{opacity:.85}
      .ml-why{margin:12px 0 0;font-size:11.5px;line-height:1.6;opacity:.75;
        border-top:1px solid rgba(255,255,255,.15);padding-top:10px}

      /* 저축 목표 */
      .ml-goal-row{display:flex;justify-content:space-between;align-items:baseline;margin:6px 0 8px}
      .ml-goal-saved{font-size:24px;font-weight:800;font-variant-numeric:tabular-nums}
      .ml-goal-of{font-size:14px;color:var(--mut)}
      .ml-goal-pct{font-size:18px;font-weight:800;color:var(--green)}
      .ml-bar-lg{height:14px}
      .ml-goal-msg{margin:10px 0 0;font-size:13px;line-height:1.6;color:var(--ink)}

      /* 빠른 입력 */
      .ml-seg{display:flex;border:1px solid #DDE3DF;border-radius:999px;overflow:hidden}
      .ml-seg button{border:none;background:none;padding:6px 14px;font-size:13px;
        font-weight:600;color:var(--mut);cursor:pointer}
      .ml-seg button.on.exp{background:var(--red);color:#fff}
      .ml-seg button.on.inc{background:var(--green);color:#fff}
      .ml-amount-row{display:flex;align-items:baseline;gap:6px;margin:10px 0 6px}
      .ml-amount{flex:1;border:none;border-bottom:2px solid #DDE3DF;background:none;
        font-size:32px;font-weight:800;width:100%;padding:4px 2px;color:var(--ink);
        font-variant-numeric:tabular-nums}
      .ml-amount:focus{outline:none;border-bottom-color:var(--green)}
      .ml-won{font-size:16px;color:var(--mut)}
      .ml-bumps{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
      .ml-bumps button{border:1px solid #DDE3DF;background:#F7FAF8;border-radius:8px;
        padding:6px 10px;font-size:12px;cursor:pointer;color:var(--ink)}
      .ml-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
      .ml-chip{border:1px solid #DDE3DF;background:#fff;border-radius:999px;
        padding:7px 12px;font-size:13px;cursor:pointer;color:var(--mut)}
      .ml-chip.on{font-weight:700}
      .ml-row2{display:flex;gap:8px;margin-bottom:12px}
      .ml-input{flex:1;border:1px solid #DDE3DF;border-radius:10px;padding:9px 12px;
        font-size:14px;background:#fff;color:var(--ink);min-width:0}
      .ml-date{flex:0 0 150px}
      .ml-submit{width:100%;border:none;border-radius:12px;padding:13px 0;
        font-size:15px;font-weight:700;color:#fff;cursor:pointer}
      .ml-submit.expense{background:var(--ink)}
      .ml-submit.income{background:var(--green)}
      .ml-submit:disabled{opacity:.4;cursor:default}

      /* 봉투 */
      .ml-envs{display:flex;flex-direction:column;gap:12px}
      .ml-env-top{display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px}
      .ml-env-top .over{color:var(--red);font-weight:700}
      .ml-bar{height:8px;background:#EDF1EE;border-radius:999px;overflow:hidden}
      .ml-bar-fill{height:100%;border-radius:999px;transition:width .4s ease}
      .ml-edit{display:flex;flex-direction:column;gap:8px}
      .ml-edit-row{display:flex;align-items:center;gap:10px;font-size:13px}
      .ml-edit-row span{flex:0 0 120px}

      /* CSV */
      .ml-csv-btns{display:flex;gap:8px;flex-wrap:wrap}
      .ml-csv-btn{border:1px solid #DDE3DF;background:#F7FAF8;border-radius:10px;
        padding:9px 14px;font-size:13px;font-weight:600;cursor:pointer;color:var(--ink)}
      .ml-csv-btn.warn{color:var(--red);border-color:#E8CFCC}
      .ml-csv-btn:disabled{opacity:.4;cursor:default}
      .ml-cnt{font-weight:400;color:var(--mut)}

      /* 헤더 우측 + 톱니바퀴 */
      .ml-header-right{display:flex;align-items:center;gap:8px}
      .ml-gear{border:1px solid #DDE3DF;background:var(--card);border-radius:10px;
        width:36px;height:36px;display:flex;align-items:center;justify-content:center;
        cursor:pointer;color:var(--ink);flex-shrink:0}
      .ml-gear:hover{background:#EDF1EE}

      /* 설정 시트 */
      .ml-overlay{position:fixed;inset:0;background:rgba(20,30,26,.45);z-index:50;
        display:flex;align-items:flex-end;justify-content:center}
      .ml-sheet{background:var(--card);width:100%;max-width:560px;
        border-radius:20px 20px 0 0;padding:18px 18px 28px;
        max-height:80vh;overflow-y:auto;animation:mlUp .25s ease}
      @keyframes mlUp{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}
      @media (prefers-reduced-motion: reduce){.ml-sheet{animation:none}}
      .ml-sheet-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
      .ml-sheet-head h2{font-size:17px;margin:0;font-weight:800}
      .ml-sheet-close{font-size:24px}
      .ml-set-group{padding:14px 0;border-top:1px solid #EDF1EE}
      .ml-set-group h3{font-size:14px;margin:0 0 6px;font-weight:700}

      /* 내역: 월 네비게이션 */
      .ml-month-nav-card{position:relative}
      .ml-month-nav{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:12px}
      .ml-month-label{font-size:17px;font-weight:800;min-width:110px;text-align:center}
      .ml-nav-btn{border:1px solid #DDE3DF;background:#F7FAF8;border-radius:10px;
        width:34px;height:34px;font-size:12px;cursor:pointer;color:var(--ink)}
      .ml-nav-btn:disabled{opacity:.3;cursor:default}
      .ml-month-sum{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center}
      .ml-month-sum>div{display:flex;flex-direction:column;gap:2px;background:#F7FAF8;
        border-radius:12px;padding:10px 4px}
      .ml-sum-label{font-size:11px;color:var(--mut)}
      .ml-month-sum span:not(.ml-sum-label){font-size:14px;font-weight:700;
        font-variant-numeric:tabular-nums}
      .ml-today-btn{position:absolute;top:14px;right:14px}

      /* 내역 */
      .ml-day-head{display:flex;justify-content:space-between;font-size:13px;
        font-weight:700;padding-bottom:8px;border-bottom:1px solid #EDF1EE;margin-bottom:4px}
      .neg{color:var(--red)} .pos{color:var(--green)}
      .ml-tx{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #F2F5F3}
      .ml-tx:last-child{border-bottom:none}
      .ml-tx-emoji{width:34px;height:34px;border-radius:10px;display:flex;
        align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
      .ml-tx-mid{flex:1;display:flex;flex-direction:column;min-width:0}
      .ml-tx-cat{font-size:14px;font-weight:600}
      .ml-tx-memo{font-size:12px;color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .ml-tx-amt{font-size:14px;font-weight:700;font-variant-numeric:tabular-nums}
      .ml-tx-amt.expense{color:var(--ink)} .ml-tx-amt.income{color:var(--green)}
      .ml-del{border:none;background:none;color:#B8C0BB;font-size:18px;
        cursor:pointer;padding:2px 6px;line-height:1}
      .ml-del:hover{color:var(--red)}

      /* 분석 */
      .ml-insights{margin:8px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:8px}
      .ml-insights li{font-size:13.5px;line-height:1.6}
      .ml-chart{margin-top:6px}
      .ml-legend{display:flex;flex-wrap:wrap;gap:8px 14px;font-size:12px;margin-top:8px;color:var(--mut)}
      .ml-legend i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:4px}
      .ml-month-table{margin-top:10px;display:flex;flex-direction:column;gap:6px}
      .ml-month-row{display:grid;grid-template-columns:40px 1fr 1fr 1.2fr;gap:4px;
        font-size:12px;font-variant-numeric:tabular-nums;align-items:center}
      .ml-month-row span:first-child{font-weight:700}
      .ml-month-row span:not(:first-child){text-align:right}

      .ml-foot{text-align:center;font-size:11px;color:#A6AFAA;margin-top:24px}
    `}</style>
  );
}
