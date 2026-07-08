// Guided persona walkthrough for the sales-rep → attorney lifecycle demo (Northwind Energy
// multi-agreement deal: ticketing → queue → redline analysis → send back → receive back →
// re-analysis → execution/signing). Drives the REAL app via real store actions — nothing here
// is a separate mockup, so anything the presenter clicks off-script still works normally.
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, X, RotateCcw } from 'lucide-react'
import { useStore } from '@/store'
import { Markdown } from '@/components/Markdown'

interface DemoStep {
  persona: string // user id — whose seat we're in for this step
  title: string
  body: string
  run: () => void
}

const STEPS: DemoStep[] = [
  {
    persona: 'u_marcus',
    title: '1 · Sales rep creates a ticket',
    body: 'Marcus (Director, Strategic Partnerships) starts a new deal. On the Dashboard, click **Open Ticket** and walk through the Agreement Negotiation flow — counterparty, template, files. This is the intake moment.',
    run: () => { const s = useStore.getState(); s.setPersona('u_marcus'); s.setView('dashboard') },
  },
  {
    persona: 'u_marcus',
    title: '2 · A deal already in flight — Northwind Energy',
    body: 'Here’s one a few weeks further along: **Northwind Energy**, a multi-agreement Charging-as-a-Service partnership — one ticket, three linked documents (MSA, DPA, SOW). As initiator, Marcus sees the deal overview and can follow the discussion.',
    run: () => { useStore.getState().openTicket('TKT-1031') },
  },
  {
    persona: 'u_kirsten',
    title: '3 · It lands in the attorney’s queue',
    body: 'Switching personas to **Kirsten Sachs**, Senior Counsel — the assigned attorney. Northwind shows up in **My Open Tickets** on her Dashboard, with SLA aging and stage visible at a glance.',
    run: () => { const s = useStore.getState(); s.setPersona('u_kirsten'); s.setView('dashboard') },
  },
  {
    persona: 'u_kirsten',
    title: '4 · Redline analysis — the MSA',
    body: 'Opening the Master Services Agreement. The AI has already flagged **2 red lines** against the playbook — an uncapped liability cap and an expanded indemnity scope — each with a recommended disposition (Accept / Counter / Reject).',
    run: () => { useStore.getState().openAgreement('AGR-2180', 'review') },
  },
  {
    persona: 'u_kirsten',
    title: '5 · The DPA — our outbound redline',
    body: 'Same ticket, a different document type. This one runs the other direction: ChargePoint sent Northwind a tightened Data Processing Addendum (shorter sub-processor notice, shorter audit window) and is waiting on their response.',
    run: () => { useStore.getState().navigate({ agreementId: 'AGR-2181', agreementTab: 'review', reviewMode: 'directive' }) },
  },
  {
    persona: 'u_kirsten',
    title: '6 · The SOW — finalized, ready to sign',
    body: 'The Statement of Work is fully negotiated — no open tracked changes. This is what a document looks like once it has converged: clean text, ready for execution.',
    run: () => { useStore.getState().navigate({ agreementId: 'AGR-2182', agreementTab: 'review', reviewMode: 'directive' }) },
  },
  {
    persona: 'u_kirsten',
    title: '7 · Send back to counterparty',
    body: 'Back on the MSA. Once dispositions are set, Kirsten sends back a clean copy plus a Word-level redline in one step — walk through the Send Back panel.',
    run: () => { useStore.getState().openSendBack('AGR-2180') },
  },
  {
    persona: 'u_kirsten',
    title: '8 · Counterparty responds — re-analyzed automatically',
    body: 'This is **v3** — the round after Northwind sent their redline back. It was auto-ingested, re-analyzed against the playbook, and landed here ready for Kirsten’s review — the same loop that runs every time they send something back.',
    run: () => { const s = useStore.getState(); s.openAgreement('AGR-2180', 'review'); s.navigate({ reviewMode: 'issues' }) },
  },
  {
    persona: 'u_kirsten',
    title: '9 · Proceed to execution & signing',
    body: 'With the SOW final and the MSA/DPA converging, move to **Execute & Sign** — multi-document signing across the whole deal, envelope creation, and completion tracking.',
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
    <div className="fixed bottom-5 right-5 z-[60] w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-pop">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-900 px-4 py-2.5 text-white">
        <Sparkles size={14} className="text-ai-400" />
        <span className="text-[12.5px] font-bold">Demo guide — step {i + 1} of {STEPS.length}</span>
        <button onClick={() => setCollapsed((c) => !c)} className="ml-auto text-slate-400 hover:text-white">{collapsed ? '▴' : '▾'}</button>
        <button onClick={() => setHidden(true)} className="text-slate-400 hover:text-white"><X size={14} /></button>
      </div>
      {!collapsed && (
        <div className="p-4">
          <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-ai-600">{personaName}</div>
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
