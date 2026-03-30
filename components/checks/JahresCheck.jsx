import { useEffect, useMemo, useRef, useState } from "react";
import { useCheckScrollToTop } from "@/lib/checkScrollToTop";
import { isCheckDemoMode } from "@/lib/isCheckDemoMode";
import { useCheckConfig } from "@/lib/useCheckConfig";
import { SelectionCard, SliderCard } from "@/components/ui/CheckComponents";
import { CHECK_LEGAL_DISCLAIMER_FOOTER } from "@/components/checks/checkLegalCopy";
import { CheckBerechnungshinweis } from "@/components/checks/CheckBerechnungshinweis";
import { CheckKontaktBeforeSubmitBlock, CheckKontaktLeadLine } from "@/components/checks/CheckKontaktLegalFields";
import { CheckLoader } from "@/components/checks/CheckLoader";
import { CheckKitResultGrid } from "@/components/checks/CheckKitResultGrid";
import { CHECKKIT2026, CHECKKIT_HERO_TITLE_TYPO } from "@/lib/checkKitStandard2026";
import { MaklerFirmaAvatarInitials } from "@/components/checks/MaklerFirmaAvatarInitials";
(() => { const s=document.createElement("style");s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{height:100%;background:#fff;font-family:var(--font-sans),'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}button,input,select{font-family:inherit;border:none;background:none;cursor:pointer;}input,select{cursor:text;}::-webkit-scrollbar{display:none;}*{scrollbar-width:none;}@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}.fade-in{animation:fadeIn 0.28s ease both;}button:active{opacity:0.75;}a{text-decoration:none;}`;document.head.appendChild(s);})();
// ─── Screen 1: gruppierte Ereignisse (UI-ID → matrixKey in MATRIX) ────────────
const EVENT_GROUPS = [
  {
    title: "Job & Karriere 💼",
    items: [
      { id: "jobwechsel", matrixKey: "jobwechsel", icon: "💼", label: "Jobwechsel / Karrieresprung", sub: "Neuer Arbeitgeber oder Beförderung." },
      { id: "selbststaendig", matrixKey: "selbst", icon: "🚀", label: "Start in die Selbstständigkeit", sub: "Gründung, Freelancing oder Gewerbe." },
      { id: "berufsstart", matrixKey: "berufsstart", icon: "🎓", label: "Berufsabschluss / Erster Job", sub: "Ende von Studium oder Ausbildung." },
    ],
  },
  {
    title: "Familie & Leben 🏠",
    items: [
      { id: "nachwuchs", matrixKey: "nachwuchs", icon: "🍼", label: "Nachwuchs / Familienzuwachs", sub: "Geburt, Adoption oder Familienplanung." },
      { id: "heirat", matrixKey: "heirat", icon: "💍", label: "Hochzeit / Zusammenzug", sub: "Partnerschaft rechtlich absichern." },
      { id: "trennung", matrixKey: "trennung", icon: "💔", label: "Trennung / Umzug (Single)", sub: "Haushaltssplittung oder Scheidung." },
    ],
  },
  {
    title: "Wohnen & Werte 🔑",
    items: [
      { id: "immobilie", matrixKey: "immobilie", icon: "🏠", label: "Immobilienkauf / Hausbau", sub: "Kauf, Bau oder große Sanierung." },
      { id: "umzug_miete", matrixKey: "umzug", icon: "📦", label: "Umzug (Miete)", sub: "Neue Wohnung, neue Hausrat-Werte." },
      { id: "investition", matrixKey: "investition", icon: "⚡", label: "Große Anschaffung", sub: "PV-Anlage, E-Auto oder Haustier." },
    ],
  },
  {
    title: "Sonstiges",
    items: [
      { id: "keines", matrixKey: null, icon: "✓", label: "Keines der genannten", sub: "Aktuell keine dieser Veränderungen — wir überspringen die Detailfragen." },
      { id: "sonstiges", matrixKey: null, icon: "✳️", label: "Sonstiges", sub: "Andere Veränderung ohne feste Kategorie." },
    ],
  },
];

const EVENT_ITEM_BY_ID = Object.fromEntries(EVENT_GROUPS.flatMap((g) => g.items.map((it) => [it.id, it])));

const SPECIAL_EVENT_IDS = new Set(["keines", "sonstiges"]);
const JOB_EVENT_IDS = new Set(["jobwechsel", "selbststaendig", "berufsstart"]);
const WOHN_EVENT_IDS = new Set(["immobilie", "umzug_miete", "investition"]);
const FAM_EVENT_IDS = new Set(["nachwuchs", "heirat", "trennung"]);

/** Detail-Screen nur bei mindestens einem „qualifizierbaren“ Ereignis (nicht nur keines/sonstiges). */
function needsQualificationScreen(selIds) {
  const substantive = selIds.filter((id) => !SPECIAL_EVENT_IDS.has(id));
  if (substantive.length === 0) return false;
  return substantive.some((id) => JOB_EVENT_IDS.has(id) || WOHN_EVENT_IDS.has(id) || FAM_EVENT_IDS.has(id));
}

function emptyKontext() {
  return {
    housingStatus: "",
    employmentStatus: "",
    familyStatus: "",
    netIncome: null,
    housingSize: null,
    householdCount: null,
  };
}

/** Anzeige-Name je Matrix-Key (Ergebnis „Anlass“) */
const MATRIX_KEY_LABEL = {
  selbst: "Selbstständigkeit",
  jobwechsel: "Jobwechsel / Karrieresprung",
  berufsstart: "Berufsabschluss / Erster Job",
  immobilie: "Immobilienkauf / Hausbau",
  umzug: "Umzug (Miete)",
  nachwuchs: "Nachwuchs / Familienzuwachs",
  heirat: "Hochzeit / Zusammenzug",
  investition: "Große Anschaffung",
  trennung: "Trennung / Umzug (Single)",
};

/**
 * Trigger-Hierarchie bei Mehrfachauswahl (pro Cluster nur ein Matrix-Trigger):
 * Einkommen: selbststaendig > jobwechsel > berufsstart
 * Wohnen: immobilie > umzug_miete
 * Haftung: nachwuchs > heirat > investition
 * trennung: immer zusätzlich, wenn gewählt (eigenes Matrix-Segment)
 */
function resolveTriggerMatrixIds(selectedUiIds) {
  const sel = new Set(selectedUiIds.filter((id) => !SPECIAL_EVENT_IDS.has(id)));
  const out = [];
  const add = (key) => {
    if (key && !out.includes(key)) out.push(key);
  };

  if (sel.has("selbststaendig")) add("selbst");
  else if (sel.has("jobwechsel")) add("jobwechsel");
  else if (sel.has("berufsstart")) add("berufsstart");

  if (sel.has("immobilie")) add("immobilie");
  else if (sel.has("umzug_miete")) add("umzug");

  if (sel.has("nachwuchs")) add("nachwuchs");
  else if (sel.has("heirat")) add("heirat");
  else if (sel.has("investition")) add("investition");

  if (sel.has("trennung")) add("trennung");

  return out;
}

// ─── MATRIX — bestandsabhängig + kontextbewusst ───────────────────────────────
// Jeder Eintrag: p=Produktname, tVorhanden=Text wenn vorhanden, tNeu=Text wenn fehlt,
// h=dringend, condition={housingStatus?,employmentStatus?,familyStatus?}
const MATRIX={
  umzug:{
    b:[
      {p:"Hausratversicherung",h:true,tVorhanden:"Neue Adresse und ca. {housingSize} m² Wohnfläche melden — Versicherungssumme orientierend ca. {hausratSummeOrientierung} € prüfen und Unterversicherungsverzicht-Klausel abstimmen.",tNeu:"Hausratversicherung abschließen — schützt Ihr Hab und Gut am neuen Ort."},
      {p:"Wohngebäudeversicherung",h:true,tVorhanden:"Auf neues Objekt umschreiben — Elementarschutz prüfen.",tNeu:"Wohngebäudeversicherung ist Pflicht bei Immobilienbesitz.",condition:{housingStatus:"eigentuemer"}},
      {p:"Kfz-Versicherung",h:false,tVorhanden:"Neue Adresse melden — Regionalklasse kann sich ändern und die Prämie beeinflussen.",tNeu:"Kfz-Versicherung für Ihr Fahrzeug abschließen."},
    ],
    n:[
      {p:"Rechtsschutzversicherung",h:false,tNeu:"Mietrechtliche Streitigkeiten sind häufig — Rechtsschutz schützt Sie."},
    ]
  },
  heirat:{
    b:[
      {p:"Privathaftpflicht",h:true,tVorhanden:"Mit {householdCount} Personen im Haushalt: Partner und Familie in der Privathaftpflicht aufnehmen — Umstellung auf Familien-Tarif prüfen.",tNeu:"Familienhaftpflicht abschließen — schützt Sie und Ihren Partner."},
      {p:"Risikolebensversicherung",h:true,tVorhanden:"Bezugsrecht auf Partner prüfen und Versicherungssumme anpassen.",tNeu:"Gegenseitige Absicherung — jetzt essenziell."},
    ],
    n:[
      {p:"Rechtsschutzversicherung",h:false,tNeu:"Familienrechtsschutz deckt Streitigkeiten rund um Ehe und Unterhalt."},
      {p:"Riester-Rente",h:false,tNeu:"Als Ehepaar können beide Riester nutzen — Zulagen doppelt mitnehmen."},
    ]
  },
  nachwuchs:{
    b:[
      {p:"Risikolebensversicherung",h:true,tVorhanden:"Deine Risikolebensversicherung sollte an deine neue familiäre Situation angepasst werden.",tNeu:"Mit einem Kind ist eine finanzielle Absicherung deiner Familie besonders wichtig."},
      {p:"Berufsunfähigkeitsversicherung",h:true,tVorhanden:"Prüfe, ob deine BU-Rente ausreichend ist, um deine Familie abzusichern.",tNeu:"Deine Arbeitskraft ist jetzt die wichtigste finanzielle Grundlage für deine Familie."},
      {p:"Krankenhauszusatzversicherung",h:false,tVorhanden:"Deine Gesundheitsabsicherung kann für deine Familie erweitert werden.",tNeu:"Zusätzliche Gesundheitsleistungen können für dein Kind sinnvoll sein."},
      {p:"Privathaftpflicht",h:true,tVorhanden:"Mit {householdCount} Personen im Haushalt: Kind in die Familienhaftpflicht aufnehmen — Umstellung auf Familien-Tarif ist typischerweise notwendig.",tNeu:"Familienhaftpflicht abschließen — Kinder haften selbst nicht, Sie schon."},
    ],
    n:[
      {p:"Pflegezusatzversicherung",h:false,tNeu:"Eine frühzeitige Absicherung im Pflegefall kann langfristig sinnvoll sein."},
      {p:"Altersvorsorge / private Rentenversicherung",h:false,tNeu:"Mit einem Kind steigt die Bedeutung einer stabilen Altersvorsorge."},
    ]
  },
  kfz:{
    b:[
      {p:"Kfz-Versicherung",h:true,tVorhanden:"Neues Fahrzeug anmelden, Kasko-Stufe und SF-Klasse prüfen.",tNeu:"Kfz-Versicherung für das neue Fahrzeug abschließen."},
    ],
    n:[
      {p:"E-Bike / Fahrrad",h:true,tNeu:"E-Bikes sind nicht automatisch über Hausrat versichert — separate Police prüfen."},
    ]
  },
  jobwechsel:{
    b:[
      {p:"Berufsunfähigkeitsversicherung",h:true,tVorhanden:"Bei {netIncome} € Netto monatlich sollte Ihre BU-Rente mindestens ca. {buMin} € betragen — prüfen Sie den Anpassungsbedarf; Ihre aktuelle Absicherung reicht vermutlich nicht mehr aus.",tNeu:"Mit höherem Einkommen wächst die Lücke: Als Orientierung oft mind. {buMin} € BU-Rente bei {netIncome} € Netto — jetzt absichern oder erhöhen."},
      {p:"Krankentagegeld",h:true,tVorhanden:"Ihr Schutz muss zu {netIncome} € Netto passen — Krankentagegeld und Leistungshöhe prüfen.",tNeu:"Ohne ausreichendes Krankentagegeld kann dein Einkommen bei Krankheit deutlich sinken."},
      {p:"Altersvorsorge / private Rentenversicherung",h:true,tVorhanden:"Bei {netIncome} € Netto können Sparraten und steuerliche Spielräume steigen — Altersvorsorge anpassen.",tNeu:"Ein höheres Einkommen bietet die Chance, gezielt Vermögen aufzubauen."},
    ],
    n:[
      {p:"Private Krankenversicherung (PKV)",h:false,tNeu:"Mit höherem Einkommen kann ein Wechsel in die PKV eine Option sein – abhängig von deiner Situation.",condition:{employmentStatus:"angestellt"}},
      {p:"Sparen & Investieren",h:false,tNeu:"Ein Teil deines höheren Einkommens kann gezielt für Vermögensaufbau genutzt werden."},
    ]
  },
  elternzeit:{
    b:[
      {p:"Krankentagegeld",h:true,tVorhanden:"Während der Elternzeit ruht der KTG-Anspruch in der Regel — prüfe mit deiner Versicherung, ob Beiträge angepasst oder ausgesetzt werden können.",tNeu:"Ohne KTG besteht nach der Elternzeit beim Wiedereinstieg kein Schutz — vor allem für Selbstständige ist der Abschluss vor der Geburt wichtig."},
      {p:"Berufsunfähigkeitsversicherung",h:true,tVorhanden:"BU-Schutz bleibt in der Elternzeit bestehen — prüfe ob Beitragsstundung möglich ist und ob die Nachversicherungsgarantie bei Geburt genutzt werden kann.",tNeu:"Jetzt abschließen ist wichtig: Nach der Elternzeit steigt das Eintrittsalter und es folgen neue Gesundheitsfragen — Schutz wird teurer oder schwieriger."},
      {p:"Altersvorsorge / private Rentenversicherung",h:false,tVorhanden:"Deine Altersvorsorge sollte überprüft werden, da Beiträge während der Elternzeit reduziert sein können.",tNeu:"Während der Elternzeit entstehen oft Lücken in der Altersvorsorge."},
    ],
    n:[
      {p:"Risikolebensversicherung",h:true,tNeu:"Mit einem Kind steigt die finanzielle Verantwortung – eine Risikolebensversicherung kann sinnvoll sein."},
    ]
  },
  selbst:{
    b:[
      {p:"Berufsunfähigkeitsversicherung",h:true,tVorhanden:"Bei {netIncome} € Netto (Selbstständigkeit): BU-Rente sollte in der Größenordnung von ca. {buMin} € geprüft werden — Vertrag und Nachversicherung klären.",tNeu:"Kein gesetzlicher BU-Schutz mehr — jetzt absichern."},
      {p:"Krankentagegeld",h:true,tVorhanden:"Tagessatz an {netIncome} € Netto anpassen — als Selbstständiger kein gesetzliches Krankengeld.",tNeu:"Ab Tag 1 kein Krankengeld mehr — Krankentagegeld ist existenziell."},
    ],
    n:[
      {p:"Rürup-Rente",h:true,tNeu:"Rürup ist ideal für Selbstständige — bis 27.566 € jährlich steuerlich absetzbar (2025)."},
      {p:"Pflegezusatzversicherung",h:false,tNeu:"Eigene Pflegevorsorge aufbauen — kein gesetzliches Sicherheitsnetz mehr."},
    ]
  },
  immobilie:{
    b:[
      {p:"Wohngebäudeversicherung",h:true,tVorhanden:"Auf neues Objekt umschreiben — Elementarschutz und Versicherungssumme prüfen.",tNeu:"Wohngebäudeversicherung ist Pflicht — ohne sie keine Finanzierung."},
      {p:"Risikolebensversicherung",h:true,tVorhanden:"Versicherungssumme auf aktuellen Darlehensbetrag prüfen und anpassen.",tNeu:"Immobilienfinanzierung absichern — Darlehen läuft auch wenn Sie sterben."},
      {p:"Hausratversicherung",h:false,tVorhanden:"Ca. {housingSize} m² und Wertsachen melden — Summe orientierend ca. {hausratSummeOrientierung} € (Faustformel) gegen Unterversicherung und Klauseln prüfen.",tNeu:"Hausrat für neue Immobilie abschließen."},
    ],
    n:[
      {p:"Rechtsschutzversicherung",h:false,tNeu:"Eigentümerrechtsschutz deckt Streitigkeiten mit Mietern, Handwerkern und Behörden."},
    ]
  },
  berufsstart:{
    b:[
      {p:"Berufsunfähigkeitsversicherung",h:true,tVorhanden:"Bei {netIncome} € Netto zum Berufsstart: BU-Rente zielend auf mind. ca. {buMin} € prüfen — früh absichern ist günstiger.",tNeu:"Zu Berufsbeginn BU prüfen — Gesundheitsprüfung ist meist noch unkompliziert, Prämien niedriger."},
      {p:"Krankentagegeld",h:true,tVorhanden:"Krankentagegeld an {netIncome} € Netto und neues Beschäftigungsverhältnis anpassen.",tNeu:"Krankentagegeld zum Berufsstart absichern — Lücke nach Ende des gesetzlichen Krankengelds schließen."},
      {p:"Altersvorsorge / private Rentenversicherung",h:false,tVorhanden:"Auch kleine Sparraten am Anfang wirken über Jahrzehnte — Vertrag auf Einstieg prüfen.",tNeu:"Jetzt mit Altersvorsorge starten — Zeit arbeitet für dich."},
    ],
    n:[
      {p:"Sparen & Investieren",h:false,tNeu:"Erste Gehälter gezielt anlegen — Notgroschen und langfristiger Aufbau parallel denken."},
    ]
  },
  trennung:{
    b:[
      {p:"Privathaftpflicht",h:true,tVorhanden:"Getrennte Haushalte — mitversicherte Personen und Adressen in der Haftpflicht anpassen.",tNeu:"Eigene Privathaftpflicht für den neuen Haushalt abschließen."},
      {p:"Risikolebensversicherung",h:true,tVorhanden:"Bezugsberechtigung und Versicherungssumme nach Trennung neu ordnen.",tNeu:"Risikoleben an die neue finanzielle Verantwortung anpassen."},
      {p:"Hausratversicherung",h:true,tVorhanden:"Neue Anschrift und geteiltes Inventar melden — bei ca. {housingSize} m² Summe orientierend ca. {hausratSummeOrientierung} € prüfen, Unterversicherung vermeiden.",tNeu:"Hausrat für den eigenen Haushalt neu abschließen oder umschreiben."},
    ],
    n:[
      {p:"Rechtsschutzversicherung",h:false,tNeu:"Unterhalts- und Scheidungsfragen — Familienrechtsschutz kann entlasten."},
    ]
  },
  investition:{
    b:[
      {p:"Privathaftpflicht",h:true,tVorhanden:"Neue Risiken prüfen — z. B. Hund, E-Auto oder höhere Schadenssummen bei wertvoller Anschaffung.",tNeu:"Privathaftpflicht erweitern oder abschließen — greift u. a. bei Schäden durch Haustier oder Fahrzeug."},
      {p:"Hausratversicherung",h:true,tVorhanden:"Anschaffungen melden — bei ca. {housingSize} m² Versicherungssumme orientierend ca. {hausratSummeOrientierung} € und Unterversicherungsverzicht mit der Versicherung abstimmen.",tNeu:"Hausrat an neue Werte anpassen — PV-Komponenten und teure Geräte abdecken."},
      {p:"Kfz-Versicherung",h:true,tVorhanden:"Neues Fahrzeug anmelden, Kasko-Stufe und SF-Klasse prüfen.",tNeu:"Kfz-Versicherung für das neue Fahrzeug abschließen."},
    ],
    n:[
      {p:"E-Bike / Fahrrad",h:true,tNeu:"E-Bikes und teure Räder sind oft nicht vollständig über den Standard-Hausrat abgedeckt — Zusatzbaustein prüfen."},
    ]
  },
  pflege:{
    b:[
      {p:"Pflegezusatzversicherung",h:true,tVorhanden:"Eigene Absicherung prüfen — Pflegefall im Umfeld erhöht Bewusstsein für eigenes Risiko.",tNeu:"Pflegelücke analysieren — gesetzlich werden nur ca. 50% der echten Kosten gedeckt."},
    ],
    n:[
      {p:"Rechtsschutzversicherung",h:false,tNeu:"Pflegerechtliche Streitigkeiten nehmen zu — Rechtsschutz kann entlasten."},
      {p:"Vorsorgevollmacht / Patientenverfügung",h:false,tNeu:"Nicht direkt Versicherung, aber essenziell: Vorsorgevollmacht und Patientenverfügung regeln."},
    ]
  },
};

function enrichMatrixText(t, kontext) {
  if (!t || typeof t !== "string") return t;
  let s = t;
  const ni = kontext.netIncome;
  if (ni != null && ni > 0) {
    const buMin = Math.round(ni * 0.8);
    s = s.replace(/\{netIncome\}/g, String(ni));
    s = s.replace(/\{buMin\}/g, String(buMin));
  }
  const hs = kontext.housingSize;
  if (hs != null && hs > 0) {
    s = s.replace(/\{housingSize\}/g, String(hs));
    const hausratSum = Math.round(hs * 650);
    s = s.replace(/\{hausratSummeOrientierung\}/g, String(hausratSum));
  }
  const hc = kontext.householdCount;
  if (hc != null && hc > 0) {
    s = s.replace(/\{householdCount\}/g, String(hc));
  }
  s = s.replace(/\{netIncome\}/g, "Ihr angegebenes Netto");
  s = s.replace(/\{buMin\}/g, "ca. 80 % davon");
  s = s.replace(/\{housingSize\}/g, "Ihrer");
  s = s.replace(/\{hausratSummeOrientierung\}/g, "eine zur Wohnfläche passende");
  s = s.replace(/\{householdCount\}/g, "Ihrem Haushalt");
  return s;
}

// ─── EMPF-LOGIK — bestandsabhängig + kontextbewusst ──────────────────────────
function buildEmpfehlungen(events, prods, kontext) {
  const prodSet = new Set(prods);
  const anpassen = []; // vorhanden → anpassen
  const abschliessen = []; // nicht vorhanden → neu
  const ergaenzen = [];    // n-Liste

  for (const eid of events) {
    const m = MATRIX[eid];
    if (!m) continue;
    const ereignisLabel = MATRIX_KEY_LABEL[eid] || eid;

    // b-Liste: Bestandsanpassungen
    for (const item of (m.b || [])) {
      // Kontext-Bedingung prüfen
      if (item.condition) {
        const { housingStatus, employmentStatus, familyStatus } = item.condition;
        if (housingStatus && kontext.housingStatus !== housingStatus) continue;
        if (employmentStatus && kontext.employmentStatus !== employmentStatus) continue;
        if (familyStatus && kontext.familyStatus !== familyStatus) continue;
      }
      const vorhanden = prodSet.has(item.p);
      const ziel = vorhanden ? anpassen : abschliessen;
      // Pro Produkt nur ein Eintrag (Trigger-Hierarchie: erstes / stärkstes Ereignis gewinnt)
      if (!ziel.find((x) => x.p === item.p)) {
        const raw = vorhanden ? item.tVorhanden : item.tNeu;
        ziel.push({
          p: item.p,
          t: enrichMatrixText(raw, kontext),
          h: item.h,
          vorhanden,
          ereignis: ereignisLabel,
        });
      }
    }

    // n-Liste: Ergänzungen (nur wenn Produkt noch nicht vorhanden)
    for (const item of (m.n || [])) {
      if (item.condition) {
        const { housingStatus, employmentStatus, familyStatus } = item.condition;
        if (housingStatus && kontext.housingStatus !== housingStatus) continue;
        if (employmentStatus && kontext.employmentStatus !== employmentStatus) continue;
        if (familyStatus && kontext.familyStatus !== familyStatus) continue;
      }
      if (!prodSet.has(item.p) && !ergaenzen.find(x => x.p === item.p)) {
        ergaenzen.push({ p: item.p, t: enrichMatrixText(item.tNeu, kontext), h: item.h, ereignis: ereignisLabel });
      }
    }
  }

  // Sortierung: dringend zuerst
  const sortH = arr => [...arr.filter(x => x.h), ...arr.filter(x => !x.h)];
  return { anpassen: sortH(anpassen), abschliessen: sortH(abschliessen), ergaenzen };
}

/** Ergebnis-Spalten: Existenzschutz & Person vor Sach/Verkehr (Anker-Sortierung) */
const JAHRES_RESULT_PRODUCT_PRIO = [
  "Berufsunfähigkeitsversicherung",
  "Erwerbsunfähigkeitsversicherung",
  "Krankentagegeld",
  "Risikolebensversicherung",
  "Privathaftpflicht",
  "Private Krankenversicherung (PKV)",
  "Altersvorsorge / private Rentenversicherung",
  "Riester-Rente",
  "Rürup-Rente",
  "Pflegezusatzversicherung",
  "Krankenhauszusatzversicherung",
  "Zahnzusatzversicherung",
  "Hausratversicherung",
  "Wohngebäudeversicherung",
  "Kfz-Versicherung",
  "Rechtsschutzversicherung",
  "E-Bike / Fahrrad",
  "Sparen & Investieren",
  "Vorsorgevollmacht / Patientenverfügung",
];

function sortJahresResultItems(items) {
  return [...items].sort((a, b) => {
    const ia = JAHRES_RESULT_PRODUCT_PRIO.indexOf(a.p);
    const ib = JAHRES_RESULT_PRODUCT_PRIO.indexOf(b.p);
    const ra = ia === -1 ? 1000 : ia;
    const rb = ib === -1 ? 1000 : ib;
    if (ra !== rb) return ra - rb;
    return a.p.localeCompare(b.p, "de");
  });
}

function jahresResultProductIcon(p) {
  const s = String(p);
  if (/Berufsunfähigkeit|Erwerbsunfähigkeit/i.test(s)) return "💼";
  if (/Krankentagegeld/i.test(s)) return "📋";
  if (/Risikoleben/i.test(s)) return "❤️";
  if (/Altersvorsorge|Riester|Rürup|Sparen/i.test(s)) return "🌱";
  if (/Privathaftpflicht|Haftpflicht/i.test(s)) return "🛡️";
  if (/Rechtsschutz/i.test(s)) return "⚖️";
  if (/PKV|Krankenversicherung/i.test(s)) return "⚕️";
  if (/Krankenhaus|Zahn/i.test(s)) return "🦷";
  if (/Pflege/i.test(s)) return "🏥";
  if (/Hausrat/i.test(s)) return "🛋️";
  if (/Wohngebäude/i.test(s)) return "🏡";
  if (/Kfz|Fahrrad|E-Bike/i.test(s)) return "🚗";
  if (/Vorsorgevollmacht|Patientenverfügung/i.test(s)) return "📄";
  return "📌";
}


function makeJahresCheckT(C){return{page:{minHeight:"100vh",background:"#fff","--accent":C,fontFamily:"var(--font-sans), 'Helvetica Neue', Helvetica, Arial, sans-serif"},header:{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid rgba(31,41,55,0.06)",padding:"0 24px",height:"56px",display:"flex",alignItems:"center",justifyContent:"space-between"},logo:{display:"flex",alignItems:"center",gap:"10px"},logoMk:{width:"28px",height:"28px",borderRadius:"6px",background:C,display:"flex",alignItems:"center",justifyContent:"center"},badge:{fontSize:"11px",fontWeight:"500",color:"#888",letterSpacing:"0.3px",textTransform:"uppercase"},prog:{height:"2px",background:"rgba(31,41,55,0.08)"},progFil:(w)=>({height:"100%",width:`${w}%`,background:C,transition:"width 0.4s ease"}),hero:{padding:"32px 24px 16px"},eyebrow:{fontSize:"11px",fontWeight:"600",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"6px"},h1:{fontSize:"22px",color:"#111",lineHeight:1.25,...CHECKKIT_HERO_TITLE_TYPO},body:{fontSize:"14px",color:"#666",lineHeight:1.65,marginTop:"6px"},section:{padding:"0 24px",marginBottom:"20px"},divider:{height:"1px",background:"#f0f0f0",margin:"0 24px 20px"},card:{border:"1px solid #e8e8e8",borderRadius:"18px",overflow:"hidden"},row:{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"},rowLast:{padding:"14px 16px"},fldLbl:{fontSize:"12px",fontWeight:"600",color:"#444",display:"block",marginBottom:"8px"},fldHint:{fontSize:"11px",color:"#aaa",marginTop:"6px"},footer:{position:"sticky",bottom:0,background:"rgba(255,255,255,0.88)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderTop:"1px solid rgba(31,41,55,0.06)",boxShadow:"0 -6px 20px rgba(17,24,39,0.05)",padding:"14px 24px max(28px, env(safe-area-inset-bottom, 28px))"},btnPrim:(d)=>({width:"100%",padding:"13px 20px",background:d?"#e8e8e8":C,color:d?"#aaa":"#fff",borderRadius:"999px",fontSize:"14px",fontWeight:"600",cursor:d?"default":"pointer",letterSpacing:"-0.1px",boxShadow:d?"none":"0 8px 20px rgba(26,58,92,0.18)"}),btnSec:{width:"100%",padding:"10px",color:"#aaa",fontSize:"13px",marginTop:"6px",cursor:"pointer"},infoBox:{padding:"12px 14px",background:"#F6F8FE",border:"1px solid #DCE6FF",borderRadius:"14px",fontSize:"12px",color:"#315AA8",lineHeight:1.6},hinweisCardWrap:{border:"1px solid rgba(26,58,92,0.15)",borderLeft:`3px solid ${C}`,borderRadius:"0 14px 14px 0",overflow:"hidden",background:"#fff"},inputEl:{width:"100%",padding:"10px 12px",border:"1px solid #e8e8e8",borderRadius:"6px",fontSize:"14px",color:"#111",background:"#fff",outline:"none"},
resultHero:{padding:"52px 24px 40px",textAlign:"center",background:"#fff"},
resultHeroWarm:{padding:"40px 24px 32px",textAlign:"center",background:"#ffffff",borderBottom:"1px solid rgba(17,24,39,0.06)"},
resultH1:{fontSize:"24px",color:"#111827",lineHeight:1.25,marginBottom:"10px",maxWidth:"420px",marginLeft:"auto",marginRight:"auto",...CHECKKIT_HERO_TITLE_TYPO},
resultLead:{fontSize:"14px",color:"#6B7280",lineHeight:1.55,maxWidth:"380px",marginLeft:"auto",marginRight:"auto",marginBottom:"20px"},
resultEyebrow:{fontSize:"12px",fontWeight:"500",color:"#9CA3AF",letterSpacing:"0.2px",marginBottom:"14px"},
resultNumber:(C2)=>({fontSize:"52px",fontWeight:"800",color:C2,letterSpacing:"-2.5px",lineHeight:1,marginBottom:"8px"}),
resultUnit:{fontSize:"14px",color:"#9CA3AF",marginBottom:"18px"},
statusWarn:{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:"#FFF6F5",border:"1px solid #F2D4D0",borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:"#C0392B"},
statusOk:{display:"inline-flex",alignItems:"center",gap:"5px",padding:"5px 13px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:"#15803D"},
statusInfo:(C2)=>({display:"inline-flex",alignItems:"center",gap:"5px",padding:"6px 14px",background:`${C2}14`,border:`1px solid ${C2}33`,borderRadius:"999px",fontSize:"12px",fontWeight:"600",color:C2}),
cardPrimary:{border:"1px solid rgba(17,24,39,0.08)",borderRadius:"20px",overflow:"hidden",background:"#FFFFFF",boxShadow:"0 6px 24px rgba(17,24,39,0.08)"},
cardContext:{background:"#FAFAF8",border:"1px solid rgba(17,24,39,0.05)",borderRadius:"16px",padding:"18px 20px"},
warnCard:{background:"rgba(192,57,43,0.025)",border:"1px solid rgba(192,57,43,0.27)",borderLeft:"3px solid #c0392b",borderRadius:"18px",padding:"14px 16px"},
sectionLbl:{fontSize:"13px",fontWeight:"600",color:"#6B7280",marginBottom:"12px"},
};}

// ─── Screen 3: Bestand nach „Ordnern“ (Mehrfachauswahl → matrixNames fürs Cross-Check) ──
/** Extern optional: sessionStorage.setItem(JAHRES_BESTAND_PREFILL_KEY, JSON.stringify(["bu","kv",…])) */
export const JAHRES_BESTAND_PREFILL_KEY = "checkkit_jahrescheck_bestand_prefill";

const PRODUKT_GROUPS = [
  {
    id: "einkommen",
    title: "Einkommen & Vorsorge",
    emoji: "💰",
    items: [
      { id: "bu", name: "Berufsunfähigkeit (BU)", icon: "💼", matrixNames: ["Berufsunfähigkeitsversicherung", "Erwerbsunfähigkeitsversicherung"] },
      { id: "altersvorsorge", name: "Altersvorsorge (Rente / ETF)", icon: "🌱", matrixNames: ["Altersvorsorge / private Rentenversicherung", "Riester-Rente", "Rürup-Rente"] },
      { id: "risikoleben", name: "Risikolebensversicherung (RLV)", icon: "❤️", matrixNames: ["Risikolebensversicherung"] },
      { id: "krankentagegeld", name: "Krankentagegeld (KTG)", icon: "📋", matrixNames: ["Krankentagegeld"] },
    ],
  },
  {
    id: "haftung",
    title: "Haftung & Recht",
    emoji: "⚖️",
    items: [
      { id: "haftpflicht", name: "Privathaftpflicht (PH)", icon: "🛡️", matrixNames: ["Privathaftpflicht"] },
      { id: "rechtsschutz", name: "Rechtsschutz (RS)", icon: "📜", matrixNames: ["Rechtsschutzversicherung"] },
      { id: "tierhalter", name: "Tierhalterhaftpflicht (THH)", icon: "🐕", matrixNames: [] },
    ],
  },
  {
    id: "wohnen",
    title: "Eigentum & Wohnen",
    emoji: "🏠",
    items: [
      { id: "hausrat", name: "Hausratversicherung (HR)", icon: "🛋️", matrixNames: ["Hausratversicherung"] },
      { id: "wohngebaeude", name: "Wohngebäudeversicherung (WG)", icon: "🏡", matrixNames: ["Wohngebäudeversicherung"] },
    ],
  },
  {
    id: "gesundheit",
    title: "Gesundheit",
    emoji: "🏥",
    items: [
      { id: "kv", name: "Private Krankenversicherung (PKV)", icon: "⚕️", matrixNames: ["Private Krankenversicherung (PKV)"] },
      { id: "zahn_stationaer", name: "Zahnzusatz / Stationär (KH-Zusatz)", icon: "🦷", matrixNames: ["Krankenhauszusatzversicherung", "Zahnzusatzversicherung"] },
    ],
  },
];

const ALL_PRODUKT_ITEMS = PRODUKT_GROUPS.flatMap((g) => g.items);
const PRODUKT_ITEM_BY_ID = Object.fromEntries(ALL_PRODUKT_ITEMS.map((p) => [p.id, p]));

function buildProdsFromBestandIds(ids) {
  return ALL_PRODUKT_ITEMS.filter((p) => ids.includes(p.id)).flatMap((p) => p.matrixNames);
}
export default function JahresCheck(){
  const MAKLER=useCheckConfig();
  const C=MAKLER.primaryColor;
  const T=useMemo(()=>makeJahresCheckT(C),[C]);
  const isDemo = isCheckDemoMode();
  const[phase,setPhase]=useState(1);const[ak,setAk]=useState(0);const[danke,setDanke]=useState(false);const[loading,setLoading]=useState(false);
  const[prods,setProds]=useState([]);
  const[kontaktConsent,setKontaktConsent]=useState(false);
  const[fd,setFd]=useState({name:"",email:"",tel:""});
  const[kontext,setKontext]=useState(emptyKontext);
  const[scr,setScr]=useState(1);
  const[selEventIds,setSelEventIds]=useState([]);
  const[selProdukte,setSelProdukte]=useState([]);
  const toggleEvent=(id)=>{
    setSelEventIds((p)=>{
      if(id==="keines")return p.includes("keines")?[]:["keines"];
      const w=p.filter((x)=>x!=="keines");
      return w.includes(id)?w.filter((x)=>x!==id):[...w,id];
    });
  };
  const toggleProdukt = (prodId) => {
    const prod = PRODUKT_ITEM_BY_ID[prodId];
    if (!prod) return;
    setSelProdukte((p) => {
      const next = p.includes(prodId) ? p.filter((x) => x !== prodId) : [...p, prodId];
      setProds(buildProdsFromBestandIds(next));
      return next;
    });
  };
  const goTo=(ph)=>{setAk(k=>k+1);setPhase(ph);if(ph===1){setLoading(false);setScr(1);}};
  const qualNeeded=useMemo(()=>needsQualificationScreen(selEventIds),[selEventIds]);
  const showQualIncome=useMemo(()=>selEventIds.some((id)=>JOB_EVENT_IDS.has(id)),[selEventIds]);
  const showQualHousing=useMemo(()=>selEventIds.some((id)=>WOHN_EVENT_IDS.has(id)),[selEventIds]);
  const showQualHousehold=useMemo(()=>selEventIds.some((id)=>FAM_EVENT_IDS.has(id)),[selEventIds]);
  const qualFormComplete=useMemo(()=>{
    if(!qualNeeded)return true;
    const okI=!showQualIncome||(kontext.netIncome!=null&&kontext.netIncome>=1);
    const okW=!showQualHousing||(kontext.housingSize!=null&&kontext.housingSize>=1);
    const okF=!showQualHousehold||(kontext.householdCount!=null&&kontext.householdCount>=1);
    return okI&&okW&&okF;
  },[qualNeeded,showQualIncome,showQualHousing,showQualHousehold,kontext.netIncome,kontext.housingSize,kontext.householdCount]);
  const wizardProgPct=useMemo(()=>{
    if(qualNeeded)return scr<=1?33.33:scr===2?66.66:100;
    return scr===1?50:100;
  },[qualNeeded,scr]);
  useEffect(()=>{
    if(scr!==2)return;
    setKontext((x)=>{
      const n={...x};
      if(showQualIncome&&n.netIncome==null)n.netIncome=2500;
      if(showQualHousing&&n.housingSize==null)n.housingSize=75;
      if(showQualHousehold&&n.householdCount==null)n.householdCount=2;
      return n;
    });
  },[scr,showQualIncome,showQualHousing,showQualHousehold]);
  const resolvedMatrixEvents=useMemo(()=>resolveTriggerMatrixIds(selEventIds),[selEventIds]);
  const E=useMemo(()=>buildEmpfehlungen(resolvedMatrixEvents,prods,kontext),[resolvedMatrixEvents,prods,kontext]);
  const nextScr=()=>{
    if(scr===1){if(qualNeeded)setScr(2);else setScr(3);return;}
    if(scr===2){if(!qualFormComplete)return;setScr(3);return;}
    if(scr===3)setLoading(true);
  };
  const backScr=()=>{
    if(scr===3){if(qualNeeded)setScr(2);else setScr(1);return;}
    if(scr===2)setScr(1);
  };
  const backFromResult=()=>{
    setAk((k)=>k+1);
    setPhase(1);
    setLoading(false);
    setScr(needsQualificationScreen(selEventIds)?2:3);
  };
  const bestandPrefillConsumedRef = useRef(false);
  useEffect(() => {
    if (scr === 1) bestandPrefillConsumedRef.current = false;
  }, [scr]);
  useEffect(() => {
    if (scr !== 3 || bestandPrefillConsumedRef.current) return;
    if (typeof window === "undefined") return;
    bestandPrefillConsumedRef.current = true;
    try {
      const raw = sessionStorage.getItem(JAHRES_BESTAND_PREFILL_KEY);
      if (!raw) return;
      const ids = JSON.parse(raw);
      if (!Array.isArray(ids) || ids.length === 0) return;
      const valid = [...new Set(ids)].filter((id) => PRODUKT_ITEM_BY_ID[id]);
      if (valid.length === 0) return;
      setSelProdukte((prev) => {
        if (prev.length > 0) return prev;
        setProds(buildProdsFromBestandIds(valid));
        return valid;
      });
    } catch {
      /* ignore */
    }
  }, [scr]);
  useCheckScrollToTop([phase, ak, danke, scr, loading]);

  function Header({ phase, total }) {
    const pct = total > 0 ? (phase / total) * 100 : 0;
    return (
      <>
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(31,41,55,0.06)",
            padding: "16px 20px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: C,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(26,58,92,0.2)",
            }}
          >
            <MaklerFirmaAvatarInitials firma={MAKLER.firma} />
          </div>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#1F2937",
              letterSpacing: "-0.1px",
              textAlign: "center",
            }}
          >
            {MAKLER.firma}
          </span>
        </div>
        <div style={{ height: "6px", background: "rgba(31,41,55,0.08)" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: C,
              borderRadius: "999px",
              transition: "width 0.35s ease",
            }}
          />
        </div>
      </>
    );
  }

  if(danke)return(
    <div style={T.page}><Header phase={100} total={100} />
    <div style={{padding:"48px 24px",textAlign:"center"}} className="fade-in">
      <div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${C}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4.5 4.5L16 6" stroke={C} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      <div style={{fontSize:"20px",fontWeight:"700",color:"#111",marginBottom:"8px"}}>{fd.name?`Danke, ${fd.name.split(" ")[0]}.`:"Anfrage gesendet."}</div>
      <div style={{fontSize:"14px",color:"#666",lineHeight:1.65,marginBottom:"32px"}}>Wir schauen uns dein Ergebnis an und melden uns innerhalb von 24 Stunden mit konkreten nächsten Schritten.</div>
      <div style={{border:"1px solid #e8e8e8",borderRadius:"10px",overflow:"hidden",textAlign:"left"}}><div style={{padding:"14px 16px",borderBottom:"1px solid #f0f0f0"}}><div style={{fontSize:"14px",fontWeight:"600",color:"#111"}}>{MAKLER.name}</div><div style={{fontSize:"12px",color:"#888",marginTop:"1px"}}>{MAKLER.firma}</div></div><div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:"8px"}}><a href={`tel:${MAKLER.telefon}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.telefon}</a><a href={`mailto:${MAKLER.email}`} style={{fontSize:"13px",color:C,fontWeight:"500"}}>{MAKLER.email}</a></div></div>
      <button onClick={()=>{setDanke(false);setSelEventIds([]);setSelProdukte([]);setProds([]);setKontext(emptyKontext());goTo(1);}} style={{marginTop:"20px",fontSize:"13px",color:"#aaa",cursor:"pointer"}}>Neuen Check starten</button>
    </div></div>
  );

  if(loading)return(
    <div style={T.page} key={ak}>
      <Header phase={100} total={100} />
      <CheckLoader
        type="jahrescheck"
        checkmarkColor={C}
        title="Ihr Check-up-Bericht wird erstellt…"
        jahresContext={{
          netIncome: kontext.netIncome,
          housingSize: kontext.housingSize,
          householdCount: kontext.householdCount,
        }}
        onComplete={() => {
          setLoading(false);
          goTo(3);
        }}
      />
    </div>
  );

  // Phase 4: Kontakt
  if(phase===4){
    const valid=fd.name.trim()&&fd.email.trim()&&kontaktConsent;
    return(<div style={T.page} key={ak} className="fade-in">
      <Header phase={100} total={100} />
      <div style={T.hero}><div style={T.eyebrow}>Fast geschafft</div><div style={T.h1}>Wo können wir dich erreichen?</div><div style={T.body}>Wir melden uns innerhalb von 24 Stunden mit deinem Ergebnis.</div></div>
      {isDemo ? (
        <>
          <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
            <div style={{ fontSize: "13px", color: "#999", marginBottom: "16px" }}>
              Das ist eine Live-Vorschau — so sieht Ihr Kunde die Microsite.
            </div>
            <button
              type="button"
              style={{ ...T.btnPrim(false) }}
              onClick={() =>
                window.parent.postMessage(
                  { type: "openConfig", slug: "lebenssituations-check" },
                  "*",
                )
              }
            >
              Anpassen & kaufen
            </button>
          </div>
          <div style={T.footer}><button type="button" style={T.btnSec} onClick={()=>goTo(3)}>Zurück</button></div>
        </>
      ) : (
      <>
      <div style={T.section}>
        <CheckKontaktLeadLine />
        <div style={T.card}>
          {[{k:"name",l:"Dein Name",t:"text",ph:"Vor- und Nachname",req:true},{k:"email",l:"Deine E-Mail",t:"email",ph:"deine@email.de",req:true},{k:"tel",l:"Deine Nummer",t:"tel",ph:"Optional",req:false,hint:"Optional — für eine schnellere Rückmeldung"}].map(({k,l,t,ph,req,hint},i,arr)=>(
              <div key={k} style={i<arr.length-1?T.row:T.rowLast}><label style={T.fldLbl}>{l}{req?" *":""}</label><input type={t} placeholder={ph} value={fd[k]} onChange={e=>setFd(f=>({...f,[k]:e.target.value}))} style={{...T.inputEl,marginTop:"4px"}}/>{hint&&<div style={T.fldHint}>{hint}</div>}</div>
            ))}
        </div>
        <div style={{marginTop:"14px",marginBottom:"100px"}}>
          <CheckKontaktBeforeSubmitBlock maklerName={MAKLER.name} consent={kontaktConsent} onConsentChange={setKontaktConsent} />
        </div>
      </div>
      <div style={T.footer}><button style={T.btnPrim(!valid)} onClick={async ()=>{if(!valid)return;const token=new URLSearchParams(window.location.search).get("token");if(token){await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,slug:"lebenssituations-check",kundenName:fd.name,kundenEmail:fd.email,kundenTel:fd.tel||""})}).catch(()=>{});}setDanke(true);}} disabled={!valid}>{valid?"Situation gemeinsam prüfen":"Bitte alle Angaben machen"}</button><button style={T.btnSec} onClick={()=>goTo(3)}>Zurück</button></div>
      </>
      )}
    </div>);
  }

  // ── Phase 3: Ergebnis — Hero + 3-Spalten-Grid + „bereits gesichert“ ────────
  if (phase === 3) {
    const akut = sortJahresResultItems(E.abschliessen.filter((x) => x.h));
    const optimierung = sortJahresResultItems([...E.anpassen]);
    const ergaenzung = sortJahresResultItems([
      ...E.ergaenzen,
      ...E.abschliessen.filter((x) => !x.h),
    ]);
    const totalCount = akut.length + optimierung.length + ergaenzung.length;

    const actionNames = new Set(
      [...akut, ...optimierung, ...ergaenzung].map((i) => i.p),
    );
    const bereitsGesichert = prods.filter((p) => !actionNames.has(p));

    const eventChipIds = selEventIds.filter((id) => id !== "keines");

    const totalAnpassungen = E.anpassen.length + E.abschliessen.length;
    const kpiJetztWichtig = akut.length;
    const kpiPruefen = optimierung.length;
    const kpiOptional = ergaenzung.length;
    const kpiVal = (n) => (n === 0 ? "—" : n);
    const kpiJetztWarn = kpiJetztWichtig > 0;

    const ResultColumnCard = ({ item, accentColor }) => (
      <div style={CHECKKIT2026.resultCard}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: `${accentColor}14`,
              border: `1px solid ${accentColor}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              lineHeight: 1,
              flexShrink: 0,
            }}
            aria-hidden
          >
            {jahresResultProductIcon(item.p)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#111827",
                lineHeight: 1.3,
                marginBottom: "8px",
              }}
            >
              {item.p}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#4B5563",
                lineHeight: 1.6,
                marginBottom: "8px",
              }}
            >
              {item.t}
            </div>
            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Anlass: {item.ereignis}</div>
          </div>
        </div>
      </div>
    );

    const ResultColumn = ({ sectionLbl, sectionLblColor, title, subtitle, emoji, bg, accent, items }) => (
      <div
        style={{
          ...CHECKKIT2026.resultColumnStack,
          background: bg,
          border: "1px solid rgba(17,24,39,0.1)",
          borderRadius: 18,
          boxShadow: "0 4px 18px rgba(17,24,39,0.06)",
        }}
      >
        <div style={{ marginBottom: "2px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: sectionLblColor,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: "8px",
              lineHeight: 1.35,
            }}
          >
            {sectionLbl}
          </div>
          <div style={{ fontSize: "13px", fontWeight: "800", color: "#1F2937", letterSpacing: "-0.2px" }}>
            {emoji} {title}
          </div>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280", marginTop: "4px" }}>{subtitle}</div>
        </div>
        {items.length === 0 ? (
          <div style={{ fontSize: "12px", color: "#9CA3AF", lineHeight: 1.5, fontStyle: "italic", padding: "8px 4px" }}>
            In dieser Kategorie aktuell nichts.
          </div>
        ) : (
          items.map((item, i) => <ResultColumnCard key={`${item.p}-${item.ereignis}-${i}`} item={item} accentColor={accent} />)
        )}
      </div>
    );

    return (
      <div style={T.page} key={ak} className="fade-in">
        <Header phase={88} total={100} />

        {/* Hero — H1, Zahl, Chips */}
        <div style={T.resultHeroWarm}>
          <div style={T.resultH1}>Ihr persönlicher Check-up-Bericht</div>
          <div style={T.resultNumber(totalCount > 0 ? C : "#059669")}>{totalCount === 0 ? "✓" : totalCount}</div>
          <div style={T.resultLead}>
            {totalCount === 0
              ? "Keine Handlungsempfehlungen aus Ihren Angaben abgeleitet — Sie können dennoch freiwillig prüfen."
              : "Handlungsempfehlungen basierend auf Ihren Veränderungen."}
          </div>
          {eventChipIds.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "center",
                maxWidth: "440px",
                margin: "0 auto 8px",
              }}
            >
              {eventChipIds.map((id) => {
                const ev = EVENT_ITEM_BY_ID[id];
                return ev ? (
                  <div
                    key={id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      background: "#fff",
                      border: "1px solid rgba(17,24,39,0.1)",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#374151",
                      boxShadow: "0 1px 3px rgba(17,24,39,0.06)",
                    }}
                  >
                    <span style={{ fontSize: "15px", lineHeight: 1 }}>{ev.icon}</span>
                    <span>{ev.label}</span>
                  </div>
                ) : null;
              })}
            </div>
          )}

          <div
            style={{
              margin: "20px 20px 0",
              padding: "14px 16px",
              background: `color-mix(in srgb, ${C} 6%, white)`,
              borderRadius: "18px",
              border: `1px solid ${C}20`,
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: C,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Dein Ergebnis
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              {[
                { l: "Jetzt wichtig", v: kpiVal(kpiJetztWichtig), warn: kpiJetztWarn },
                { l: "Prüfen", v: kpiVal(kpiPruefen), warn: false },
                { l: "Optional", v: kpiVal(kpiOptional), warn: false },
              ].map(({ l, v, warn }, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    background: warn ? "#FFF7F7" : "#ffffff",
                    borderRadius: "10px",
                    border: warn ? "1px solid #F2CFCF" : "1px solid rgba(17,24,39,0.06)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: warn ? "#B83232" : C,
                      letterSpacing: "-0.4px",
                    }}
                  >
                    {v}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#9CA3AF",
                      marginTop: "2px",
                      fontWeight: "500",
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.55 }}>
              {totalAnpassungen === 0 && E.ergaenzen.length === 0
                ? "Deine Verträge sind aktuell — beim nächsten Gespräch prüfen wir Details."
                : `${totalAnpassungen > 0 ? `${totalAnpassungen} Anpassungen` : ""}${totalAnpassungen > 0 && E.ergaenzen.length > 0 ? " und " : ""}${E.ergaenzen.length > 0 ? `${E.ergaenzen.length} neue Themen` : ""} auf Basis deiner Situation.`}
            </div>
          </div>
        </div>

        {/* 3-Spalten-Grid (Desktop) / Stack (schmal) — nur bei mindestens einer Empfehlung */}
        {totalCount > 0 && (
          <div style={{ ...T.section, marginTop: "8px" }}>
            <CheckKitResultGrid style={{ gap: 18 }}>
              <ResultColumn
                sectionLbl="Das sollten Sie jetzt prüfen"
                sectionLblColor="#c0392b"
                title="Existenz / Pflicht"
                subtitle="Akuter Bedarf"
                emoji="🔴"
                bg="#ffffff"
                accent="#C0392B"
                items={akut}
              />
              <ResultColumn
                sectionLbl="Das ist für Ihre Situation relevant"
                sectionLblColor={C}
                title="Wichtiger Standard"
                subtitle="Anpassen im Bestand"
                emoji="🟡"
                bg="#ffffff"
                accent="#D97706"
                items={optimierung}
              />
              <ResultColumn
                sectionLbl="Das kann zusätzlich sinnvoll sein"
                sectionLblColor="#6B7280"
                title="Optional / Plus"
                subtitle="Ergänzung"
                emoji="⚪"
                bg="#ffffff"
                accent="#6B7280"
                items={ergaenzung}
              />
            </CheckKitResultGrid>
          </div>
        )}

        {totalCount === 0 && (
          <div style={{ ...T.section, marginTop: "4px" }}>
            <div style={T.infoBox}>Gut so — aus dieser Matrix ergeben sich aktuell keine weiteren Pflichtpunkte. Ein Beratungsgespräch kann trotzdem Lücken aufdecken.</div>
          </div>
        )}

        {/* Bereits gesichert (kein Handlungsbedarf laut Matrix) */}
        {bereitsGesichert.length > 0 && (
          <div style={T.section}>
            <div style={T.sectionLbl}>Bereits gesichert</div>
            <div
              style={{
                ...T.cardContext,
                background: "#ffffff",
                borderColor: "rgba(17,24,39,0.08)",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#6B7280", marginBottom: "12px", opacity: 0.92 }}>
                Hier sind Sie bereits bestens aufgestellt.
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {bereitsGesichert.map((name) => (
                  <li
                    key={name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "13px",
                      color: "#6B7280",
                      opacity: 0.72,
                    }}
                  >
                    <span style={{ color: "#9CA3AF", fontSize: "16px", lineHeight: 1 }} aria-hidden>
                      ✓
                    </span>
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div style={{ padding: "0 24px", marginBottom: "120px" }}>
          <div style={T.hinweisCardWrap}>
            <CheckBerechnungshinweis>
              <>
                Die Empfehlungen basieren auf einer <strong>Ereignis-Matrix</strong>: definierte Prüfpunkte pro Anlass, sortiert nach Dringlichkeit. Bei mehreren gewählten Ereignissen gilt pro Cluster eine <strong>Trigger-Hierarchie</strong> (z. B. Selbstständigkeit vor Jobwechsel vor Berufsstart; Immobilie vor Miet-Umzug; Nachwuchs vor Hochzeit vor großer Anschaffung), damit dieselbe Empfehlung nicht mehrfach erscheint.{" "}
                <span style={{ color: "#b8884a" }}>Grundlage: Anlassbezogene Beratungsempfehlungen. Keine individuelle Rechtsberatung.</span>
              </>
            </CheckBerechnungshinweis>
            <div
              style={{
                ...T.infoBox,
                borderLeft: "none",
                borderRadius: "0 0 14px 0",
                marginTop: 0,
                borderTop: "1px solid rgba(26,58,92,0.12)",
              }}
            >
              {CHECK_LEGAL_DISCLAIMER_FOOTER}
            </div>
          </div>
        </div>
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={() => goTo(4)}>Situation gemeinsam prüfen</button>
          <button style={T.btnSec} onClick={backFromResult}>Zurück</button>
        </div>
      </div>
    );
  }


  // ── Phase 1: Eingabe (Ereignisse → optional Qualifizierung → Bestand) ─────
  const stepperBtn = (d) => ({
    width: 40,
    height: 40,
    borderRadius: 10,
    border: `1px solid ${d ? "#e5e7eb" : C}`,
    background: d ? "#f3f4f6" : "#fff",
    color: d ? "#9ca3af" : C,
    fontSize: 20,
    fontWeight: 700,
    cursor: d ? "default" : "pointer",
    lineHeight: 1,
  });
  return (
    <div style={T.page} key={ak} className="fade-in">
      <Header phase={wizardProgPct} total={100} />

      {/* Screen 1: Was hat sich verändert? */}
      {scr === 1 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>Lebenssituations-Check · Schritt 1</div>
          <div style={T.h1}>Was hat sich bei Ihnen verändert?</div>
          <div style={T.body}>Alles Zutreffende auswählen — mehreres möglich.</div>
        </div>
        <div style={{ padding: "0 20px", marginBottom: "16px" }}>
          {EVENT_GROUPS.map((group, gi) => (
            <div key={group.title}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#9CA3AF",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginTop: gi === 0 ? 0 : 22,
                  marginBottom: 10,
                  padding: "0 4px",
                }}
              >
                {group.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {group.items.map((ev) => {
                  const sel = selEventIds.includes(ev.id);
                  return (
                    <SelectionCard
                      key={ev.id}
                      value={ev.id}
                      label={ev.label}
                      description={ev.sub}
                      icon={<span style={{ fontSize: "22px", lineHeight: 1 }}>{ev.icon}</span>}
                      selected={sel}
                      accent={C}
                      onClick={() => toggleEvent(ev.id)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "0 20px", marginBottom: "120px" }}>
          <div style={T.infoBox}>Nichts Zutreffendes dabei? Einfach weitergehen — wir prüfen ob Ihre Absicherung noch passt.</div>
          {selEventIds.length > 0 && (
            <div style={{ marginTop: "8px", fontSize: "12px", color: C, fontWeight: "500", textAlign: "center" }}>
              {selEventIds.length} Ereignis{selEventIds.length !== 1 ? "se" : ""} ausgewählt
            </div>
          )}
        </div>
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={nextScr}>
            Weiter{selEventIds.length > 0 ? ` · ${selEventIds.length} ausgewählt` : ""}
          </button>
        </div>
      </>}

      {/* Screen 2: Qualifizierung (nur wenn Job-/Wohn-/Familie-Events) */}
      {scr === 2 && qualNeeded && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>Lebenssituations-Check · Schritt 2</div>
          <div style={T.h1}>Details zu Ihren Veränderungen</div>
          <div style={T.body}>Nur die passenden Angaben — wir nutzen sie für konkrete Formulierungen im Ergebnis.</div>
        </div>
        <div style={{ padding: "0 20px", marginBottom: "120px" }}>
          {showQualIncome && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Einkommen & Beruf</div>
              <div style={T.card}>
                <div style={T.rowLast}>
                  <label style={T.fldLbl}>Ihr neues monatliches Netto-Einkommen?</label>
                  <SliderCard
                    label="Netto pro Monat (ca.)"
                    value={kontext.netIncome ?? 2500}
                    min={500}
                    max={12000}
                    step={50}
                    unit="€"
                    display={`${kontext.netIncome ?? 2500} €`}
                    accent={C}
                    onChange={(v) => setKontext((x) => ({ ...x, netIncome: v }))}
                  />
                  <div style={{ ...T.fldHint, marginTop: 10 }}>Dient der Orientierung für BU, Krankentagegeld und Vorsorge-Hinweise im Ergebnis.</div>
                </div>
              </div>
            </div>
          )}
          {showQualHousing && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Wohnraum</div>
              <div style={T.card}>
                <div style={T.rowLast}>
                  <label style={T.fldLbl}>Wie groß ist die neue Wohnfläche ca.?</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={10}
                      max={500}
                      step={1}
                      placeholder="z. B. 85"
                      value={kontext.housingSize ?? ""}
                      onChange={(e) => {
                        const v = e.target.value === "" ? null : Number(e.target.value);
                        setKontext((x) => ({ ...x, housingSize: v === null || Number.isNaN(v) ? null : v }));
                      }}
                      style={{ ...T.inputEl, flex: 1, maxWidth: 160 }}
                    />
                    <span style={{ fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>m²</span>
                  </div>
                  <div style={{ ...T.fldHint, marginTop: 10 }}>Für Hausrat-Hinweise zu Summe und Unterversicherungsverzicht.</div>
                </div>
              </div>
            </div>
          )}
          {showQualHousehold && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Familie</div>
              <div style={T.card}>
                <div style={T.rowLast}>
                  <label style={T.fldLbl}>Anzahl der im Haushalt lebenden Personen?</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button
                      type="button"
                      aria-label="Weniger"
                      style={stepperBtn((kontext.householdCount ?? 2) <= 1)}
                      disabled={(kontext.householdCount ?? 2) <= 1}
                      onClick={() =>
                        setKontext((x) => ({
                          ...x,
                          householdCount: Math.max(1, (x.householdCount ?? 2) - 1),
                        }))
                      }
                    >
                      −
                    </button>
                    <span style={{ fontSize: "22px", fontWeight: 800, color: "#111", minWidth: 36, textAlign: "center" }}>
                      {kontext.householdCount ?? 2}
                    </span>
                    <button
                      type="button"
                      aria-label="Mehr"
                      style={stepperBtn((kontext.householdCount ?? 2) >= 12)}
                      disabled={(kontext.householdCount ?? 2) >= 12}
                      onClick={() =>
                        setKontext((x) => ({
                          ...x,
                          householdCount: Math.min(12, (x.householdCount ?? 2) + 1),
                        }))
                      }
                    >
                      +
                    </button>
                  </div>
                  <div style={{ ...T.fldHint, marginTop: 10 }}>Z. B. für Familien-Tarif in der Privathaftpflicht.</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={T.footer}>
          <button style={T.btnPrim(!qualFormComplete)} disabled={!qualFormComplete} onClick={nextScr}>
            {qualFormComplete ? "Weiter zum Bestand" : "Bitte alle angezeigten Felder prüfen"}
          </button>
          <button style={T.btnSec} onClick={backScr}>Zurück</button>
        </div>
      </>}

      {/* Screen 3: Bestand — gruppierte Mehrfachauswahl (Cross-Check mit S1 + S2) */}
      {scr === 3 && <>
        <div style={T.hero}>
          <div style={T.eyebrow}>Lebenssituations-Check · {qualNeeded ? "Schritt 3" : "Schritt 2"}</div>
          <div style={T.h1}>Ihr aktueller Schutz</div>
          <div style={T.body}>Gehen Sie in Gedanken Ordner oder Apps durch — alles antippen, das Sie bereits abgesichert haben.</div>
        </div>
        <div style={{ padding: "0 20px", marginBottom: "16px" }}>
          {PRODUKT_GROUPS.map((group, gi) => (
            <div key={group.id}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#9CA3AF",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginTop: gi === 0 ? 0 : 22,
                  marginBottom: 10,
                  padding: "0 4px",
                }}
              >
                {group.title} {group.emoji}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {group.items.map((prod) => {
                  const sel = selProdukte.includes(prod.id);
                  return (
                    <SelectionCard
                      key={prod.id}
                      value={prod.id}
                      label={prod.name}
                      icon={<span style={{ fontSize: "22px", lineHeight: 1 }}>{prod.icon}</span>}
                      selected={sel}
                      accent={C}
                      onClick={() => toggleProdukt(prod.id)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "0 20px", marginBottom: "120px" }}>
          <div style={T.infoBox}>
            Ohne Auswahl gehen wir von „noch nicht gemeldet“ aus — dann zeigen wir eher <strong>Lücken</strong> (🔴). Mit Treffern sehen Sie eher <strong>Anpassungen</strong> (🟡) zu Ihrem Anlass.
          </div>
          {selProdukte.length > 0 && (
            <div style={{ marginTop: "10px", fontSize: "12px", color: C, fontWeight: "500", textAlign: "center" }}>
              {selProdukte.length} Baustein{selProdukte.length !== 1 ? "e" : ""} als vorhanden markiert
            </div>
          )}
        </div>
        <div style={T.footer}>
          <button style={T.btnPrim(false)} onClick={nextScr}>Analyse starten</button>
          <button style={T.btnSec} onClick={backScr}>Zurück</button>
        </div>
      </>}
    </div>
  );
}
