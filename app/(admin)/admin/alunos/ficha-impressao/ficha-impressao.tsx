'use client'

import { Printer } from 'lucide-react'

export default function FichaImpressao({ orgNome }: { orgNome: string }) {
  const hoje = new Date().toLocaleDateString('pt-BR')

  return (
    <>
      {/* Botão imprimir — oculto na impressão */}
      <div className="print:hidden bg-blue-600 text-white px-6 py-3 flex items-center justify-between">
        <span className="text-sm font-medium">Ficha de Cadastro de Aluno — {orgNome}</span>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white text-blue-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition"
        >
          <Printer size={15} />
          Imprimir / Salvar PDF
        </button>
      </div>

      <style>{`
        @media print {
          body { font-family: Arial, sans-serif; font-size: 11pt; color: #000; }
          .no-break { page-break-inside: avoid; }
        }
        @page { margin: 1.5cm; }
      `}</style>

      <div className="max-w-3xl mx-auto p-8 text-gray-900 text-sm">
        {/* Cabeçalho */}
        <div className="text-center mb-6 border-b-2 border-gray-900 pb-4">
          <h1 className="text-xl font-bold uppercase tracking-wide">{orgNome}</h1>
          <h2 className="text-base font-semibold mt-1">Ficha de Cadastro de Aluno</h2>
          <p className="text-xs text-gray-500 mt-1">Gerado em: {hoje}</p>
          <p className="text-xs text-gray-500 mt-1">
            Imprima esta ficha, preencha manualmente e entregue com a documentação obrigatória.
          </p>
        </div>

        {/* 1. Dados pessoais */}
        <section className="no-break mb-6">
          <h3 className="font-bold border-b border-gray-400 pb-1 mb-3">1. Dados pessoais do aluno</h3>
          <Field label="Nome completo" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Data de nascimento" />
            <Field label="CPF" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Documento principal" options={['RG', 'Certidão de nascimento']} />
            <Field label="Número do documento" />
          </div>
          <Field label="Sexo" options={['Feminino', 'Masculino', 'Outro', 'Prefiro não informar']} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Telefone" />
            <Field label="E-mail" />
          </div>
        </section>

        {/* 2. Endereço */}
        <section className="no-break mb-6">
          <h3 className="font-bold border-b border-gray-400 pb-1 mb-3">2. Endereço</h3>
          <div className="grid grid-cols-3 gap-4">
            <Field label="CEP" />
            <div className="col-span-2"><Field label="Rua / Logradouro" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Número" />
            <div className="col-span-2"><Field label="Complemento" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Bairro" />
            <Field label="Cidade" />
            <Field label="UF" />
          </div>
        </section>

        {/* 3. Dados socioeconômicos */}
        <section className="no-break mb-6">
          <h3 className="font-bold border-b border-gray-400 pb-1 mb-3">3. Dados socioeconômicos</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Renda familiar (R$)" />
            <Field label="Pessoas na casa" />
          </div>
          <Field label="Situação de moradia" options={['Própria', 'Alugada', 'Cedida', 'Outra']} />
          <Field label="Beneficiário de programa social?" options={['Sim', 'Não']} />
          <Field label="Qual(is) programa(s)?" />
          <Field label="Responsável/provedor trabalha?" options={['Sim', 'Não']} />
        </section>

        {/* 4. Informações escolares */}
        <section className="no-break mb-6">
          <h3 className="font-bold border-b border-gray-400 pb-1 mb-3">4. Informações escolares</h3>
          <p className="text-xs text-gray-500 mb-2">Preencher somente se o aluno for criança ou adolescente.</p>
          <Field label="Está estudando?" options={['Sim', 'Não']} />
          <Field label="Nome da escola" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Série/Ano" />
            <Field label="Período" options={['Manhã', 'Tarde', 'Noite', 'Integral']} />
          </div>
        </section>

        {/* 5. Saúde */}
        <section className="no-break mb-6">
          <h3 className="font-bold border-b border-gray-400 pb-1 mb-3">5. Saúde do aluno</h3>
          <Field label="Possui alguma doença?" options={['Sim', 'Não']} />
          <Field label="Se sim, qual doença?" />
          <Field label="Usa medicação contínua?" options={['Sim', 'Não']} />
          <Field label="Se sim, qual medicação?" />
          <Field label="Possui alergias?" options={['Sim', 'Não']} />
          <Field label="Se sim, quais alergias?" />
          <Field label="Tem alguma limitação física?" options={['Sim', 'Não']} />
          <Field label="Se sim, qual limitação?" />
          <Field label="Pode praticar atividades físicas?" options={['Sim', 'Não']} />
        </section>

        {/* 7. Informações do projeto */}
        <section className="no-break mb-6">
          <h3 className="font-bold border-b border-gray-400 pb-1 mb-3">7. Informações do projeto</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Turma desejada" />
            <Field label="Modalidade" />
          </div>
          <Field label="Como conheceu o projeto?" options={['Indicação', 'Escola', 'Instagram', 'Facebook', 'Site', 'Evento', 'Outro']} />
          <Field label="Detalhamento (nome, escola, canal, etc.)" />
          <Field label="Já participou antes?" options={['Sim', 'Não']} />
          <Field label="Observações adicionais" tall />
        </section>

        {/* 8. Documentação */}
        <section className="no-break mb-6">
          <h3 className="font-bold border-b border-gray-400 pb-1 mb-3">8. Documentação obrigatória</h3>
          <p className="text-xs mb-2">Marque os documentos entregues:</p>
          <div className="space-y-1.5">
            {[
              'Comprovante de residência (obrigatório)',
              'Atestado médico de aptidão física (obrigatório)',
              'RG do aluno ou Certidão de nascimento (obrigatório)',
              'CPF do aluno (obrigatório)',
              'Foto do aluno (opcional)',
              'Documento de vínculo com responsável legal (para menores)',
              'Ficha e termos assinados',
            ].map(doc => (
              <div key={doc} className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-500 shrink-0" />
                <span className="text-xs">{doc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 9. Termos e autorizações */}
        <section className="no-break mb-6">
          <h3 className="font-bold border-b border-gray-400 pb-1 mb-3">9. Autorização de uso de imagem</h3>
          <p className="text-xs text-gray-600 mb-3">
            Autorizo o projeto a captar e utilizar a imagem, a voz e o nome do aluno em fotos, vídeos e materiais institucionais, educativos e de divulgação relacionados às atividades desenvolvidas.
          </p>
          <Field label="Decisão" options={['Autoriza', 'Não autoriza']} />
        </section>

        {/* Assinaturas */}
        <section className="no-break">
          <h3 className="font-bold border-b border-gray-400 pb-1 mb-4">Assinaturas</h3>
          <div className="grid grid-cols-2 gap-8 mt-6">
            <div>
              <div className="border-b border-gray-600 mb-1 h-8" />
              <p className="text-xs">Assinatura do aluno</p>
            </div>
            <div>
              <div className="border-b border-gray-600 mb-1 h-8" />
              <p className="text-xs">Assinatura do responsável legal (se menor de 18 anos)</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="border-b border-gray-600 mb-1 h-8 w-1/3" />
            <p className="text-xs">Data: ____ / ____ / ______</p>
          </div>
          <div className="mt-6">
            <div className="border-b border-gray-600 mb-1 h-8" />
            <p className="text-xs">Recebido pelo administrativo</p>
          </div>
        </section>
      </div>
    </>
  )
}

function Field({
  label,
  options,
  tall,
}: {
  label: string
  options?: string[]
  tall?: boolean
}) {
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold text-gray-700 mb-1">{label}</p>
      {options ? (
        <div className="flex flex-wrap gap-4">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-1.5 text-xs">
              <div className="w-3.5 h-3.5 border border-gray-500 shrink-0" />
              {opt}
            </label>
          ))}
        </div>
      ) : (
        <div className={`border-b border-gray-500 ${tall ? 'h-16' : 'h-7'}`} />
      )}
    </div>
  )
}
