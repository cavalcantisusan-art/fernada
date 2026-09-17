import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] px-5 py-16 text-[#2D3748]">
      <div className="mx-auto max-w-xl rounded-3xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E6FFFA]">
          <CheckCircle2 className="h-10 w-10 text-[#319795]" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Pagamento enviado</h1>
        <p className="mt-4 leading-relaxed text-[#718096]">
          A Stripe recebeu o pagamento. A confirmação final do agendamento é registrada automaticamente assim que o pagamento for confirmado.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/dashboard" className="rounded-xl bg-[#319795] px-6 py-4 font-semibold text-white hover:bg-[#2C7A7B]">
            Ir para minha área
          </Link>
          <Link href="/" className="rounded-xl px-6 py-4 font-medium text-[#4A5568] hover:bg-[#F7FAFC]">
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}
