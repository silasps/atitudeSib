// Conteúdo jurídico da ficha/termos do aluno
// Validade legal: Lei 14.063/2020 (assinatura eletrônica simples com OTP)
// Adaptado às diretrizes da LGPD (Lei 13.709/2018)

export interface TermoSection {
  id: string
  titulo: string
  texto: string
}

export interface TermosAlunoContent {
  titulo: string
  subtitulo: string
  aviso_legal: string
  termos: TermoSection[]
}

export const TERMOS_ALUNO_CONTENT: TermosAlunoContent = {
  titulo: 'Ficha de Matrícula e Termos de Participação',
  subtitulo: 'Leia com atenção cada seção e assine ao final para confirmar sua adesão',
  aviso_legal:
    'Esta assinatura eletrônica tem plena validade jurídica nos termos da Lei 14.063/2020 e é ' +
    'reconhecida pelo Poder Judiciário brasileiro. Ao confirmar com o código enviado ao seu e-mail, ' +
    'sua identidade, data, horário e localização ficam registrados de forma imutável, com o mesmo ' +
    'efeito de uma assinatura manuscrita em documento particular.',

  termos: [
    {
      id: 'matricula',
      titulo: 'Termo de Matrícula',
      texto: `Declaro que estou ciente de que a matrícula no projeto está condicionada à entrega de toda a documentação obrigatória listada no formulário de cadastro, incluindo comprovante de residência, atestado médico de aptidão física, documento de identidade e CPF do aluno.

Estou ciente de que a vaga é vinculada à modalidade e turma indicadas no cadastro, sujeita à disponibilidade, e que a confirmação da matrícula depende da aprovação pelo setor administrativo do projeto.

Comprometo-me a comunicar qualquer alteração nos dados cadastrais — endereço, contato, responsável legal — no prazo de até 10 dias a partir da ocorrência da mudança.

Declaro que as informações prestadas no formulário de cadastro são verdadeiras e completas até a data da assinatura.`,
    },

    {
      id: 'participacao',
      titulo: 'Termo de Participação',
      texto: `Declaro ciência das regras de participação do projeto, incluindo:

• Frequência mínima de 75% das aulas do período, salvo justificativa aceita pelo projeto;
• Pontualidade e respeito aos horários definidos para cada turma;
• Tratamento respeitoso com educadores, funcionários e demais participantes;
• Preservação do espaço físico, equipamentos e materiais disponibilizados;
• Comunicação prévia em caso de faltas prolongadas ou situações que afetem a permanência nas atividades.

Estou ciente de que faltas injustificadas reiteradas, descumprimento das regras ou comportamento inadequado podem resultar em advertência, reavaliação da vaga ou desligamento do projeto, conforme critérios pedagógicos e administrativos definidos pela equipe.

Comprometo-me a informar imediatamente qualquer situação de saúde, social ou familiar que possa impactar a participação do aluno nas atividades.`,
    },

    {
      id: 'responsabilidade',
      titulo: 'Termo de Responsabilidade',
      texto: `Declaro que as informações de saúde, alergias, medicações contínuas e limitações físicas prestadas nesta ficha são verdadeiras e completas até a data da assinatura.

Comprometo-me a informar imediatamente ao projeto qualquer alteração no quadro de saúde do aluno, bem como entregar laudos médicos, receitas ou orientações médicas sempre que solicitado ou quando houver mudança relevante.

Estou ciente de que a participação em atividades físicas e esportivas depende do respeito às orientações da equipe e às restrições médicas informadas nesta ficha e nos documentos anexados. O projeto não se responsabiliza por complicações decorrentes de omissão de informações de saúde.

Em situação de urgência ou emergência médica durante as atividades, autorizo expressamente o acionamento dos serviços de emergência e o encaminhamento do aluno para atendimento adequado. O projeto tomará as providências necessárias para contatar o responsável legal imediatamente.

Exonero o projeto e sua equipe de responsabilidade civil por acidentes ou lesões decorrentes de informações médicas omitidas ou de descumprimento das orientações da equipe técnica.`,
    },

    {
      id: 'imagem',
      titulo: 'Termo de Uso de Imagem e Voz',
      texto: `Autorizo o projeto a captar e utilizar a imagem, a voz e o nome do aluno em fotografias, vídeos, transmissões ao vivo e demais materiais institucionais, educativos e de divulgação relacionados às atividades desenvolvidas.

Estou ciente de que:
• Esta utilização não gera qualquer direito de remuneração ou contraprestação;
• O uso será feito com respeito à dignidade, integridade e privacidade do participante;
• Os materiais poderão ser veiculados em meios impressos, digitais, redes sociais institucionais e canais de comunicação do projeto;
• Materiais produzidos anteriormente à eventual revogação desta autorização poderão permanecer em circulação para fins institucionais.

Posso solicitar a revisão desta autorização por escrito ao setor administrativo do projeto. Fica assegurado o direito de oposição ao uso, conforme o art. 18 da Lei Geral de Proteção de Dados (LGPD).

A imagem do aluno menor de 18 anos não será utilizada em contextos que possam expor dados sensíveis ou prejudicar sua integridade, em conformidade com o Estatuto da Criança e do Adolescente (Lei 8.069/1990) e a LGPD.`,
    },

    {
      id: 'lgpd',
      titulo: 'Termo LGPD — Proteção de Dados Pessoais',
      texto: `Autorizo o tratamento dos dados pessoais do aluno e do responsável legal pelo projeto, nos termos da Lei Geral de Proteção de Dados Pessoais — LGPD (Lei 13.709/2018), para as seguintes finalidades:

• Cadastro e matrícula no projeto;
• Controle de frequência e registro de participação;
• Acompanhamento pedagógico e social do aluno;
• Envio de comunicados, informes e conteúdos relacionados às atividades;
• Cumprimento de obrigações legais junto a órgãos públicos e parceiros operacionais.

Dados de saúde: os dados de saúde coletados (doenças, medicações, alergias, limitações físicas) são tratados como dados sensíveis, conforme o art. 11 da LGPD, e serão utilizados exclusivamente para garantir a segurança e o bem-estar do aluno durante as atividades. O acesso é restrito aos profissionais autorizados.

Compartilhamento: os dados poderão ser compartilhados com:
• Órgãos públicos competentes, quando exigido por lei;
• Parceiros operacionais do projeto, sob acordo de confidencialidade;
• Entidades de saúde ou emergência, em situação de urgência que envolva risco à vida do aluno.

Direitos do titular (art. 18 da LGPD): fica garantido o direito de confirmação, acesso, correção, portabilidade, anonimização, bloqueio e eliminação dos dados, mediante solicitação ao setor administrativo do projeto.

Prazo de armazenamento: os dados serão armazenados pelo período necessário ao atendimento das finalidades do projeto e aos prazos legais aplicáveis, incluindo eventuais prazos prescricionais.

Encarregado de dados (DPO): dúvidas sobre o tratamento de dados devem ser dirigidas ao setor administrativo do projeto.`,
    },
  ],
}
