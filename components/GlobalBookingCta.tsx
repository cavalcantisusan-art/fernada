'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck2 } from 'lucide-react';

export default function GlobalBookingCta() {
  const pathname = usePathname();

  if (pathname.startsWith('/agendar') || pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <Link
      href="/agendar"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#319795] px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-[#2C7A7B]"
      aria-label="Agendar e pagar consulta online"
    >
      <CalendarCheck2 className="h-5 w-5" />
      <span className="hidden sm:inline">Agendar e pagar online</span>
      <span className="sm:hidden">Agendar</span>
    </Link>
  );
}
