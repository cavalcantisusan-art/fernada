'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, CheckCircle2, Loader2, LockOpen } from 'lucide-react';

export function AppointmentActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function changeStatus(nextStatus: 'confirmed' | 'cancelled') {
    setLoading(true);
    try {
      const response = await fetch('/api/profissional/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (!response.ok) throw new Error('Falha ao atualizar consulta.');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <span className="inline-flex items-center gap-2 text-sm text-[#718096]"><Loader2 className="h-4 w-4 animate-spin" /> Atualizando</span>;

  return (
    <div className="flex flex-wrap gap-2">
      {status !== 'confirmed' && <button onClick={() => changeStatus('confirmed')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"><CheckCircle2 className="h-4 w-4" /> Confirmar</button>}
      {status !== 'cancelled' && <button onClick={() => changeStatus('cancelled')} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"><Ban className="h-4 w-4" /> Cancelar</button>}
    </div>
  );
}

export function SlotToggle({ date, time, blocked, reason }: { date: string; time: string; blocked: boolean; reason?: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const response = await fetch('/api/profissional/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: blocked ? 'unblock' : 'block',
          appointmentDate: date,
          appointmentTime: time,
          reason: reason || 'Bloqueado pela profissional',
        }),
      });
      if (!response.ok) throw new Error('Falha ao alterar horário.');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button disabled={loading} onClick={toggle} className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold ${blocked ? 'bg-amber-50 text-amber-800 hover:bg-amber-100' : 'bg-[#E6FFFA] text-[#2C7A7B] hover:bg-[#D6F5F1]'}`}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : blocked ? <LockOpen className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
      {blocked ? 'Liberar' : 'Bloquear'}
    </button>
  );
}
