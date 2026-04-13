"use client";

import { useMemo, useState } from "react";

const EVENT_TITLE = "Estações 2026 - Café & Cura";
const EVENT_LOCATION = "Espaço Merengue - Av. Pinheirinho D'Agua, 200 - Jd. Panamericano, São Paulo - SP";
const EVENT_DESCRIPTION =
  "Evento Estações 2026 da AD Jardim Shangri-la. Leve seu comprovante e participe deste tempo especial.";

const EVENT_START = new Date("2026-08-21T18:00:00-03:00");
const EVENT_END = new Date("2026-08-21T21:00:00-03:00");

function formatUtcForCalendar(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function buildIcsEvent() {
  const dtStamp = formatUtcForCalendar(new Date());
  const dtStart = formatUtcForCalendar(EVENT_START);
  const dtEnd = formatUtcForCalendar(EVENT_END);
  const uid = `estacoes-2026-${Date.now()}@adjardimshangrila`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AD Jardim Shangri-la//Estações 2026//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(EVENT_TITLE)}`,
    `DESCRIPTION:${escapeIcsText(EVENT_DESCRIPTION)}`,
    `LOCATION:${escapeIcsText(EVENT_LOCATION)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Lembrete: Estações 2026 - Café & Cura é amanhã.",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Lembrete: Estações 2026 começa em 15 minutos.",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function AddToAgenda() {
  const [open, setOpen] = useState(false);

  const googleCalendarUrl = useMemo(() => {
    const start = formatUtcForCalendar(EVENT_START);
    const end = formatUtcForCalendar(EVENT_END);
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: EVENT_TITLE,
      dates: `${start}/${end}`,
      details: EVENT_DESCRIPTION,
      location: EVENT_LOCATION,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, []);

  const handleDownloadIcs = () => {
    const icsContent = buildIcsEvent();
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "estacoes-2026.ics";
    link.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full rounded-full border border-accent/70 bg-surface px-5 py-3 text-sm font-semibold text-primary shadow-sm transition hover:border-secondary/60 hover:bg-secondary/10"
      >
        📅 Adicionar à Minha Agenda
      </button>

      {open && (
        <div className="mt-2 grid gap-2 rounded-2xl border border-accent/70 bg-surface p-3 shadow-lg">
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-accent/70 bg-surface px-4 py-2.5 text-sm font-medium text-primary transition hover:border-secondary/60 hover:bg-secondary/10"
          >
            Google Calendar
          </a>
          <button
            type="button"
            onClick={handleDownloadIcs}
            className="inline-flex items-center justify-center rounded-lg border border-accent/70 bg-surface px-4 py-2.5 text-sm font-medium text-primary transition hover:border-secondary/60 hover:bg-secondary/10"
          >
            Baixar arquivo (.ics)
          </button>
        </div>
      )}
    </div>
  );
}
