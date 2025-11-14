// ---- PWA ----
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .catch((err) => console.error("SW error:", err));
  });
}

// ---- Estado global ----
const state = {
  theme: "dark",
  fontScale: 1,
  lang: "es",
  focusMode: false,
  badges: {},
};

function loadBadges() {
  try {
    const raw = localStorage.getItem("schumann_badges");
    state.badges = raw ? JSON.parse(raw) : {};
  } catch {
    state.badges = {};
  }
}

function saveBadges() {
  localStorage.setItem("schumann_badges", JSON.stringify(state.badges));
}

function awardBadge(key, label) {
  if (!state.badges[key]) {
    state.badges[key] = label;
    saveBadges();
    renderBadges();
  }
}

function renderBadges() {
  const strip = document.getElementById("badge-strip");
  const list = document.getElementById("badge-list");
  if (!strip || !list) return;

  strip.innerHTML = "";
  list.innerHTML = "";

  const entries = Object.entries(state.badges);
  if (entries.length === 0) {
    strip.innerHTML =
      '<span class="badge-chip">🚀 Aún no hay logros. ¡Explora el sitio!</span>';
    return;
  }

  entries.forEach(([key, label]) => {
    const chip = document.createElement("span");
    chip.className = "badge-chip";
    chip.textContent = label;
    strip.appendChild(chip);

    const li = document.createElement("li");
    li.className = "badge-pill";
    li.textContent = label;
    list.appendChild(li);
  });
}

// ---- Accesibilidad: fuente y tema ----
function applyFontScale() {
  document.documentElement.style.fontSize = `${state.fontScale * 16}px`;
}

function applyTheme() {
  if (state.theme === "light") {
    document.body.classList.add("light");
  } else {
    document.body.classList.remove("light");
  }
}

// ---- Narrador ----
function speak(text) {
  if (!("speechSynthesis" in window)) {
    alert("Tu navegador no soporta síntesis de voz.");
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = state.lang === "es" ? "es-ES" : "en-US";
  window.speechSynthesis.speak(utter);
}

function initCardNarrators() {
  const speakable = document.querySelectorAll(".speakable");
  speakable.forEach((card) => {
    const btn = card.querySelector(".card-voice");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const title = card.dataset.speakableTitle || card.querySelector("h2,h3")?.textContent || "";
      const text = card.textContent || "";
      speak(`${title}. ${text}`);
    });
  });
}

// ---- Controles de barra superior ----
function initControls() {
  const $ = (id) => document.getElementById(id);

  $("#btn-home")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $("#btn-theme")?.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme();
    awardBadge("theme", "🌓 Maestro/a del modo oscuro");
  });

  $("#btn-font-plus")?.addEventListener("click", () => {
    state.fontScale = Math.min(state.fontScale + 0.1, 1.6);
    applyFontScale();
  });

  $("#btn-font-minus")?.addEventListener("click", () => {
    state.fontScale = Math.max(state.fontScale - 0.1, 0.7);
    applyFontScale();
  });

  $("#btn-voice")?.addEventListener("click", () => {
    const selection = window.getSelection()?.toString();
    if (selection) {
      speak(selection);
    } else {
      speak(
        "Este dashboard muestra el índice K p, la actividad solar, las auroras y una explicación científica de la resonancia Schumann."
      );
    }
    awardBadge("voice", "🗣️ Explorador/a inclusivo");
  });

  $("#btn-lang")?.addEventListener("click", () => {
    state.lang = state.lang === "es" ? "en" : "es";
    alert(
      state.lang === "es"
        ? "Idioma de narración cambiado a Español."
        : "Narration language changed to English."
    );
  });

  $("#btn-focus")?.addEventListener("click", () => {
    state.focusMode = !state.focusMode;
    document.body.style.filter = state.focusMode ? "grayscale(0.15)" : "none";
  });

  $("#btn-search")?.addEventListener("click", () => {
    const term = prompt("¿Qué concepto quieres buscar en la página?");
    if (!term) return;
    const found = window.find(term, false, false, true, false, true, false);
    if (!found) {
      alert("No se encontró el texto en la página.");
    }
  });
}

// ---- Registro CSV ----
function initRegistro() {
  const table = document.getElementById("tabla-registro");
  if (!table) return;

  const btnAddRow = document.getElementById("btn-add-row");
  const btnDownload = document.getElementById("btn-download-csv");

  btnAddRow?.addEventListener("click", () => {
    const tbody = table.querySelector("tbody");
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="date" /></td>
      <td><input type="time" /></td>
      <td><input type="number" min="0" max="9" /></td>
      <td><input type="text" /></td>
      <td><input type="text" /></td>
    `;
    tbody.appendChild(row);
  });

  btnDownload?.addEventListener("click", () => {
    const rows = Array.from(table.querySelectorAll("tr"));
    const data = rows.map((row) =>
      Array.from(row.querySelectorAll("th, td"))
        .map((cell) => {
          const input = cell.querySelector("input");
          const value = input ? input.value : cell.textContent.trim();
          return `"${(value || "").replace(/"/g, '""')}"`
        })
        .join(",")
    );
    const csvContent = data.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registro_clima_espacial.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    awardBadge("csv", "✅ Analista de datos espaciales");
  });
}

// ---- Quiz ----
function initQuiz() {
  const form = document.getElementById("quiz-form");
  const resultEl = document.getElementById("quiz-result");
  if (!form || !resultEl) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const correct = { q1: "b", q2: "a", q3: "b" };
    let score = 0;
    let answered = 0;

    Object.keys(correct).forEach((q) => {
      const selected = form.querySelector(`input[name="${q}"]:checked`);
      if (selected) {
        answered++;
        if (selected.value === correct[q]) score++;
      }
    });

    if (answered < 3) {
      resultEl.textContent = "Responde todas las preguntas antes de enviar.";
      resultEl.style.color = "orange";
      return;
    }

    const msg =
      score === 3
        ? "🌟 ¡Excelente! Dominaste los conceptos clave de clima espacial."
        : score === 2
        ? "👍 Vas bien, pero revisa las preguntas donde te equivocaste."
        : "🧩 Buen intento. Revisa el material de la página y vuelve a intentarlo.";

    resultEl.textContent = `${msg} Puntaje: ${score}/3.`;
    resultEl.style.color = score === 3 ? "#22c55e" : "#facc15";

    if (score === 3) {
      awardBadge("quiz", "🧪 Experto/a en clima espacial");
    }
  });
}

// ---- Datos reales: índice Kp (NOAA) ----
async function fetchKPIndex() {
  const kpValueEl = document.getElementById("kp-value");
  const kpStatusEl = document.getElementById("kp-status");
  const canvas = document.getElementById("kp-chart");
  if (!kpValueEl || !canvas) return;

  kpValueEl.textContent = "…";
  kpStatusEl.textContent = "Cargando desde NOAA…";
  kpValueEl.classList.add("pulse");

  try {
    const res = await fetch(
      "https://services.swpc.noaa.gov/products/noaa-estimated-kp-index-1-minute.json"
    );
    if (!res.ok) throw new Error("Respuesta no OK");
    const data = await res.json();

    const rows = data.slice(-30);
    const values = rows.map((row) => parseFloat(row[1])).filter((v) => !isNaN(v));
    const last = values[values.length - 1];

    kpValueEl.textContent = isFinite(last) ? last.toFixed(1) : "N/D";
    kpStatusEl.textContent =
      last >= 5
        ? "Tormenta geomagnética moderada o fuerte."
        : "Condiciones geomagnéticas tranquilas o leves.";
    kpValueEl.classList.remove("pulse");

    // Dibujar gráfico simple
    const ctx = canvas.getContext("2d");
    const w = (canvas.width = canvas.clientWidth || 260);
    const h = (canvas.height = 120);
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const maxKp = 9;
    values.forEach((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * (w - 10) + 5;
      const y = h - (v / maxKp) * (h - 20) - 10;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = "rgba(148,163,184,0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(5, 10);
    ctx.lineTo(5, h - 10);
    ctx.lineTo(w - 5, h - 10);
    ctx.stroke();

    awardBadge("kp", "📊 Observador/a de tormentas Kp");
  } catch (err) {
    console.warn("No se pudo cargar el índice Kp:", err);
    kpValueEl.textContent = "—";
    kpStatusEl.textContent =
      "No se pudo conectar a NOAA (revisa Internet o intenta más tarde).";
    kpValueEl.classList.remove("pulse");
  }
}

// ---- Manchas solares (simulado / placeholder) ----
async function fetchSunspots() {
  const el = document.getElementById("sunspot-number");
  if (!el) return;
  try {
    el.textContent = "cargando…";

    // Aquí podrías reemplazar por una API real (por ejemplo SILSO).
    const fake = 80 + Math.round(Math.random() * 60);
    await new Promise((r) => setTimeout(r, 400));
    el.textContent = fake.toString();
  } catch (err) {
    console.warn("Error obteniendo manchas:", err);
    el.textContent = "N/D";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadBadges();
  applyTheme();
  applyFontScale();
  initControls();
  initCardNarrators();
  initRegistro();
  initQuiz();
  renderBadges();
  fetchKPIndex();
  fetchSunspots();
});
