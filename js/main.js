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

// ---- Fuente y tema ----
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
      const title =
        card.dataset.speakableTitle ||
        card.querySelector("h2,h3")?.textContent ||
        "";
      const text = card.textContent || "";
      speak(`${title}. ${text}`);
    });
  });
}

// ---- Controles barra superior ----
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
        "Este centro escolar de clima espacial muestra el índice K p, la actividad solar, las auroras y la resonancia Schumann con enfoque inclusivo."
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

// ---- Modos PIE avanzados ----
function initPIEModes() {
  const container = document.getElementById("accesibilidad");
  if (!container) return;
  container.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-mode");
      document.body.classList.remove("mode-dyslexia", "mode-tea", "mode-lowvision");
      if (mode === "dyslexia") {
        document.body.classList.add("mode-dyslexia");
        awardBadge("dyslexia", "🔤 Activador/a Modo Dislexia");
      } else if (mode === "tea") {
        document.body.classList.add("mode-tea");
        awardBadge("tea", "🧠 Activador/a Modo TEA");
      } else if (mode === "lowvision") {
        document.body.classList.add("mode-lowvision");
        awardBadge("lowvision", "👁️ Activador/a Modo Baja Visión");
      }
    });
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

// ---- Índice Kp (NOAA) ----
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
    const values = rows
      .map((row) => parseFloat(row[1]))
      .filter((v) => !isNaN(v));
    const last = values[values.length - 1];

    kpValueEl.textContent = isFinite(last) ? last.toFixed(1) : "N/D";
    kpStatusEl.textContent =
      last >= 5
        ? "Tormenta geomagnética moderada o fuerte."
        : "Condiciones geomagnéticas tranquilas o leves.";
    kpValueEl.classList.remove("pulse");

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

// ---- Manchas solares (simulado) + imagen SDO ----
async function fetchSunspots() {
  const el = document.getElementById("sunspot-number");
  const img = document.getElementById("img-sdo");
  if (el) {
    try {
      el.textContent = "cargando…";
      const fake = 80 + Math.round(Math.random() * 60);
      await new Promise((r) => setTimeout(r, 400));
      el.textContent = fake.toString();
    } catch (err) {
      console.warn("Error obteniendo manchas:", err);
      el.textContent = "N/D";
    }
  }
  if (img) {
    // Imagen pública aproximada de SDO canal 171
    img.src =
      "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0171.jpg";
  }
}

// ---- Mapa Leaflet ----
function initAuroraMap() {
  const mapDiv = document.getElementById("map-aurora");
  if (!mapDiv || !window.L) return;

  const map = L.map("map-aurora", {
    zoomControl: false,
    attributionControl: false,
  }).setView([60, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 6,
  }).addTo(map);

  // Dibujar círculo aproximado representando el oval auroral
  const circle = L.circle([70, 0], {
    radius: 3000000,
    color: "#22c55e",
    fillColor: "#22c55e",
    fillOpacity: 0.25,
  }).addTo(map);

  // Guardar en dataset para poder re-escalar desde el simulador si se quisiera
  mapDiv._auroraCircle = circle;
}

// ---- Simulador Sol → Tierra ----
function initSimulador() {
  const flare = document.getElementById("sim-flare");
  const wind = document.getElementById("sim-wind");
  const density = document.getElementById("sim-density");
  const outKp = document.getElementById("sim-kp");
  const outOval = document.getElementById("sim-oval");
  const outRisk = document.getElementById("sim-risk");
  if (!flare || !wind || !density) return;

  function recompute() {
    const f = parseInt(flare.value, 10);
    const w = parseInt(wind.value, 10);
    const d = parseInt(density.value, 10);

    // Función inventada simple
    const kp = Math.min(
      9,
      Math.round(2 + f * 1.5 + (w - 300) / 300 + d / 20)
    );
    outKp.textContent = `≈ ${kp}`;

    let oval;
    if (kp <= 3) oval = "Auroras en latitudes muy altas.";
    else if (kp <= 5) oval = "Auroras visibles en latitudes altas.";
    else if (kp <= 7) oval = "Auroras en latitudes medias (a veces).";
    else oval = "Auroras muy extendidas, incluso cerca del ecuador.";

    let risk;
    if (kp <= 3) risk = "Impacto bajo en tecnología.";
    else if (kp <= 5) risk = "Posibles perturbaciones leves en GPS y radio.";
    else if (kp <= 7) risk = "Riesgo moderado para satélites y redes eléctricas.";
    else risk = "Riesgo elevado para sistemas tecnológicos sensibles.";

    outOval.textContent = oval;
    outRisk.textContent = risk;

    awardBadge("sim", "☀️ Modelador/a Sol–Tierra");
  }

  flare.addEventListener("input", recompute);
  wind.addEventListener("input", recompute);
  density.addEventListener("input", recompute);
  recompute();
}

// ---- Laboratorio de energía ----
function initEnergyLab() {
  const kp = document.getElementById("lab-kp");
  const speed = document.getElementById("lab-speed");
  const density = document.getElementById("lab-density");
  const outE = document.getElementById("lab-energy");
  const outI = document.getElementById("lab-interpretation");
  const btn = document.getElementById("lab-btn-calc");
  if (!kp || !speed || !density || !btn) return;

  btn.addEventListener("click", () => {
    const k = parseFloat(kp.value || "0");
    const v = parseFloat(speed.value || "0");
    const d = parseFloat(density.value || "0");
    const normV = Math.max(0, v - 300) / 700;
    const energy = (k / 9) * (normV + 0.2) * (d / 50);
    const score = Math.round(energy * 100);

    outE.textContent = `${score} (escala 0–100 aprox.)`;

    let interp;
    if (score < 25) interp = "Energía baja: condiciones tranquilas.";
    else if (score < 50) interp = "Energía moderada: clima espacial activo normal.";
    else if (score < 75) interp = "Energía alta: clima espacial intenso, posible impacto técnico.";
    else interp = "Energía muy alta: condiciones extremas poco frecuentes.";

    outI.textContent = interp;
    awardBadge("energy", "⚡ Analista de energía espacial");
  });
}

// ---- Simulación de sensores del liceo ----
function initSensors() {
  const uv = document.getElementById("sensor-uv");
  const temp = document.getElementById("sensor-temp");
  const press = document.getElementById("sensor-press");
  const btn = document.getElementById("sensor-refresh");
  if (!uv || !temp || !press || !btn) return;

  function simulate() {
    uv.textContent = (Math.random() * 10).toFixed(1);
    temp.textContent = (10 + Math.random() * 15).toFixed(1);
    press.textContent = (990 + Math.random() * 20).toFixed(1);
    awardBadge("sensors", "📡 Integrador/a de sensores");
  }

  btn.addEventListener("click", simulate);
  simulate();
}

// ---- Scoreboard ----
function loadScoreboard() {
  try {
    const raw = localStorage.getItem("schumann_scoreboard");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveScoreboard(data) {
  localStorage.setItem("schumann_scoreboard", JSON.stringify(data));
}
function renderScoreboard() {
  const list = document.getElementById("score-list");
  if (!list) return;
  const data = loadScoreboard();
  list.innerHTML = "";
  data.forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = "score-item";
    li.innerHTML = `
      <span>${item.name}</span>
      <span>
        ${item.points} pts
        <button data-idx="${idx}" data-delta="1">＋</button>
        <button data-idx="${idx}" data-delta="-1">－</button>
      </span>
    `;
    list.appendChild(li);
  });

  list.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-idx"), 10);
      const delta = parseInt(btn.getAttribute("data-delta"), 10);
      const data = loadScoreboard();
      if (!data[idx]) return;
      data[idx].points = Math.max(0, data[idx].points + delta);
      saveScoreboard(data);
      renderScoreboard();
    });
  });
}

function initScoreboard() {
  const input = document.getElementById("score-name");
  const btnAdd = document.getElementById("score-add");
  if (!input || !btnAdd) return;
  btnAdd.addEventListener("click", () => {
    const name = input.value.trim();
    if (!name) return;
    const data = loadScoreboard();
    data.push({ name, points: 0 });
    saveScoreboard(data);
    input.value = "";
    renderScoreboard();
    awardBadge("score", "📊 Coordinador/a de misión espacial");
  });
  renderScoreboard();
}

// ---- PDF diario ----
function initPDF() {
  const btn = document.getElementById("btn-pdf-report");
  if (!btn || !window.jspdf) return;

  btn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const kp = document.getElementById("kp-value")?.textContent || "N/D";
    const kpStatus = document.getElementById("kp-status")?.textContent || "";
    const energy = document.getElementById("lab-energy")?.textContent || "N/D";
    const interp =
      document.getElementById("lab-interpretation")?.textContent || "";

    doc.setFontSize(14);
    doc.text("Informe diario - Sol & Magnetosfera", 10, 15);
    doc.setFontSize(10);
    doc.text(`Kp actual: ${kp}`, 10, 25);
    doc.text(`Estado: ${kpStatus}`, 10, 30);
    doc.text(`Índice de energía relativo: ${energy}`, 10, 40);
    doc.text(`Interpretación: ${interp}`, 10, 45);
    doc.text(
      "Este informe se generó desde el Centro Escolar de Clima Espacial & Schumann (Neotech EduLab).",
      10,
      60,
      { maxWidth: 180 }
    );
    doc.save("informe_clima_espacial.pdf");
    awardBadge("pdf", "📄 Generador/a de informes");
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadBadges();
  applyTheme();
  applyFontScale();
  initControls();
  initCardNarrators();
  initPIEModes();
  initRegistro();
  initQuiz();
  renderBadges();
  fetchKPIndex();
  fetchSunspots();
  initAuroraMap();
  initSimulador();
  initEnergyLab();
  initSensors();
  initScoreboard();
  initPDF();
});
