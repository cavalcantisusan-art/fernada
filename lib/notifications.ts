type AppointmentNotification = {
  patientName: string;
  email: string;
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
};

/**
 * Notifications are intentionally disabled in the AI Studio build.
 *
 * Payment confirmation, appointment status and access to the patient area
 * continue to work without any external messaging provider. Keeping this
 * function in place means Resend/WhatsApp can be re-enabled later without
 * changing the Stripe webhook flow.
 */
export async function sendAppointmentConfirmation(_data: AppointmentNotification) {
  return;
}
