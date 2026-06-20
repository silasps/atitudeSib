const TURMA_SCHEDULE_MARKER = "__ATITUDE_TURMA_SCHEDULE_V1__";

export const TURMA_WEEKDAY_OPTIONS = [
  { value: "segunda", label: "Segunda-feira" },
  { value: "terca", label: "Terca-feira" },
  { value: "quarta", label: "Quarta-feira" },
  { value: "quinta", label: "Quinta-feira" },
  { value: "sexta", label: "Sexta-feira" },
  { value: "sabado", label: "Sabado" },
  { value: "domingo", label: "Domingo" },
] as const;

export type TurmaScheduleDay = (typeof TURMA_WEEKDAY_OPTIONS)[number]["value"];

export type TurmaScheduleSession = {
  dayOfWeek: TurmaScheduleDay;
  startTime: string;
  endTime: string;
  durationHours: number;
};

export type TurmaScheduleDraft = {
  dayOfWeek: TurmaScheduleDay | "";
  startTime: string;
  endTime: string;
};

type ParsedTurmaSchedule = {
  isStructured: boolean;
  summary: string | null;
  sessions: TurmaScheduleSession[];
  rawValue: string | null;
};

const TURMA_WEEKDAY_LABELS = Object.fromEntries(
  TURMA_WEEKDAY_OPTIONS.map((option) => [option.value, option.label])
) as Record<TurmaScheduleDay, string>;

const TURMA_WEEKDAY_ORDER = new Map<TurmaScheduleDay, number>(
  TURMA_WEEKDAY_OPTIONS.map((option, index) => [option.value, index])
);

function normalizeText(value?: string | null) {
  return String(value ?? "").trim();
}

function isTurmaScheduleDay(value: unknown): value is TurmaScheduleDay {
  return TURMA_WEEKDAY_OPTIONS.some((option) => option.value === value);
}

function normalizeTime(value: unknown) {
  const normalized = normalizeText(String(value ?? ""));

  if (!/^\d{2}:\d{2}$/.test(normalized)) {
    return null;
  }

  const [hours, minutes] = normalized.split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function parseTimeToMinutes(value?: string | null) {
  const normalized = normalizeTime(value);

  if (!normalized) {
    return null;
  }

  const [hours, minutes] = normalized.split(":").map(Number);
  return hours * 60 + minutes;
}

function roundDurationHours(value: number) {
  return Math.round(value * 100) / 100;
}

function getDayLabel(dayOfWeek: TurmaScheduleDay) {
  return TURMA_WEEKDAY_LABELS[dayOfWeek];
}

function getDateWeekday(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const weekdayMap: Record<number, TurmaScheduleDay> = {
    0: "domingo",
    1: "segunda",
    2: "terca",
    3: "quarta",
    4: "quinta",
    5: "sexta",
    6: "sabado",
  };

  return weekdayMap[date.getDay()] ?? null;
}

export function calculateTurmaDurationHours(
  startTime?: string | null,
  endTime?: string | null
) {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return null;
  }

  return roundDurationHours((endMinutes - startMinutes) / 60);
}

export function sortTurmaScheduleSessions(sessions: TurmaScheduleSession[]) {
  return [...sessions].sort((left, right) => {
    const dayDifference =
      (TURMA_WEEKDAY_ORDER.get(left.dayOfWeek) ?? 0) -
      (TURMA_WEEKDAY_ORDER.get(right.dayOfWeek) ?? 0);

    if (dayDifference !== 0) {
      return dayDifference;
    }

    return left.startTime.localeCompare(right.startTime);
  });
}

export function formatTurmaScheduleSummary(sessions: TurmaScheduleSession[]) {
  if (!sessions.length) {
    return null;
  }

  return sortTurmaScheduleSessions(sessions)
    .map(
      (session) =>
        `${getDayLabel(session.dayOfWeek)}, ${session.startTime} as ${session.endTime}`
    )
    .join(" · ");
}

export function formatTurmaDurationLabel(durationHours?: number | null) {
  if (durationHours === null || durationHours === undefined) {
    return "";
  }

  return Number.isInteger(durationHours)
    ? String(durationHours)
    : durationHours.toFixed(2).replace(/\.?0+$/, "");
}

export function formatTurmaDurationTimeLabel(durationHours?: number | null) {
  if (durationHours === null || durationHours === undefined) {
    return "";
  }

  const totalMinutes = Math.max(0, Math.round(durationHours * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function parseTurmaSchedulePayload(rawPayload?: string | null) {
  const normalizedPayload = normalizeText(rawPayload);

  if (!normalizedPayload) {
    return [] as TurmaScheduleSession[];
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(normalizedPayload);
  } catch {
    throw new Error("Nao foi possivel ler os encontros semanais da turma.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Formato invalido para os encontros semanais da turma.");
  }

  const sessions: TurmaScheduleSession[] = [];
  const selectedDays = new Set<TurmaScheduleDay>();

  for (const item of parsed) {
    const dayOfWeek = normalizeText(
      item && typeof item === "object" ? (item as { dayOfWeek?: string }).dayOfWeek : ""
    );
    const startTime = normalizeText(
      item && typeof item === "object" ? (item as { startTime?: string }).startTime : ""
    );
    const endTime = normalizeText(
      item && typeof item === "object" ? (item as { endTime?: string }).endTime : ""
    );

    const isBlank = !dayOfWeek && !startTime && !endTime;

    if (isBlank) {
      continue;
    }

    if (!isTurmaScheduleDay(dayOfWeek)) {
      throw new Error("Selecione o dia da semana de cada encontro cadastrado.");
    }

    if (selectedDays.has(dayOfWeek)) {
      throw new Error(
        "Cada dia da semana pode ser usado apenas uma vez nos encontros da turma."
      );
    }

    const normalizedStartTime = normalizeTime(startTime);
    const normalizedEndTime = normalizeTime(endTime);

    if (!normalizedStartTime || !normalizedEndTime) {
      throw new Error(
        "Informe horario de inicio e horario de fim validos para cada encontro."
      );
    }

    const durationHours = calculateTurmaDurationHours(
      normalizedStartTime,
      normalizedEndTime
    );

    if (durationHours === null) {
      throw new Error(
        "O horario de fim precisa ser maior que o horario de inicio em cada encontro."
      );
    }

    sessions.push({
      dayOfWeek,
      startTime: normalizedStartTime,
      endTime: normalizedEndTime,
      durationHours,
    });
    selectedDays.add(dayOfWeek);
  }

  return sortTurmaScheduleSessions(sessions);
}

export function serializeTurmaScheduleSessions(sessions: TurmaScheduleSession[]) {
  const normalizedSessions = sortTurmaScheduleSessions(sessions);

  return `${TURMA_SCHEDULE_MARKER}${JSON.stringify({
    sessions: normalizedSessions,
  })}`;
}

export function parseTurmaSchedule(rawValue?: string | null): ParsedTurmaSchedule {
  const normalizedRawValue = normalizeText(rawValue);

  if (!normalizedRawValue) {
    return {
      isStructured: false,
      summary: null,
      sessions: [],
      rawValue: null,
    };
  }

  if (!normalizedRawValue.startsWith(TURMA_SCHEDULE_MARKER)) {
    return {
      isStructured: false,
      summary: normalizedRawValue,
      sessions: [],
      rawValue: normalizedRawValue,
    };
  }

  try {
    const parsed = JSON.parse(
      normalizedRawValue.slice(TURMA_SCHEDULE_MARKER.length)
    ) as { sessions?: unknown };

    const sessions = parseTurmaSchedulePayload(JSON.stringify(parsed.sessions ?? []));

    return {
      isStructured: true,
      summary: formatTurmaScheduleSummary(sessions),
      sessions,
      rawValue: normalizedRawValue,
    };
  } catch {
    return {
      isStructured: false,
      summary: normalizedRawValue,
      sessions: [],
      rawValue: normalizedRawValue,
    };
  }
}

export function getTurmaScheduleSummary(rawValue?: string | null) {
  return parseTurmaSchedule(rawValue).summary;
}

export function getInitialTurmaScheduleDrafts(options?: {
  rawValue?: string | null;
  legacyStartTime?: string | null;
  legacyEndTime?: string | null;
}): TurmaScheduleDraft[] {
  const parsed = parseTurmaSchedule(options?.rawValue);

  if (parsed.sessions.length) {
    return parsed.sessions.map<TurmaScheduleDraft>((session) => ({
      dayOfWeek: session.dayOfWeek,
      startTime: session.startTime,
      endTime: session.endTime,
    }));
  }

  const legacyStartTime = normalizeTime(options?.legacyStartTime);
  const legacyEndTime = normalizeTime(options?.legacyEndTime);

  if (legacyStartTime || legacyEndTime) {
    return [
      {
        dayOfWeek: "",
        startTime: legacyStartTime ?? "",
        endTime: legacyEndTime ?? "",
      },
    ];
  }

  return [
    {
      dayOfWeek: "",
      startTime: "",
      endTime: "",
    },
  ];
}

export function buildTurmaScheduleFields(sessions: TurmaScheduleSession[]) {
  if (!sessions.length) {
    return {
      diasHorarios: null,
      horarioInicio: null,
      horarioFim: null,
      duracaoHoras: null,
      summary: null,
    };
  }

  const normalizedSessions = sortTurmaScheduleSessions(sessions);
  const uniqueDurations = new Set(
    normalizedSessions.map((session) => String(session.durationHours))
  );

  return {
    diasHorarios: serializeTurmaScheduleSessions(normalizedSessions),
    horarioInicio:
      normalizedSessions.length === 1 ? normalizedSessions[0].startTime : null,
    horarioFim:
      normalizedSessions.length === 1 ? normalizedSessions[0].endTime : null,
    duracaoHoras:
      uniqueDurations.size === 1 ? normalizedSessions[0].durationHours : null,
    summary: formatTurmaScheduleSummary(normalizedSessions),
  };
}

export function getTurmaDurationForDate(
  rawSchedule?: string | null,
  dateValue?: string | null,
  fallbackDuration?: number | null
) {
  const normalizedDateValue = normalizeText(dateValue);
  const parsedSchedule = parseTurmaSchedule(rawSchedule);

  if (!parsedSchedule.sessions.length) {
    return fallbackDuration ?? null;
  }

  if (!normalizedDateValue) {
    return fallbackDuration ?? null;
  }

  const weekday = getDateWeekday(normalizedDateValue);

  if (!weekday) {
    return fallbackDuration ?? null;
  }

  const session = parsedSchedule.sessions.find(
    (item) => item.dayOfWeek === weekday
  );

  if (session) {
    return session.durationHours;
  }

  if (parsedSchedule.sessions.length === 1) {
    return parsedSchedule.sessions[0].durationHours;
  }

  return fallbackDuration ?? null;
}
