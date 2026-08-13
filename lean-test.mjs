import { chromium } from "playwright";
const BASE = "http://localhost:3830";
const out = [];
const ok = (n, v) => { out.push(`${v?"PASS":"FAIL"}  ${n}`); };
// hard self-timeout so it can never hang the shell
const bail = setTimeout(() => { console.log(out.join("\n")); console.log("TIMEOUT"); process.exit(2); }, 75000);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await (await b.newContext()).newPage();
p.setDefaultTimeout(8000);
p.on("pageerror", e => console.log("[pageerror]", e.message.slice(0,90)));
try {
  await p.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await p.fill('input[name="email"]', "amaka@guru.ng");
  await p.fill('input[name="password"]', "guru1234");
  await p.click('button[type="submit"]');
  await p.waitForTimeout(1800);
  const btn = p.getByRole("button", { name: /Sign out that device/ });
  if (await btn.count()) await btn.click();
  await p.waitForURL("**/dashboard", { timeout: 8000 });
  ok("owner login", true);

  await p.goto(`${BASE}/admin/content/import`, { waitUntil: "domcontentloaded" });
  const body = await p.textContent("body");
  ok("import page renders (no crash)", body.includes("Bulk import questions") && body.includes("Download CSV template"));
  ok("has file input", await p.locator('input[type=file]').count() > 0);

  const tpl = await p.request.get(`${BASE}/api/admin/question-template`);
  ok("template downloads", tpl.status() === 200 && (await tpl.text()).includes("exam_body,subject,year"));

  // do the import
  await p.locator('input[type=file]').setInputFiles("/tmp/claude-0/-home-user-Originalpsalm/745776bd-4191-598f-bafa-8333af17001f/scratchpad/test-import.csv");
  await p.waitForTimeout(300);
  await p.click('button:has-text("Check file")');
  await p.waitForTimeout(1500);
  const prev = await p.textContent("body");
  ok("preview groups+problems", prev.includes("+6") && /skipped/.test(prev));
  await p.click('button:has-text("Import")');
  await p.waitForTimeout(1800);
  ok("import committed 8", (await p.textContent("body")).includes("Imported 8"));
} catch (e) {
  console.log("[err]", e.message.slice(0,120));
}
clearTimeout(bail);
await b.close();
console.log(out.join("\n"));
