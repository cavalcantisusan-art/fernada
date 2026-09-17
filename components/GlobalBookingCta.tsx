'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck2 } from 'lucide-react';

export default function GlobalBookingCta() {
  const pathname = usePathname();
  const hidden = ['/agendar', '/dashboard', '/profissional', '/sala', '/login'].some((prefix) => pathname.startsWith(prefix));
  if (hidden) return null;

  return (
    <Link
      href="/agendar"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-[#319795] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#2C7A7B] sm:bottom-5 sm:right-5"
      aria-label="Agendar consulta online"
    >
      <CalendarCheck2 className="h-4 w-4" />
      <span>Agendar</span>
    </Link>
  );
}
