import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] px-5 py-10 text-[#2D3748] sm:py-14">
      <article className="mx-auto max-w-3xl rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-10">
        <Link href="/" className="text-sm font-semibold text-[#319795]">← Voltar ao site</Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#319795]">Termos e consentimento</p>
        <h1 className="mt-2 text-3xl font-bold">Termos de Uso e Consentimento para Teleatendimento</h1>
        <p className="mt-3 text-sm text-[#718096]">Última atualização: setembro de 2026.</p>

        <div className="mt-8 space-y-7 leading-relaxed text-[#4A5568]">
          <section><h2 className="text-lg font-bold text-[#2D3748]">1. Finalidade da plataforma</h2><p className="mt-2">A plataforma organiza cadastro, agendamento, pagamento e acesso à sala virtual para consultas online com Fernanda Rabelo. Ela não substitui serviços de emergência, pronto atendimento ou suporte imediato em situações de risco.</p></section>
          <section><h2 className="text-lg font-bold text-[#2D3748]">2. Agendamento e pagamento</h2><p className="mt-2">O horário fica sujeito à disponibilidade e é considerado confirmado após a aprovação do pagamento e atualização do status da consulta. Tentativas de pagamento não concluídas podem liberar o horário novamente.</p></section>
          <section><h2 className="text-lg font-bold text-[#2D3748]">3. Teleatendimento</h2><p className="mt-2">Ao prosseguir, a pessoa declara ciência de que a consulta ocorrerá por videochamada, que dependerá de conexão à internet, câmera e microfone funcionais e ambiente com privacidade adequada. A pessoa pode interromper o uso da videochamada a qualquer momento e conversar com a profissional sobre alternativas quando necessário.</p></section>
          <section><h2 className="text-lg font-bold text-[#2D3748]">4. Privacidade durante a sessão</h2><p className="mt-2">Recomenda-se participar da consulta em ambiente privado e utilizar dispositivo de uso pessoal quando possível. A plataforma não deve ser usada para gravar a sessão sem ciência e concordância das pessoas envolvidas.</p></section>
          <section><h2 className="text-lg font-bold text-[#2D3748]">5. Sala virtual</h2><p className="mt-2">A sala é disponibilizada apenas para contas autorizadas e dentro de uma janela de tempo próxima ao horário marcado. O acesso é individual e não deve ser compartilhado com terceiros.</p></section>
          <section><h2 className="text-lg font-bold text-[#2D3748]">6. Cancelamentos e remarcações</h2><p className="mt-2">Regras comerciais de cancelamento, reembolso e remarcação devem ser informadas pela profissional ao paciente e podem variar conforme a antecedência, motivo e forma de pagamento. Quando houver reembolso, ele deverá seguir também os prazos e procedimentos do meio de pagamento utilizado.</p></section>
          <section><h2 className="text-lg font-bold text-[#2D3748]">7. Emergências</h2><p className="mt-2">A plataforma não é canal de emergência. Em situação de risco imediato à vida ou à integridade física, procure serviços de emergência disponíveis na sua localidade.</p></section>
          <section><h2 className="text-lg font-bold text-[#2D3748]">8. Consentimento</h2><p className="mt-2">Ao marcar a caixa de aceite durante o agendamento, a pessoa confirma que leu estes termos e a Política de Privacidade e concorda com o uso da plataforma para o teleatendimento e com o tratamento dos dados necessários à execução do serviço.</p></section>
          <section><h2 className="text-lg font-bold text-[#2D3748]">9. Contato</h2><p className="mt-2">Dúvidas podem ser encaminhadas para <a className="font-semibold text-[#319795]" href="mailto:rabelo.fernanda.psi@gmail.com">rabelo.fernanda.psi@gmail.com</a>.</p></section>
          <section className="rounded-2xl bg-[#F7FAFC] p-5 text-sm"><strong>Importante:</strong> estes termos são um texto-base para a operação da plataforma e devem ser revisados pela profissional responsável e, quando necessário, por assessoria especializada antes da publicação definitiva.</section>
        </div>
      </article>
    </main>
  );
}
