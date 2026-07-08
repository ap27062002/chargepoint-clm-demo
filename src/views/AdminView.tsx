import { useState } from 'react'
import { clsx } from 'clsx'
import { UserCog } from 'lucide-react'
import { Card, Avatar, SectionLabel, Button, SearchBox } from '@/components/ui'
import { useStore } from '@/store'
import type { Ticket, User } from '@/types'

// Admin-only: assign a ticket's lead + co-counsel attorneys, and add stakeholders (e.g. sales
// reps) who get read visibility without an assignment. Same underlying action the chat-driven
// "assign TKT-1042 to Kirsten…" agent capability uses (store.assignTicketTeam).
function AssignmentEditor({ ticket, attorneys, users }: { ticket: Ticket; attorneys: User[]; users: User[] }) {
  const assignTicketTeam = useStore((s) => s.assignTicketTeam)
  const [lead, setLead] = useState(ticket.assigned_attorney_id ?? '')
  const [additional, setAdditional] = useState<string[]>(ticket.additional_attorney_ids ?? [])
  const [watchers, setWatchers] = useState<string[]>(ticket.watcher_ids ?? [])
  const toggle = (list: string[], set: (v: string[]) => void, id: string) => set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  const save = () => assignTicketTeam(ticket.id, { leadAttorneyId: lead || null, additionalAttorneyIds: additional, watcherIds: watchers })

  return (
    <Card className="p-4">
      <div className="mb-3">
        <div className="text-[14px] font-bold text-slate-800">{ticket.title}</div>
        <div className="text-[11.5px] text-slate-400">{ticket.id} · {ticket.counterparty_name}</div>
      </div>
      <div className="mb-4">
        <SectionLabel className="mb-1.5">Lead attorney</SectionLabel>
        <select value={lead} onChange={(e) => setLead(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-ai-400">
          <option value="">Unassigned</option>
          {attorneys.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
      <div className="mb-4">
        <SectionLabel className="mb-1.5">Co-counsel — additional lawyers on this ticket</SectionLabel>
        <div className="space-y-0.5">
          {attorneys.filter((a) => a.id !== lead).map((a) => (
            <label key={a.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-slate-700 hover:bg-slate-50">
              <input type="checkbox" checked={additional.includes(a.id)} onChange={() => toggle(additional, setAdditional, a.id)} className="accent-ai-500" />
              <Avatar userId={a.id} size={20} /> {a.name}
            </label>
          ))}
          {attorneys.length <= 1 && <div className="px-2 py-1 text-[12px] text-slate-400">No other attorneys available.</div>}
        </div>
      </div>
      <div className="mb-4">
        <SectionLabel className="mb-1.5">Stakeholders with visibility (e.g. sales reps) — read-only, no assignment</SectionLabel>
        <div className="space-y-0.5">
          {users.filter((u) => u.id !== lead && !additional.includes(u.id)).map((u) => (
            <label key={u.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-slate-700 hover:bg-slate-50">
              <input type="checkbox" checked={watchers.includes(u.id)} onChange={() => toggle(watchers, setWatchers, u.id)} className="accent-ai-500" />
              <Avatar userId={u.id} size={20} /> {u.name} <span className="text-[11px] capitalize text-slate-400">{u.title}</span>
            </label>
          ))}
        </div>
      </div>
      <Button variant="primary" onClick={save}>Save assignment</Button>
    </Card>
  )
}

function AssignmentsTab() {
  const tickets = useStore((s) => s.tickets)
  const users = useStore((s) => s.users)
  const attorneys = users.filter((u) => u.role === 'attorney')
  const [q, setQ] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const ql = q.toLowerCase().trim()
  const filtered = tickets.filter((t) => !ql || t.title.toLowerCase().includes(ql) || t.id.toLowerCase().includes(ql) || t.counterparty_name.toLowerCase().includes(ql))
  const selected = tickets.find((t) => t.id === selectedId) ?? null

  return (
    <div className={clsx('grid max-w-4xl grid-cols-[280px_1fr] gap-4')}>
      <div>
        <SearchBox value={q} onChange={setQ} placeholder="Search tickets…" className="mb-2 w-full" />
        <div className="max-h-[560px] space-y-1 overflow-y-auto">
          {filtered.map((t) => (
            <button key={t.id} onClick={() => setSelectedId(t.id)}
              className={clsx('block w-full rounded-lg px-2.5 py-2 text-left', selectedId === t.id ? 'bg-ai-50 text-ai-700' : 'text-slate-600 hover:bg-slate-50')}>
              <div className="truncate text-[12.5px] font-semibold">{t.title}</div>
              <div className="truncate text-[11px] text-slate-400">{t.id} · {t.counterparty_name}</div>
            </button>
          ))}
          {filtered.length === 0 && <div className="py-4 text-center text-[12px] text-slate-400">No tickets match.</div>}
        </div>
      </div>
      {selected
        ? <AssignmentEditor key={selected.id} ticket={selected} attorneys={attorneys} users={users} />
        : <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 text-[13px] text-slate-400">Select a ticket to manage its assignment.</div>}
    </div>
  )
}

// Trimmed to Dana Whitfield's one real job in this build: routing tickets to a lead attorney
// and giving other stakeholders (e.g. sales reps) read visibility. The other admin surfaces
// (routing strategy, SLAs, approvals, notifications, playbook sources, users, intake,
// adoption, integrations) aren't part of this narrative — cut rather than left half-built.
export function AdminView() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-6 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <UserCog size={18} className="text-slate-400" />
          <h1 className="text-xl font-bold text-slate-800">Console — Ticket Assignments</h1>
        </div>
        <p className="text-[13px] text-slate-500">Assign a lead attorney and give other stakeholders (sales reps, co-counsel) visibility on a ticket.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <AssignmentsTab />
      </div>
    </div>
  )
}
