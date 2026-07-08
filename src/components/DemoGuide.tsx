// Guided persona walkthrough for the sales-rep → attorney lifecycle demo (Northwind Energy
// multi-agreement deal). Rebalanced to foreground the AGENTIC (chat-driven) flow: most major
// moves — ticket intake, opening a deal, playbook creation/editing, template creation, send-back,
// execution — are triggered by real chat prompts through sendToAgent, with a following step that
// guarantees the resulting screen is in view. A few connective steps (queue, DPA/SOW, notifications,
// commenting) stay manual, since that's the honest current shape of the app and a live demo
// benefits from the contrast: "the agent gets you there, a human still does the work."
// Everything here drives the REAL app via real store actions/chat — nothing is a separate mockup.
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, X, RotateCcw, Bot } from 'lucide-react'
import { useStore } from '@/store'
import { sendToAgent } from '@/agent/engine'
import { Markdown } from '@/components/Markdown'

interface DemoStep {
  persona: string // user id — whose seat we're in for this step
  agentic?: boolean // true = this step's the "watch the chat do it" beat
  title: string
  body: string
  run: () => void
}

const STEPS: DemoStep[] = [
  {
    persona: 'u_marcus',
    agentic: true,
    title: '1 · Sales rep opens a ticket — by chat',
    body: 'Marcus (Director, Strategic Partnerships) doesn’t click through a form — he just tells the agent. Watch it ask the right follow-up (negotiation vs. general support, then scope, template, counterparty). Feel free to click through it live from here.',
    run: () => { const s = useStore.getState(); s.setPersona('u_marcus'); s.closeCanvas(); sendToAgent('create a ticket') },
  },
  {
    persona: 'u_marcus',
    agentic: true,
    title: '2 · One prompt opens a whole deal',
    body: 'Now, a deal already a few weeks in: **Northwind Energy**, a multi-agreement Charging-as-a-Service partnership. One prompt — no menus.',
    run: () => { const s = useStore.getState(); s.closeCanvas(); sendToAgent('open the northwind deal') },
  },
  {
    persona: 'u_marcus',
    title: '3 · The deal overview it opened',
    body: 'One ticket, three linked documents — MSA, DPA, SOW — each with its own stage and whose court it’s in, plus deal-level discussion. As initiator, this is Marcus’s view.',
    run: () => { useStore.getState().openTicket('TKT-1031') },
  },
  {
    persona: 'u_kirsten',
    title: '4 · It lands in the attorney’s queue',
    body: 'Switching seats to **Kirsten Sachs**, Senior Counsel — the assigned attorney. Northwind is in her **My Open Tickets** queue, with SLA aging visible at a glance.',
    run: () => { const s = useStore.getState(); s.setPersona('u_kirsten'); s.setView('dashboard') },
  },
  {
    persona: 'u_kirsten',
    title: '5 · Redline analysis — the MSA',
    body: 'Opening the Master Services Agreement. The AI has already flagged **2 red lines** against the playbook — an uncapped liability cap and an expanded indemnity scope — each with a recommended disposition (Accept / Counter / Reject).',
    run: () => { useStore.getState().openAgreement('AGR-2180', 'review') },
  },
  {
    persona: 'u_kirsten',
    agentic: true,
    title: '6 · The agent already proposed a playbook fix',
    body: 'This is the moment that usually lands: that same liability pattern was already approved once, on Mondelez — the agent proposed codifying it as a reusable **fallback position** on the MSA playbook. It never applies this itself; it only surfaces the suggestion for a human to decide.',
    run: () => { const s = useStore.getState(); s.closeCanvas(); sendToAgent('review playbook suggestions') },
  },
  {
    persona: 'u_kirsten',
    title: '7 · The suggestion queue — human decides',
    body: 'Here’s the queue it opened. **Approve** adds it to the published playbook, **Reject** discards it, **Defer** holds it. Click Approve live — that’s the human-in-the-loop moment: the agent drafts, an attorney decides.',
    run: () => { useStore.getState().openCanvas({ view: 'playbook', playbookId: 'pb_msa', playbookMode: 'suggestions' }) },
  },
  {
    persona: 'u_kirsten',
    agentic: true,
    title: '8 · Building a brand-new playbook — by chat',
    body: 'The reverse motion: standing up a playbook from nothing, entirely by chat. Point it at a template plus example agreements, and it derives starting positions from how those examples actually resolved each section.',
    run: () => { const s = useStore.getState(); s.closeCanvas(); sendToAgent('create a playbook for our MSA') },
  },
  {
    persona: 'u_kirsten',
    title: '9 · The playbook builder it opened',
    body: '**Analyze examples** derives provisions from the real clause text of your precedent deals; refine any of them by chat (add, remove, re-tier), then publish when it’s ready.',
    run: () => { useStore.getState().openCanvas({ view: 'playbook', playbookMode: 'create' }) },
  },
  {
    persona: 'u_kirsten',
    title: '10 · Other documents, same ticket — the DPA',
    body: 'Same ticket, a different document type, running the other direction: ChargePoint sent Northwind a tightened Data Processing Addendum (shorter sub-processor notice, shorter audit window) and is waiting on their response.',
    run: () => { useStore.getState().navigate({ agreementId: 'AGR-2181', agreementTab: 'review', reviewMode: 'directive' }) },
  },
  {
    persona: 'u_kirsten',
    title: '11 · The SOW — finalized, ready to sign',
    body: 'Fully negotiated, no open tracked changes. This is what a document looks like once it has converged: clean text, ready for execution.',
    run: () => { useStore.getState().navigate({ agreementId: 'AGR-2182', agreementTab: 'review', reviewMode: 'directive' }) },
  },
  {
    persona: 'u_kirsten',
    title: '12 · The attorney gets notified, not just the agent',
    body: 'The moment Northwind’s redline first came back, Kirsten was notified — in-app and by email, right here on the bell. Nothing waits for someone to remember to check.',
    run: () => { useStore.getState().setView('notifications') },
  },
  {
    persona: 'u_kirsten',
    agentic: true,
    title: '13 · Send back — clean copy + redline, by chat',
    body: 'Back on the MSA. This used to only work for one hardcoded demo deal — it’s now context-aware, so saying this while Northwind’s MSA is open assembles **Northwind’s** clean copy + redline, not a different one.',
    run: () => { const s = useStore.getState(); s.openAgreement('AGR-2180', 'review'); s.closeCanvas(); sendToAgent('send back the clean copy and redline to the counterparty') },
  },
  {
    persona: 'u_kirsten',
    title: '14 · The send-back panel it opened',
    body: 'Clean copy, word-level redline vs. their last draft, an optional AI-drafted internal or external summary. Nothing leaves ChargePoint until Kirsten clicks send.',
    run: () => { useStore.getState().openSendBack('AGR-2180') },
  },
  {
    persona: 'u_kirsten',
    title: '15 · Counterparty responds — re-analyzed automatically',
    body: 'This is **v3** — the round after Northwind sent their redline back. Auto-ingested, re-analyzed against the playbook, and landed here ready for review — the same loop that runs every time they send something back.',
    run: () => { const s = useStore.getState(); s.openAgreement('AGR-2180', 'review'); s.navigate({ reviewMode: 'issues' }) },
  },
  {
    persona: 'u_kirsten',
    title: '16 · Comments — reply and resolve, right in the doc',
    body: 'Margin comments anchor to a clause and tag a colleague. Try posting one live, then reply to it in-thread and mark it responded — Google-Docs-style, not a dead Word comment.',
    run: () => { const s = useStore.getState(); s.openAgreement('AGR-2180', 'review'); s.navigate({ reviewMode: 'directive' }) },
  },
  {
    persona: 'u_kirsten',
    agentic: true,
    title: '17 · Building a new template — by chat',
    body: 'One more chat-first flow: standing up a new **form template** from precedent ChargePoint agreements plus third-party market standards — this is what future playbooks get built from.',
    run: () => { const s = useStore.getState(); s.closeCanvas(); sendToAgent('create a new template project') },
  },
  {
    persona: 'u_kirsten',
    title: '18 · The Templates workspace it opened',
    body: 'Point it at precedent + standards, iterate with the agent, save to the library, and build a playbook straight from the finished template.',
    run: () => { useStore.getState().openProjects() },
  },
  {
    persona: 'u_kirsten',
    agentic: true,
    title: '19 · Proceed to execution & signing — by chat',
    body: 'Closing the loop the same way we opened it — one prompt.',
    run: () => { const s = useStore.getState(); s.closeCanvas(); sendToAgent('execute the northwind deal') },
  },
  {
    persona: 'u_kirsten',
    title: '20 · Execute & Sign',
    body: 'The SOW is ready now; the MSA and DPA are still converging. Sign everything together or route documents individually — the agent opens this and tracks it, but it never signs. That’s always a human action.',
    run: () => { useStore.getState().openDealExecution('TKT-1031') },
  },
]

export function DemoGuide() {
  const [i, setI] = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const [hidden, setHidden] = useState(false)
  const users = useStore((s) => s.users)
  const step = STEPS[i]
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
    <div className="fixed bottom-5 right-5 z-[60] w-[400px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-pop">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-900 px-4 py-2.5 text-white">
        <Sparkles size={14} className="text-ai-400" />
        <span className="text-[12.5px] font-bold">Demo guide — step {i + 1} of {STEPS.length}</span>
        <button onClick={() => setCollapsed((c) => !c)} className="ml-auto text-slate-400 hover:text-white">{collapsed ? '▴' : '▾'}</button>
        <button onClick={() => setHidden(true)} className="text-slate-400 hover:text-white"><X size={14} /></button>
      </div>
      {!collapsed && (
        <div className="p-4">
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
