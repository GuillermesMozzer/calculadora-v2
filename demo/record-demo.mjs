import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const W = 1600;
const H = 900;
const BASE = "http://localhost:4010";
const framesDir = path.join(__dirname, "frames");
const clipsDir = path.join(__dirname, "clips");
const vignettePng = path.join(__dirname, "assets-vinheta.png");
const outMp4 = path.join(__dirname, "calculadora-v1-demo.mp4");

fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(clipsDir, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, ["-y", ...args], { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}`));
    });
  });
}

async function caption(page, text) {
  await page.evaluate((t) => {
    let el = document.getElementById("demo-caption");
    if (!el) {
      el = document.createElement("div");
      el.id = "demo-caption";
      el.style.cssText = [
        "position:fixed",
        "left:50%",
        "bottom:24px",
        "transform:translateX(-50%)",
        "z-index:10000",
        "background:#111111",
        "color:#fff",
        "padding:10px 20px",
        "border-radius:999px",
        "font:600 15px Inter,Segoe UI,sans-serif",
        "letter-spacing:.02em",
        "box-shadow:0 10px 30px rgba(255,90,31,.35)",
        "border:1px solid #FF5A1F",
        "pointer-events:none",
        "max-width:90vw",
        "text-align:center",
      ].join(";");
      document.body.appendChild(el);
    }
    el.textContent = t;
    el.style.display = t ? "block" : "none";
  }, text);
}

async function pulseSummary(page, file) {
  await page.evaluate(() => {
    const el = document.querySelector('[data-tour="tour-summary"]');
    if (!el) return;
    el.scrollIntoView({ block: "center" });
    el.style.transition = "box-shadow .25s ease";
    el.style.boxShadow = "0 0 0 4px #FF5A1F, 0 20px 50px rgba(255,90,31,.35)";
  });
  await sleep(700);
  const box = page.locator('[data-tour="tour-summary"]');
  await box.screenshot({ path: path.join(framesDir, file) });
  await page.mouse.move(1380, 420);
  await sleep(900);
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    recordVideo: { dir: path.join(__dirname, "raw"), size: { width: W, height: H } },
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem("calculadora_v2_theme", "light");
    localStorage.setItem("calculadora_app_version", "v1");
    localStorage.removeItem("calculadora_v1_tutorial_done");
    localStorage.removeItem("calculadora_v2_user");
    localStorage.removeItem("calculadora_v1_ratecards");
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForSelector("html.light");
  await caption(page, "Tema claro · Calculadora V1");
  await sleep(1200);

  await page.getByRole("radio", { name: /V1/ }).click();
  await sleep(500);
  await caption(page, "Login de acesso");
  await page.getByLabel("E-mail").click();
  await page.getByLabel("E-mail").pressSequentially("ana.souza@taking.com.br", { delay: 45 });
  await sleep(300);
  await page.getByLabel("Senha").click();
  await page.getByLabel("Senha").pressSequentially("taking2026", { delay: 40 });
  await sleep(400);
  await page.getByRole("button", { name: "Entrar" }).click();

  await page.waitForURL("**/app");
  await page.getByRole("heading", { name: "Bem-vindo à Calculadora V1" }).waitFor({ timeout: 15000 });
  await caption(page, "Tutorial de primeiro acesso — Próximo e Anterior");
  await sleep(1400);

  await page.getByRole("button", { name: "Próximo" }).click();
  await sleep(1100);
  await page.getByRole("button", { name: "Próximo" }).click();
  await sleep(1100);
  await page.getByRole("button", { name: "Anterior" }).click();
  await sleep(900);
  await caption(page, "Dá para voltar a qualquer momento — ou pular");
  await sleep(800);

  for (let i = 0; i < 8; i++) {
    const next = page.getByRole("button", { name: "Próximo" });
    const finish = page.getByRole("button", { name: "Concluir" });
    if (await finish.isVisible().catch(() => false)) {
      await caption(page, "Concluir o tutorial");
      await sleep(600);
      await finish.click();
      break;
    }
    await next.click();
    await sleep(950);
  }
  if (await page.getByRole("button", { name: "Concluir" }).isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "Concluir" }).click();
  }
  await page.getByRole("heading", { name: "Bem-vindo à Calculadora V1" }).waitFor({ state: "hidden", timeout: 8000 }).catch(() => {});
  await sleep(600);

  await caption(page, "Navegue pelas seções para abrir ou recolher o conteúdo");
  await sleep(700);
  await page.getByRole("button", { name: /Calculadora Calculados/ }).click();
  await sleep(800);
  await page.getByRole("button", { name: /Recursos e benefícios/ }).click();
  await sleep(800);
  await page.getByRole("button", { name: /Breakdown de custo/ }).click();
  await sleep(900);
  await page.getByRole("button", { name: /Breakdown de custo/ }).click();
  await sleep(500);

  await caption(page, "Seção 1 · Perfil e contrato — o painel da direita reage na hora");
  await page.getByPlaceholder("Digite para buscar ou selecione na lista").click();
  await page.getByPlaceholder("Digite para buscar ou selecione na lista").fill("");
  await page.getByPlaceholder("Digite para buscar ou selecione na lista").pressSequentially("Java", { delay: 70 });
  await sleep(400);
  await page.getByRole("button", { name: "Desenvolvedor Java", exact: true }).click();
  await sleep(700);
  await pulseSummary(page, "zoom-01-competencia.png");

  await caption(page, "Senioridade Sênior — venda e margem mudam");
  await page.getByRole("button", { name: "Sênior", exact: true }).click();
  await sleep(700);
  await pulseSummary(page, "zoom-02-senioridade.png");

  await caption(page, "Modelo PJ altera o custo e o preço");
  await page.getByRole("button", { name: "PJ", exact: true }).click();
  await sleep(700);
  await pulseSummary(page, "zoom-03-contrato.png");

  await caption(page, "Seção 2 · Calculadora — trave a margem e simule a hora de venda");
  const calcToggle = page.getByRole("button", { name: /Calculadora Calculados/ });
  if ((await calcToggle.getAttribute("aria-expanded")) !== "true") {
    await calcToggle.click();
    await sleep(500);
  }
  const sale = page.getByRole("spinbutton").nth(1);
  await sale.click({ clickCount: 3 });
  await sale.fill("210");
  await sale.press("Tab");
  await sleep(800);
  await pulseSummary(page, "zoom-04-calculadora.png");

  await caption(page, "Seção 3 · Recursos e benefícios — MacBook entra no custo");
  const extraToggle = page.getByRole("button", { name: /Recursos e benefícios/ });
  if ((await extraToggle.getAttribute("aria-expanded")) !== "true") {
    await extraToggle.click();
    await sleep(500);
  }
  await page.getByRole("button", { name: "MacBook", exact: true }).click();
  await sleep(800);
  await pulseSummary(page, "zoom-05-beneficios.png");

  await caption(page, "O card fixo à direita é o resultado geral — ele acompanha tudo");
  await sleep(1800);
  await caption(page, "");
  await sleep(400);

  const video = page.video();
  await context.close();
  await browser.close();
  const rawPath = await video.path();
  const rawDest = path.join(__dirname, "raw-walkthrough.webm");
  fs.copyFileSync(rawPath, rawDest);
  console.log("recorded", rawDest);
  return rawDest;
}

async function stillClip(inputPng, outputMp4, label, seconds = 3.2) {
  const frames = Math.round(seconds * 30);
  await runFfmpeg([
    "-loop",
    "1",
    "-i",
    inputPng,
    "-f",
    "lavfi",
    "-i",
    "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-vf",
    `scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900,zoompan=z='min(1.12+0.0009*on,1.22)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1600x900:fps=30,drawtext=fontfile='C\\:/Windows/Fonts/segoeui.ttf':text='${label}':fontsize=28:fontcolor=0xFF5A1F:borderw=2:bordercolor=white:x=48:y=40`,
    "-t",
    String(seconds),
    "-r",
    "30",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-shortest",
    outputMp4,
  ]);
}

async function assemble(rawWebm) {
  const vignetteMp4 = path.join(clipsDir, "00-vinheta.mp4");
  await runFfmpeg([
    "-loop",
    "1",
    "-i",
    vignettePng,
    "-f",
    "lavfi",
    "-i",
    "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-vf",
    "scale=1600:900:force_original_aspect_ratio=decrease,pad=1600:900:(ow-iw)/2:(oh-ih)/2:color=0x100e0c,fade=t=in:st=0:d=0.5,fade=t=out:st=3.1:d=0.5,format=yuv420p",
    "-t",
    "3.6",
    "-r",
    "30",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-shortest",
    vignetteMp4,
  ]);

  const walkMp4 = path.join(clipsDir, "01-walkthrough.mp4");
  await runFfmpeg([
    "-i",
    rawWebm,
    "-f",
    "lavfi",
    "-i",
    "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-vf",
    "scale=1600:900:force_original_aspect_ratio=decrease,pad=1600:900:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-shortest",
    walkMp4,
  ]);

  const zooms = [
    ["zoom-01-competencia.png", "02-zoom-perfil.mp4", "Secao 1 - Competencia"],
    ["zoom-02-senioridade.png", "03-zoom-senioridade.mp4", "Secao 1 - Senioridade"],
    ["zoom-03-contrato.png", "04-zoom-contrato.mp4", "Secao 1 - Contrato"],
    ["zoom-04-calculadora.png", "05-zoom-calculadora.mp4", "Secao 2 - Calculadora"],
    ["zoom-05-beneficios.png", "06-zoom-beneficios.mp4", "Secao 3 - Beneficios"],
  ];
  for (const [png, mp4, label] of zooms) {
    await stillClip(path.join(framesDir, png), path.join(clipsDir, mp4), label);
  }

  const listPath = path.join(clipsDir, "concat.txt");
  const files = [
    "00-vinheta.mp4",
    "01-walkthrough.mp4",
    ...zooms.map((z) => z[1]),
  ];
  fs.writeFileSync(
    listPath,
    files.map((f) => `file '${path.join(clipsDir, f).replace(/\\/g, "/")}'`).join("\n"),
  );

  await runFfmpeg([
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listPath,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-movflags",
    "+faststart",
    outMp4,
  ]);
  console.log("video ready", outMp4);
}

const raw = await main();
await assemble(raw);
