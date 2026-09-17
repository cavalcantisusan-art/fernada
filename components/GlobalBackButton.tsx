'use client';

import { ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function GlobalBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/') return null;

  function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/');
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Voltar para a página anterior"
      className="fixed left-4 top-4 z-[80] inline-flex items-center gap-2 rounded-full border border-[#DDE8E7] bg-white/95 px-4 py-2.5 text-sm font-semibold text-[#2D3748] shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:border-[#319795] hover:text-[#319795] sm:left-5 sm:top-5"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar
    </button>
  );
}
