type AppointmentNotification = {
  patientName: string;
  email: string;
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
};

export async function sendAppointmentConfirmation(data: AppointmentNotification) {
  const results = await Promise.allSettled([
    sendEmail(data),
    sendWhatsAppTemplate(data),
  ]);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(index === 0 ? 'Email notification failed' : 'WhatsApp notification failed', result.reason);
    }
  });
}

async function sendEmail(data: AppointmentNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `appointment-confirmation-${data.email}-${data.appointmentDate}-${data.appointmentTime.slice(0, 5)}`,
    },
    body: JSON.stringify({
      from,
      to: [data.email],
      subject: 'Consulta confirmada • Fernanda Rabelo',
      text: `Olá, ${data.patientName}. Seu pagamento foi confirmado e sua consulta online com Fernanda Rabelo está agendada para ${formatDate(data.appointmentDate)} às ${data.appointmentTime.slice(0, 5)}. Acesse sua Área da Paciente próximo ao horário para entrar na sala virtual.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2D3748;max-width:560px;margin:auto">
          <h2 style="color:#319795">Consulta confirmada</h2>
          <p>Olá, ${escapeHtml(data.patientName)}.</p>
          <p>Seu pagamento foi confirmado e sua consulta online com Fernanda Rabelo está agendada para <strong>${formatDate(data.appointmentDate)} às ${escapeHtml(data.appointmentTime.slice(0, 5))}</strong>.</p>
          <p>Acesse sua Área da Paciente próximo ao horário para entrar na sala virtual.</p>
          <p style="font-size:13px;color:#718096">Por segurança, este e-mail não contém informações clínicas.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) throw new Error(`Resend returned ${response.status}`);
}

async function sendWhatsAppTemplate(data: AppointmentNotification) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const apiBase = process.env.WHATSAPP_API_BASE;
  if (!token || !phoneNumberId || !templateName || !apiBase) return;

  const raw = data.phone.replace(/\D/g, '');
  if (!raw) return;
  const to = raw.startsWith('55') ? raw : `55${raw}`;

  const response = await fetch(`${apiBase.replace(/\/$/, '')}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: data.patientName },
              { type: 'text', text: formatDate(data.appointmentDate) },
              { type: 'text', text: data.appointmentTime.slice(0, 5) },
            ],
          },
        ],
      },
    }),
  });

  if (!response.ok) throw new Error(`WhatsApp API returned ${response.status}`);
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;',
  }[char] ?? char));
}
