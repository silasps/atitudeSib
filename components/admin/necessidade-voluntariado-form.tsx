"use client";

import { useRef, useState } from "react";
import type {
  ChangeEvent,
  Dispatch,
  FormEvent,
  ReactNode,
  SetStateAction,
} from "react";
import type { FuncaoVoluntariado } from "@/types";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export type NecessidadeVoluntariadoFormData = {
  funcao_id: string;
  titulo_publico: string;
  resumo_curto: string;
  descricao_completa: string;
  imagem_url: string;
  imagem_alt: string;
  local_atuacao: string;
  formato_atuacao: string;
  carga_horaria: string;
  periodo: string;
  atividades: string;
  perfil_desejado: string;
  diferenciais: string;
  quantidade_total: string;
  quantidade_aprovada: string;
  data_limite_inscricao_em: string;
  status: string;
  exibir_publicamente: boolean;
};

type NecessidadeVoluntariadoFormProps = {
  formData: NecessidadeVoluntariadoFormData;
  setFormData: Dispatch<SetStateAction<NecessidadeVoluntariadoFormData>>;
  funcoes: FuncaoVoluntariado[];
  loadingFuncoes: boolean;
  loadingSubmit: boolean;
  submitLabel: string;
  message: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function FieldHelp({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-xs text-zinc-500">{children}</p>;
}

function InputLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1 block text-sm font-medium text-zinc-700">
      {children}
    </label>
  );
}

export function NecessidadeVoluntariadoForm({
  formData,
  setFormData,
  funcoes,
  loadingFuncoes,
  loadingSubmit,
  submitLabel,
  message,
  onSubmit,
}: NecessidadeVoluntariadoFormProps) {
  const supabase = createSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: checked,
    }));
  }

  function handleFuncaoChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedId = event.target.value;
    const funcaoSelecionada = funcoes.find(
      (funcao) => String(funcao.id) === selectedId
    );

    setFormData((current) => ({
      ...current,
      funcao_id: selectedId,
      titulo_publico:
        current.titulo_publico.trim() || !funcaoSelecionada?.nome
          ? current.titulo_publico
          : funcaoSelecionada.nome,
      descricao_completa:
        current.descricao_completa.trim() || !funcaoSelecionada?.descricao
          ? current.descricao_completa
          : funcaoSelecionada.descricao,
      resumo_curto:
        current.resumo_curto.trim() || !funcaoSelecionada?.descricao
          ? current.resumo_curto
          : funcaoSelecionada.descricao.slice(0, 160),
    }));
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadingImage(true);
    setUploadMessage("");

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `voluntariado/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("site-images")
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      setUploadMessage(`Erro ao enviar imagem: ${uploadError.message}`);
      setUploadingImage(false);
      return;
    }

    const { data } = supabase.storage.from("site-images").getPublicUrl(filePath);

    setFormData((current) => ({
      ...current,
      imagem_url: data.publicUrl,
      imagem_alt: current.imagem_alt.trim() || current.titulo_publico.trim(),
    }));

    setUploadMessage("Imagem enviada com sucesso.");
    setUploadingImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const vagasRestantes = Math.max(
    Number(formData.quantidade_total || 0) - Number(formData.quantidade_aprovada || 0),
    0
  );

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6"
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <InputLabel>Função</InputLabel>
              <select
                name="funcao_id"
                value={formData.funcao_id}
                onChange={handleFuncaoChange}
                required
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
              >
                <option value="">
                  {loadingFuncoes ? "Carregando funções..." : "Selecione uma função"}
                </option>

                {funcoes.map((funcao) => (
                  <option key={funcao.id} value={funcao.id}>
                    {funcao.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <InputLabel>Título público</InputLabel>
              <input
                name="titulo_publico"
                value={formData.titulo_publico}
                onChange={handleInputChange}
                required
                placeholder="Ex: Educador de reforço escolar"
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
              />
            </div>

            <div className="md:col-span-2">
              <InputLabel>Resumo curto para o card público</InputLabel>
              <textarea
                name="resumo_curto"
                value={formData.resumo_curto}
                onChange={handleInputChange}
                rows={3}
                placeholder="Escreva um convite curto, humano e direto para a oportunidade."
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
              />
              <FieldHelp>
                Esse texto aparece na lista pública antes do clique em
                {" "}&quot;Saiba mais&quot;.
              </FieldHelp>
            </div>
          </div>

          <section className="rounded-3xl border border-zinc-200 bg-zinc-50/70 p-4">
            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                Apresentação da vaga
              </p>
              <h3 className="text-lg font-semibold text-zinc-900">
                Conteúdo que deixa a vaga mais convidativa
              </h3>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <InputLabel>Descrição completa</InputLabel>
                <textarea
                  name="descricao_completa"
                  value={formData.descricao_completa}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                />
                <FieldHelp>
                  Use esse bloco para explicar a missão da vaga, contexto e impacto.
                </FieldHelp>
              </div>

              <div>
                <InputLabel>Local de atuação</InputLabel>
                <input
                  name="local_atuacao"
                  value={formData.local_atuacao}
                  onChange={handleInputChange}
                  placeholder="Ex: Lamenha Grande, Almirante Tamandaré"
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <InputLabel>Formato da atuação</InputLabel>
                <input
                  name="formato_atuacao"
                  value={formData.formato_atuacao}
                  onChange={handleInputChange}
                  placeholder="Ex: Presencial, híbrido ou a combinar"
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <InputLabel>Carga horária</InputLabel>
                <input
                  name="carga_horaria"
                  value={formData.carga_horaria}
                  onChange={handleInputChange}
                  placeholder="Ex: 2 horas por semana"
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <InputLabel>Período ou turno</InputLabel>
                <input
                  name="periodo"
                  value={formData.periodo}
                  onChange={handleInputChange}
                  placeholder="Ex: Terças à tarde"
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                />
              </div>

              <div className="md:col-span-2">
                <InputLabel>Atividades principais</InputLabel>
                <textarea
                  name="atividades"
                  value={formData.atividades}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder={"Uma atividade por linha\nAcompanhar alunos\nApoiar oficinas\nRegistrar presença"}
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <InputLabel>Perfil desejado</InputLabel>
                <textarea
                  name="perfil_desejado"
                  value={formData.perfil_desejado}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder={"Uma característica por linha\nBoa comunicação\nPontualidade\nEscuta ativa"}
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <InputLabel>Diferenciais ou benefícios</InputLabel>
                <textarea
                  name="diferenciais"
                  value={formData.diferenciais}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder={"Um destaque por linha\nIntegração com a equipe\nImpacto direto na comunidade"}
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <InputLabel>Quantidade total</InputLabel>
                <input
                  type="number"
                  min="1"
                  name="quantidade_total"
                  value={formData.quantidade_total}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <InputLabel>Quantidade aprovada</InputLabel>
                <input
                  type="number"
                  min="0"
                  name="quantidade_aprovada"
                  value={formData.quantidade_aprovada}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <InputLabel>Data e horário limite</InputLabel>
                <input
                  type="datetime-local"
                  name="data_limite_inscricao_em"
                  value={formData.data_limite_inscricao_em}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <InputLabel>Status</InputLabel>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                >
                  <option value="aberta">Aberta</option>
                  <option value="fechada">Fechada</option>
                </select>
              </div>

              <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <input
                  type="checkbox"
                  name="exibir_publicamente"
                  checked={formData.exibir_publicamente}
                  onChange={handleCheckboxChange}
                />
                <span className="text-sm text-zinc-700">
                  Exibir esta oportunidade publicamente
                </span>
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="relative min-h-[240px] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-5 text-white">
              {formData.imagem_url ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.imagem_url}
                    alt={formData.imagem_alt || formData.titulo_publico}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </>
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-900/35 to-transparent" />
              <div className="relative flex h-full flex-col justify-end">
                <p className="text-xs uppercase tracking-[0.35em] text-white/75">
                  Prévia pública
                </p>
                <h3 className="mt-3 text-2xl font-semibold">
                  {formData.titulo_publico || "Título da vaga"}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/88">
                  {formData.resumo_curto || "Seu resumo curto aparece aqui para convidar o voluntário a clicar."}
                </p>
              </div>
            </div>

            <div className="space-y-3 p-5 text-sm text-zinc-600">
              <p>
                <span className="font-medium text-zinc-900">Vagas restantes:</span>{" "}
                {vagasRestantes}
              </p>
              {formData.local_atuacao ? (
                <p>
                  <span className="font-medium text-zinc-900">Local:</span>{" "}
                  {formData.local_atuacao}
                </p>
              ) : null}
              {formData.carga_horaria ? (
                <p>
                  <span className="font-medium text-zinc-900">Carga horária:</span>{" "}
                  {formData.carga_horaria}
                </p>
              ) : null}
              {formData.periodo ? (
                <p>
                  <span className="font-medium text-zinc-900">Período:</span>{" "}
                  {formData.periodo}
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                  Imagem da vaga
                </p>
                <h3 className="mt-2 text-lg font-semibold text-zinc-900">
                  Foto ou capa opcional
                </h3>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-60"
              >
                {uploadingImage ? "Enviando..." : "Enviar imagem"}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="mt-4 space-y-4">
              <div>
                <InputLabel>URL pública da imagem</InputLabel>
                <input
                  name="imagem_url"
                  value={formData.imagem_url}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <InputLabel>Texto alternativo da imagem</InputLabel>
                <input
                  name="imagem_alt"
                  value={formData.imagem_alt}
                  onChange={handleInputChange}
                  placeholder="Descreva a imagem em uma frase"
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-500"
                />
              </div>

              {formData.imagem_url ? (
                <button
                  type="button"
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      imagem_url: "",
                      imagem_alt: "",
                    }))
                  }
                  className="text-sm font-medium text-red-600"
                >
                  Remover imagem da vaga
                </button>
              ) : null}

              {uploadMessage ? (
                <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
                  {uploadMessage}
                </div>
              ) : null}
            </div>
          </section>
        </aside>
      </div>

      {message ? (
        <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
          {message}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loadingSubmit || uploadingImage}
          className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {loadingSubmit ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
