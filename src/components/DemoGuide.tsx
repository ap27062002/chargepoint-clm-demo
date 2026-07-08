// Guided, gap-free walkthrough of the full ticket-to-signature lifecycle, in four explicit acts:
//   1. Sales rep (Marcus, initiator) — everything an initiator can do.
//   2. Admin (Dana, administrator) — ticket allocation: assign a lead attorney + give a sales rep
//      visibility as a watcher, both by chat and manually via the Admin Console.
//   3. Attorney (Kirsten) — everything an attorney can do: redline, disposition, direct document
//      editing, comments (add + reply/resolve), suggest-to-playbook, send-back, audit, execution.
//   4. Roles beyond sales & attorney — Eric Batill (playbook_owner) creates AND edits a playbook,
//      both by chat and manually; Priya Anand (contributor) sees exactly what Kirsten tagged her
//      on, closing the loop.
// Every "Agentic" step fires a REAL chat prompt through the real intent engine (sendToAgent) — not
// scripted text. Manual steps are manual because that's genuinely how the app works today (e.g.
// playbook creation/editing requires the playbook_owner capability, which attorneys don't hold —
// routing that through Kirsten would silently fail, so it's Eric's step instead). Nothing here is
// a separate mockup; it drives the real store, so anything can be explored off-script.
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, X, RotateCcw, Bot } from 'lucide-react'
import { useStore } from '@/store'
import { sendToAgent } from '@/agent/engine'
import { Markdown } from '@/components/Markdown'

interface DemoStep {
  phase: string
  persona: string // user id — whose seat we're in for this step
  agentic?: boolean // true = this step's the "watch the chat do it" beat
  title: string
  body: string
  run: () => void
}

const P1 = 'Act 1 — Sales rep'
const P2 = 'Act 2 — Admin: ticket allocation'
const P3 = 'Act 3 — Attorney'
const P4 = 'Act 4 — Beyond sales & attorney'

const STEPS: DemoStep[] = [
  // ---------------------------------------------------------------- ACT 1: SALES REP (Marcus) --
  {
    phase: P1, persona: 'u_marcus', agentic: true,
    title: 'Open a ticket — by chat',
    body: 'Marcus (Director, Strategic Partnerships) doesn’t click through a form — he tells the agent. Watch it ask the right follow-up (negotiation vs. general support, then scope, template, counterparty). Feel free to click through it live from here.',
    run: () => { const s = useStore.getState(); s.setPersona('u_marcus'); s.closeCanvas(); sendToAgent('create a ticket') },
  },
  {
    phase: P1, persona: 'u_marcus', agentic: true,
    title: 'Track my requests — by chat',
    body: 'An initiator’s other core move: checking status without opening anything. This is the same "what\'s on my plate" the agent gives everyone, scoped down to Marcus\'s own tickets.',
    run: () => { const s = useStore.getState(); s.closeCanvas(); sendToAgent("what's on my plate?") },
  },
  {
    phase: P1, persona: 'u_marcus', agentic: true,
    title: 'One prompt opens a whole deal',
    body: 'Now, a deal already a few weeks in: **Northwind Energy**, a multi-agreement Charging-as-a-Service partnership. One prompt — no menus.',
    run: () => { const s = useStore.getState(); s.closeCanvas(); sendToAgent('open the northwind deal') },
  },
  {
    phase: P1, persona: 'u_marcus',
    title: 'The deal overview it opened',
    body: 'One ticket, three linked documents — MSA, DPA, SOW — each with its own stage and whose court it’s in, plus deal-level discussion (Kirsten’s already posted a status update here). This is the full extent of an initiator’s view: he can track and read, not decide.',
    run: () => { useStore.getState().openTicket('TKT-1031') },
  },

  // --------------------------------------------------------- ACT 2: ADMIN — TICKET ALLOCATION --
  {
    phase: P2, persona: 'u_dana',
    title: 'Switching to Legal Ops — Dana Whitfield',
    body: 'Before Kirsten ever sees this deal, someone has to route it to her. **Dana Whitfield**, Legal Operations Lead — the only role with admin authority to allocate tickets.',
    run: () => { const s = useStore.getState(); s.setPersona('u_dana'); s.setView('dashboard') },
  },
  {
    phase: P2, persona: 'u_dana', agentic: true,
    title: 'Assign the ticket — by chat',
    body: 'One line does two things at once: sets the **lead attorney** and gives a **sales rep visibility** without ownership — exactly the "assign to a lawyer, loop in other stakeholders" flow. Kirsten becomes lead; Marcus (who opened it in Act 1) gets read access as a watcher.',
    run: () => { const s = useStore.getState(); s.closeCanvas(); sendToAgent('assign TKT-1031 to Kirsten and loop in Marcus for visibility') },
  },
  {
    phase: P2, persona: 'u_dana',
    title: 'The same thing, manually — the Console',
    body: 'Same capability, form-based: this is **Console**, Dana’s dedicated nav-rail item (only she sees it) — search or select Northwind (TKT-1031), and set lead attorney / additional attorneys / watchers from dropdowns. Useful when you want to review before committing, not just fire a one-line command.',
    run: () => { useStore.getState().setView('admin') },
  },

  // ------------------------------------------------------------------ ACT 3: ATTORNEY (Kirsten) --
  {
    phase: P3, persona: 'u_kirsten',
    title: 'It lands in the attorney’s queue',
    body: 'Switching seats to **Kirsten Sachs**, Senior Counsel — the assigned attorney. Northwind is in her **My Open Tickets** queue, with SLA aging visible at a glance.',
    run: () => { const s = useStore.getState(); s.setPersona('u_kirsten'); s.setView('dashboard') },
  },
  {
    phase: P3, persona: 'u_kirsten',
    title: 'Redline analysis — the MSA',
    body: 'Opening the Master Services Agreement. The AI has already flagged **2 red lines** against the playbook — an uncapped liability cap (§12) and an expanded indemnity scope (§10) — each with a recommended disposition.',
    run: () => { useStore.getState().openAgreement('AGR-2180', 'review') },
  },
  {
    phase: P3, persona: 'u_kirsten',
    title: 'Decide one, live — Counter the liability cap',
    body: 'This is the actual decision-making step, not just viewing. Open §12 and click **Counter** (or Accept/Reject) — this is a real disposition, it resolves the tracked change in the working document immediately.',
    run: () => { const s = useStore.getState(); s.openAgreement('AGR-2180', 'review'); s.navigate({ reviewMode: 'issues' }) },
  },
  {
    phase: P3, persona: 'u_kirsten',
    title: 'Edit the document directly',
    body: 'Switch to the Document tab and click **Edit directly** — this isn’t accept/reject, it’s free-text prose editing right in the clause, recorded as a ChargePoint tracked change. Try tightening a sentence in §8 (Term) live.',
    run: () => { const s = useStore.getState(); s.openAgreement('AGR-2180', 'review'); s.navigate({ reviewMode: 'directive' }) },
  },
  {
    phase: P3, persona: 'u_kirsten',
    title: 'Add a comment, tag a colleague',
    body: 'Highlight any text in the document — a small toolbar appears. Click **Add comment**, write a note, and **@-mention** someone (try **Daniel Vohrer**, Privacy & Data). That posts as a real tagged sign-off request, anchored to that exact clause.',
    run: () => { const s = useStore.getState(); s.openAgreement('AGR-2180', 'review'); s.navigate({ reviewMode: 'directive' }) },
  },
  {
    phase: P3, persona: 'u_kirsten',
    title: 'Reply and resolve — Google-Docs-style',
    body: 'Kirsten already tagged **Priya Anand** (Information Security) on §12 a few days ago — "that is a hard red line for us." Open that thread, **reply** to it in-line, then **mark it responded**. Not a dead Word comment — a real thread, and it closes the loop for Priya later in this walkthrough.',
    run: () => { const s = useStore.getState(); s.openAgreement('AGR-2180', 'review'); s.navigate({ reviewMode: 'directive', reviewFocusRef: '§12' }) },
  },
  {
    phase: P3, persona: 'u_kirsten', agentic: true,
    title: 'Suggest a fix to the playbook — by chat',
    body: 'Attorneys can **propose** playbook changes, but not publish them — that’s Eric’s call, coming up in Act 3. Watch the agent route this to his approval queue instead of just applying it.',
    run: () => { const s = useStore.getState(); s.closeCanvas(); sendToAgent('suggest this to the playbook as a fallback') },
  },
  {
    phase: P3, persona: 'u_kirsten', agentic: true,
    title: 'View the playbook — read only, by chat',
    body: 'Kirsten can open and read the MSA playbook — nested provisions, red lines, rationale — but notice the agent’s own answer: playbook changes require **Playbook Owner approval (Eric Batill)**. That’s not a script — it’s the real permission model talking.',
    run: () => { const s = useStore.getState(); s.closeCanvas(); sendToAgent('show me the msa playbook') },
  },
  {
    phase: P3, persona: 'u_kirsten',
    title: 'Other documents, same ticket — the DPA',
    body: 'Same ticket, a different document type, running the other direction: ChargePoint sent Northwind a tightened Data Processing Addendum (shorter sub-processor notice, shorter audit window) and is waiting on their response.',
    run: () => { useStore.getState().navigate({ agreementId: 'AGR-2181', agreementTab: 'review', reviewMode: 'directive' }) },
  },
  {
    phase: P3, persona: 'u_kirsten',
    title: 'The SOW — finalized, ready to sign',
    body: 'Fully negotiated, no open tracked changes. This is what a document looks like once it has converged: clean text, ready for execution.',
    run: () => { useStore.getState().navigate({ agreementId: 'AGR-2182', agreementTab: 'review', reviewMode: 'directive' }) },
  },
  {
    phase: P3, persona: 'u_kirsten',
    title: 'The attorney gets notified, not just the agent',
    body: 'The moment Northwind’s redline first came back, Kirsten was notified — in-app and by email, right here on the bell. Nothing waits for someone to remember to check.',
    run: () => { useStore.getState().setView('notifications') },
  },
  {
    phase: P3, persona: 'u_kirsten', agentic: true,
    title: 'Send back — clean copy + redline, by chat',
    body: 'Back on the MSA. This used to be hardcoded to a single demo deal — it’s now context-aware, so saying this while Northwind’s MSA is open assembles **Northwind’s** clean copy + redline.',
    run: () => { const s = useStore.getState(); s.openAgreement('AGR-2180', 'review'); s.closeCanvas(); sendToAgent('send back the clean copy and redline to the counterparty') },
  },
  {
    phase: P3, persona: 'u_kirsten',
    title: 'The send-back panel it opened',
    body: 'Clean copy, word-level redline vs. their last draft, an optional AI-drafted internal or external summary. Nothing leaves ChargePoint until Kirsten clicks send.',
    run: () => { useStore.getState().openSendBack('AGR-2180') },
  },
  {
    phase: P3, persona: 'u_kirsten',
    title: 'Counterparty responds — re-analyzed automatically',
    body: 'This is **v3** — the round after Northwind sends something back. Auto-ingested, re-analyzed against the playbook, and landed here ready for review — the same loop that runs every time.',
    run: () => { const s = useStore.getState(); s.openAgreement('AGR-2180', 'review'); s.navigate({ reviewMode: 'issues' }) },
  },
  {
    phase: P3, persona: 'u_kirsten', agentic: true,
    title: 'The audit trail — by chat',
    body: 'Everything just done — dispositions, edits, comments, the send-back — is logged immutably. Ask for it directly instead of hunting for a menu.',
    run: () => { const s = useStore.getState(); s.closeCanvas(); sendToAgent('show me the audit log') },
  },
  {
    phase: P3, persona: 'u_kirsten', agentic: true,
    title: 'Proceed to execution & signing — by chat',
    body: 'Closing Act 2 the same way it opened — one prompt.',
    run: () => { const s = useStore.getState(); s.closeCanvas(); sendToAgent('execute the northwind deal') },
  },
  {
    phase: P3, persona: 'u_kirsten',
    title: 'Execute & Sign',
    body: 'The SOW is ready now; the MSA and DPA are still converging. Sign everything together or route documents individually. The agent opens and tracks this, but it never signs — that’s always a human action.',
    run: () => { useStore.getState().openDealExecution('TKT-1031') },
  },

  // --------------------------------------------------------- ACT 3: BEYOND SALES & ATTORNEY --
  {
    phase: P4, persona: 'u_eric',
    title: 'Switching to the Playbook Owner',
    body: '**Eric Batill**, Associate General Counsel — the only role that can actually publish playbook changes. Everything Kirsten proposed in Act 2 routes here.',
    run: () => { const s = useStore.getState(); s.setPersona('u_eric'); s.setView('dashboard') },
  },
  {
    phase: P4, persona: 'u_eric', agentic: true,
    title: 'Create a playbook — by chat',
    body: 'The same prompt Kirsten couldn’t use in Act 2 — because attorneys don’t hold the playbook_edit capability. From Eric’s seat, it works: point it at a template + example agreements, and it derives starting positions from how those examples actually resolved each section.',
    run: () => { const s = useStore.getState(); s.closeCanvas(); sendToAgent('create a playbook for our MSA') },
  },
  {
    phase: P4, persona: 'u_eric',
    title: 'The playbook builder it opened',
    body: '**Analyze examples** derives provisions from real clause text; refine any of them by chat (add, remove, re-tier), then publish when ready.',
    run: () => { useStore.getState().openCanvas({ view: 'playbook', playbookMode: 'create' }) },
  },
  {
    phase: P4, persona: 'u_eric',
    title: 'Edit an existing playbook — manually',
    body: 'Open the published MSA playbook and click directly into any provision’s text — it’s editable inline, saves on blur. This is the manual path; no chat required.',
    run: () => { useStore.getState().openCanvas({ view: 'playbook', playbookId: 'pb_msa', playbookMode: 'inventory' }) },
  },
  {
    phase: P4, persona: 'u_eric', agentic: true,
    title: 'Edit the same playbook — by chat',
    body: 'And the chat path for the same job: re-tier a provision in plain language instead of clicking through it.',
    run: () => { const s = useStore.getState(); s.closeCanvas(); sendToAgent('make the liability cap provision a red line') },
  },
  {
    phase: P4, persona: 'u_eric',
    title: 'Approve Kirsten’s suggestion — human decides',
    body: 'This is what Kirsten proposed back in Act 2. **Approve** publishes it to the live playbook, **Reject** discards it, **Defer** holds it — Eric’s call alone.',
    run: () => { useStore.getState().openCanvas({ view: 'playbook', playbookId: 'pb_msa', playbookMode: 'suggestions' }) },
  },
  {
    phase: P4, persona: 'u_priya', agentic: true,
    title: 'Switching to a Contributor — Priya’s queue',
    body: '**Priya Anand**, Information Security — a contributor with no ticket ownership, just sign-off requests. Ask what’s on her plate.',
    run: () => { const s = useStore.getState(); s.setPersona('u_priya'); s.closeCanvas(); sendToAgent("what's on my plate?") },
  },
  {
    phase: P4, persona: 'u_priya',
    title: 'Full circle — the exact tag from Act 2',
    body: 'That’s Kirsten’s **§12** tag from Act 2, right where Priya can act on it — one click to the clause. This is the loop closing: an attorney tags a contributor, and it surfaces here without anyone forwarding an email.',
    run: () => { const s = useStore.getState(); s.openAgreement('AGR-2180', 'review'); s.navigate({ reviewMode: 'directive', reviewFocusRef: '§12' }) },
  },
]

export function DemoGuide() {
  const [i, setI] = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const [hidden, setHidden] = useState(false)
  const users = useStore((s) => s.users)
  const step = STEPS[i]
  const prevPhase = i > 0 ? STEPS[i - 1].phase : null
  const personaName = users.find((u) => u.id === step.persona)?.name ?? step.persona

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { STEPS[0].run() }, [])

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, next))
    setI(clamped)
    STEPS[clamped].run()
  }

  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        className="fixed bottom-5 right-5 z-[60] flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-pop hover:bg-slate-800"
      >
        <Sparkles size={13} className="text-ai-400" /> Resume demo guide
      </button>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60] w-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-pop">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-900 px-4 py-2.5 text-white">
        <Sparkles size={14} className="text-ai-400" />
        <span className="text-[12.5px] font-bold">Demo guide — step {i + 1} of {STEPS.length}</span>
        <button onClick={() => setCollapsed((c) => !c)} className="ml-auto text-slate-400 hover:text-white">{collapsed ? '▴' : '▾'}</button>
        <button onClick={() => setHidden(true)} className="text-slate-400 hover:text-white"><X size={14} /></button>
      </div>
      {!collapsed && (
        <div className="p-4">
          {step.phase !== prevPhase && (
            <div className="mb-2 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">{step.phase}</div>
          )}
          <div className="mb-1 flex items-center gap-1.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-ai-600">{personaName}</span>
            {step.agentic && (
              <span className="flex items-center gap-1 rounded-full bg-ai-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ai-700 ring-1 ring-inset ring-ai-500/20">
                <Bot size={10} /> Agentic
              </span>
            )}
          </div>
          <div className="mb-1.5 text-[13.5px] font-bold text-slate-800">{step.title}</div>
          <div className="text-[12.5px] leading-relaxed text-slate-600">
            <Markdown text={step.body} />
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <button onClick={() => go(i - 1)} disabled={i === 0} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-50">
              <ChevronLeft size={13} /> Back
            </button>
            <button onClick={() => go(i + 1)} disabled={i === STEPS.length - 1} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-ai-600 px-2.5 py-1.5 text-[12px] font-semibold text-white disabled:opacity-30 hover:bg-ai-700">
              Next <ChevronRight size={13} />
            </button>
            <button onClick={() => go(0)} title="Restart from step 1" className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50">
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
