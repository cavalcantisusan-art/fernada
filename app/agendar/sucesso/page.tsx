import Link from 'next/link';
import { CheckCircle2, Clock3, Mail, ShieldCheck } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] px-5 py-14 text-[#2D3748] sm:py-20">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#E2E8F0] bg-white p-7 shadow-sm sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E6FFFA]">
          <CheckCircle2 className="h-10 w-10 text-[#319795]" />
        </div>
        <div className="text-center">
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#319795]">Pagamento recebido</p>
          <h1 className="mt-2 text-3xl font-bold">Seu agendamento está sendo confirmado</h1>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-[#718096]">
            A Stripe recebeu o pagamento. Assim que a confirmação chegar ao sistema, a consulta aparecerá como confirmada na sua Área da Paciente.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Info icon={<ShieldCheck />} title="Pagamento seguro" text="Processado pela Stripe." />
          <Info icon={<Mail />} title="Confirmação" text="Você poderá receber aviso por e-mail/WhatsApp." />
          <Info icon={<Clock3 />} title="Sala virtual" text="Acesso próximo ao horário marcado." />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard" className="flex-1 rounded-xl bg-[#319795] px-6 py-4 text-center font-semibold text-white hover:bg-[#2C7A7B]">
            Ver minha consulta
          </Link>
          <Link href="/" className="flex-1 rounded-xl border border-[#E2E8F0] px-6 py-4 text-center font-medium text-[#4A5568] hover:bg-[#F7FAFC]">
            Voltar ao início
          </Link>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-[#A0AEC0]">
          O retorno desta página não substitui a confirmação enviada pela Stripe ao servidor. O status final é registrado automaticamente pelo webhook de pagamento.
        </p>
      </div>
    </main>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-[#F7FAFC] p-4 text-center">
      <div className="mx-auto w-fit text-[#319795]">{icon}</div>
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-[#718096]">{text}</p>
    </div>
  );
}
