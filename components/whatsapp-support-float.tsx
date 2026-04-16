'use client';

import { WhatsAppIcon } from '@/components/whatsapp-icon';

const WHATSAPP_NUMBER = '5511992171188';
const WHATSAPP_MESSAGE =
  'Olá! Estou com uma dúvida sobre a minha inscrição para o evento ESTAÇÕES 2026.';

export function WhatsAppSupportFloat() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Suporte via WhatsApp"
      className="animate-whatsapp fixed bottom-24 right-5 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-600/90 text-white shadow-lg shadow-green-700/30 transition hover:scale-[1.04] hover:bg-green-600 sm:bottom-12"
    >
      <WhatsAppIcon className="h-6 w-6" />
    </a>
  );
}
