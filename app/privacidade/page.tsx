import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] px-5 py-10 text-[#2D3748] sm:py-14">
      <article className="mx-auto max-w-3xl rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-10">
        <Link href="/" className="text-sm font-semibold text-[#319795]">← Voltar ao site</Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#319795]">Privacidade</p>
        <h1 className="mt-2 text-3xl font-bold">Política de Privacidade</h1>
        <p className="mt-3 text-sm text-[#718096]">Última atualização: setembro de 2026.</p>

        <div className="mt-8 space-y-7 leading-relaxed text-[#4A5568]">
          <section><h2 className="text-lg font-bold text-[#2D3748]">1. Dados tratados</h2><p className="mt-2">Para viabilizar cadastro, agendamento, pagamento e atendimento online, podem ser tratados dados como nome, e-mail, telefone, informações de agenda, status de pagamento, dados técnicos de acesso e informações necessárias ao atendimento. Dados de cartão são processados diretamente pela Stripe e não são armazenados neste site.</p></section>
          <section><h2 className="text-lg font-bold text-[#2D3748]">2. Finalidades</h2><p className="mt-2">Os dados são usados para autenticação, organização da agenda, cobrança, comunicação sobre consultas, liberação da sala virtual, segurança da plataforma, suporte e cumprimento de obrigações aplicáveis ao atendimento profissional.</p></section>
          <section><h2 className="text-lg font-bold text-[#2D3748]">3. Dados relacionados à saúde</h2><p className="mt-2">Informações relacionadas ao atendimento psicológico exigem proteção reforçada. O site deve coletar apenas o necessário para a finalidade do serviço, restringindo o acesso à profissional responsável e ao próprio titular, conforme o contexto.</p></section>
          <section><h2 className="text-lg font-bold text-[#2D3748]">4. Compartilhamento</h2><p className="mt-2">Prestadores de infraestrutura podem tratar dados estritamente para operar o serviço, como Supabase para autenticação e banco de dados e Stripe para pagamentos. Outros provedores de comunicação, quando ativados, poderão ser usados para envio de confirmações e lembretes.</p></section>
          <section><h2 className="text-lg font-bold text-[#2D3748]">5. Segurança</h2><p className="mt-2">São aplicados controles de acesso, autenticação, políticas de banco de dados e separação entre dados públicos e privados. Nenhum sistema é isento de riscos, portanto medidas técnicas e organizacionais devem ser revisadas periodicamente.</p></section>
          <section><h2 className="text-lg font-bold text-[#2D3748]">6. Direitos do titular</h2><p className="mt-2">O titular pode solicitar informações sobre o tratamento dos próprios dados e exercer os direitos previstos na legislação aplicável, observadas as hipóteses legais de retenção e as responsabilidades profissionais relacionadas ao atendimento.</p></section>
          <section><h2 className="text-lg font-bold text-[#2D3748]">7. Contato</h2><p className="mt-2">Para assuntos relacionados à privacidade, utilize o e-mail <a className="font-semibold text-[#319795]" href="mailto:rabelo.fernanda.psi@gmail.com">rabelo.fernanda.psi@gmail.com</a>.</p></section>
          <section className="rounded-2xl bg-[#F7FAFC] p-5 text-sm"><strong>Importante:</strong> esta política é um texto-base operacional e deve ser revisada pela responsável pelo serviço e, quando necessário, por assessoria jurídica especializada antes do uso definitivo em produção.</section>
        </div>
      </article>
    </main>
  );
}
