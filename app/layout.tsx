import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Fernanda Rabelo | Psicologia Online',
  description: 'Um espaço de acolhimento e escuta para cuidar da sua saúde emocional. Agende sua consulta online com a psicóloga Fernanda Rabelo.',
  openGraph: {
    title: 'Fernanda Rabelo | Psicologia Online',
    description: 'Um espaço de acolhimento e escuta para cuidar da sua saúde emocional.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fernanda Rabelo | Psicologia Online',
    description: 'Um espaço de acolhimento e escuta para cuidar da sua saúde emocional.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
