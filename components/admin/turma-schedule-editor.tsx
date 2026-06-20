"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  TURMA_WEEKDAY_OPTIONS,
  calculateTurmaDurationHours,
  formatTurmaDurationTimeLabel,
  formatTurmaScheduleSummary,
  getInitialTurmaScheduleDrafts,
  parseTurmaSchedule,
  type TurmaScheduleDay,
  type TurmaScheduleDraft,
} from "@/lib/turma-schedule";

type TurmaScheduleEditorProps = {
  initialRawValue?: string | null;
  initialHorarioInicio?: string | null;
  initialHorarioFim?: string | null;
};

type ClientDraft = TurmaScheduleDraft & {
  id: string;
};

function createEmptyDraft(id: string): ClientDraft {
  return {
    id,
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  };
}

function buildInitialDrafts(
  initialRawValue?: string | null,
  initialHorarioInicio?: string | null,
  initialHorarioFim?: string | null
): ClientDraft[] {
  const drafts = getInitialTurmaScheduleDrafts({
    rawValue: initialRawValue,
    legacyStartTime: initialHorarioInicio,
    legacyEndTime: initialHorarioFim,
  });

  return drafts.map<ClientDraft>((draft, index) => ({
    id: `draft-${index + 1}`,
    dayOfWeek: draft.dayOfWeek,
    startTime: draft.startTime,
    endTime: draft.endTime,
  }));
}

export function TurmaScheduleEditor(props: TurmaScheduleEditorProps) {
  const parsedInitialSchedule = useMemo(
    () => parseTurmaSchedule(props.initialRawValue),
    [props.initialRawValue]
  );
  const initialDrafts = buildInitialDrafts(
    props.initialRawValue,
    props.initialHorarioInicio,
    props.initialHorarioFim
  );
  const [drafts, setDrafts] = useState<ClientDraft[]>(initialDrafts);
  const [nextDraftNumber, setNextDraftNumber] = useState(
    initialDrafts.length + 1
  );
  const [touched, setTouched] = useState(false);

  const completeSessions = useMemo(() => {
    return drafts.flatMap((draft) => {
      const durationHours = calculateTurmaDurationHours(
        draft.startTime,
        draft.endTime
      );

      if (
        !draft.dayOfWeek ||
        !draft.startTime ||
        !draft.endTime ||
        durationHours === null
      ) {
        return [];
      }

      return [
        {
          dayOfWeek: draft.dayOfWeek as TurmaScheduleDay,
          startTime: draft.startTime,
          endTime: draft.endTime,
          durationHours,
        },
      ];
    });
  }, [drafts]);

  const hasIncompleteDraft = useMemo(() => {
    return drafts.some((draft) => {
      const hasAnyValue =
        Boolean(draft.dayOfWeek) ||
        Boolean(draft.startTime) ||
        Boolean(draft.endTime);

      if (!hasAnyValue) {
        return false;
      }

      return (
        !draft.dayOfWeek ||
        !draft.startTime ||
        !draft.endTime ||
        calculateTurmaDurationHours(draft.startTime, draft.endTime) === null
      );
    });
  }, [drafts]);

  function updateDraft(
    draftId: string,
    field: keyof TurmaScheduleDraft,
    value: string
  ) {
    setTouched(true);
    setDrafts((current) =>
      current.map((draft) =>
        draft.id === draftId ? { ...draft, [field]: value } : draft
      )
    );
  }

  function addDraft() {
    setTouched(true);
    setDrafts((current) => [...current, createEmptyDraft(`draft-${nextDraftNumber}`)]);
    setNextDraftNumber((current) => current + 1);
  }

  function removeDraft(draftId: string) {
    setTouched(true);
    setDrafts((current) => {
      const nextDrafts = current.filter((draft) => draft.id !== draftId);
      return nextDrafts.length ? nextDrafts : [createEmptyDraft(`draft-${nextDraftNumber}`)];
    });
    setNextDraftNumber((current) => current + 1);
  }

  const summaryPreview = formatTurmaScheduleSummary(completeSessions);

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <div>
        <p className="text-sm font-medium text-zinc-900">Encontros da turma</p>
        <p className="mt-1 text-sm text-zinc-600">
          Cadastre um ou mais dias da semana. A duracao e calculada automaticamente
          a partir dos horarios, no formato HH:MM.
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Use um encontro por dia da semana para manter o controle de frequencia
          coerente no historico da turma.
        </p>
      </div>

      {parsedInitialSchedule.summary && !parsedInitialSchedule.isStructured ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Agenda atual</p>
          <p className="mt-1">{parsedInitialSchedule.summary}</p>
          <p className="mt-2 text-xs text-amber-800">
            Se voce editar os encontros abaixo e salvar, a agenda manual sera
            substituida por uma agenda estruturada.
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {drafts.map((draft, index) => {
          const durationHours = calculateTurmaDurationHours(
            draft.startTime,
            draft.endTime
          );
          const hasTimeRange =
            Boolean(draft.startTime) && Boolean(draft.endTime) && durationHours === null;

          return (
            <div
              key={draft.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-zinc-900">
                  Encontro {index + 1}
                </p>

                <button
                  type="button"
                  onClick={() => removeDraft(draft.id)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700"
                >
                  <Trash2 size={14} />
                  Remover
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <label className="text-sm text-zinc-700 md:col-span-2">
                  <span className="mb-2 block font-medium text-zinc-900">
                    Dia da semana
                  </span>
                  <select
                    value={draft.dayOfWeek}
                    onChange={(event) =>
                      updateDraft(draft.id, "dayOfWeek", event.target.value)
                    }
                    className="w-full cursor-pointer rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                  >
                    <option value="">Selecione o dia</option>
                    {TURMA_WEEKDAY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm text-zinc-700">
                  <span className="mb-2 block font-medium text-zinc-900">
                    Inicio
                  </span>
                  <input
                    type="time"
                    value={draft.startTime}
                    onChange={(event) =>
                      updateDraft(draft.id, "startTime", event.target.value)
                    }
                    className="w-full cursor-pointer rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                  />
                </label>

                <label className="text-sm text-zinc-700">
                  <span className="mb-2 block font-medium text-zinc-900">Fim</span>
                  <input
                    type="time"
                    value={draft.endTime}
                    onChange={(event) =>
                      updateDraft(draft.id, "endTime", event.target.value)
                    }
                    className="w-full cursor-pointer rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <label className="text-sm text-zinc-700">
                  <span className="mb-2 block font-medium text-zinc-900">
                    Duracao
                  </span>
                  <input
                    value={formatTurmaDurationTimeLabel(durationHours)}
                    readOnly
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 outline-none"
                    placeholder="00:00"
                  />
                </label>

                {hasTimeRange ? (
                  <p className="text-xs text-red-600">
                    O horario de fim precisa ser maior que o horario de inicio.
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addDraft}
        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900"
      >
        <Plus size={16} />
        Adicionar outro dia
      </button>

      {summaryPreview ? (
        <div className="rounded-2xl bg-white px-4 py-3 text-sm text-zinc-700">
          <span className="font-medium text-zinc-900">Resumo:</span> {summaryPreview}
        </div>
      ) : null}

      {touched && hasIncompleteDraft ? (
        <p className="text-sm text-amber-700">
          Preencha dia, horario de inicio e horario de fim de cada encontro antes
          de salvar.
        </p>
      ) : null}

      <input
        type="hidden"
        name="schedule_payload"
        value={JSON.stringify(
          drafts.map((draft) => ({
            dayOfWeek: draft.dayOfWeek,
            startTime: draft.startTime,
            endTime: draft.endTime,
          }))
        )}
      />
      <input type="hidden" name="schedule_touched" value={touched ? "1" : "0"} />
      <input
        type="hidden"
        name="schedule_existing_raw"
        value={props.initialRawValue ?? ""}
      />
    </div>
  );
}
