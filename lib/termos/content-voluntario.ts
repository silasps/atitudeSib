// Conteúdo jurídico dos termos do voluntário
// Validade legal: Lei 14.063/2020 + Lei 9.608/1998 (Lei do Voluntariado)
// Adaptado às diretrizes da LGPD (Lei 13.709/2018)

export interface TermoSection {
  id: string
  titulo: string
  texto: string
}

export interface TermosVoluntarioContent {
  titulo: string
  subtitulo: string
  aviso_legal: string
  termos: TermoSection[]
}

export const TERMOS_VOLUNTARIO_CONTENT: TermosVoluntarioContent = {
  titulo: 'Termo de Adesão ao Voluntariado',
  subtitulo: 'Direitos, deveres e proteção do voluntário — leia com atenção antes de assinar',
  aviso_legal:
    'Esta assinatura eletrônica tem plena validade jurídica nos termos da Lei 14.063/2020 e é ' +
    'reconhecida pelo Poder Judiciário brasileiro. Ao confirmar com o código enviado ao seu e-mail, ' +
    'sua identidade, data, horário e localização ficam registrados de forma imutável, com o mesmo ' +
    'efeito de uma assinatura manuscrita em documento particular.',

  termos: [
    {
      id: 'adesao',
      titulo: 'Termo de Adesão e Natureza do Vínculo',
      texto: `Declaro que adiro voluntariamente às atividades do projeto, nos termos da Lei do Voluntariado (Lei Federal 9.608/1998), ciente de que:

• A atividade voluntária não gera vínculo empregatício, nem obrigação de natureza trabalhista, previdenciária ou afim entre o voluntário e o projeto, conforme o art. 1º da Lei 9.608/1998;
• A prestação do serviço voluntário tem caráter gratuito, sem qualquer contraprestação financeira pelo projeto;
• O voluntário poderá ser ressarcido pelas despesas que comprovadamente realizar no desempenho das atividades voluntárias, quando previamente acordado com o projeto, nos termos do art. 3º da Lei 9.608/1998;
• O vínculo com o projeto é de natureza associativa e social, sem subordinação jurídica.

Comprovo que tenho ciência da missão, dos valores e dos objetivos do projeto, e que minha adesão é motivada pelo desejo genuíno de contribuir com a comunidade atendida.`,
    },

    {
      id: 'direitos',
      titulo: 'Direitos do Voluntário',
      texto: `Como voluntário do projeto, tenho assegurados os seguintes direitos:

1. RECONHECIMENTO: Ser reconhecido como colaborador essencial do projeto, com registro formal de minha participação e certificação de horas voluntárias mediante solicitação;

2. INFORMAÇÃO: Receber informações claras sobre as atividades que desenvolvo, os objetivos do projeto, os beneficiários atendidos e os resultados alcançados;

3. CAPACITAÇÃO: Participar de formações, treinamentos e orientações oferecidos pelo projeto relacionados às atividades voluntárias;

4. SEGURANÇA: Atuar em ambiente seguro, com condições adequadas para o desenvolvimento das atividades, sem exposição a riscos desnecessários;

5. AUTONOMIA: Definir minha disponibilidade de horários e carga de dedicação, dentro do combinado com o projeto, sem imposição de obrigações além do acordado;

6. DIGNIDADE: Ser tratado com respeito e consideração pela equipe do projeto, pelos beneficiários e pelos demais voluntários;

7. PRIVACIDADE: Ter meus dados pessoais tratados com confidencialidade, nos termos da LGPD e deste termo;

8. DESLIGAMENTO: Encerrar minha participação voluntária a qualquer momento, mediante comunicação prévia ao projeto, sem penalidade ou sanção;

9. COBERTURA: Ser informado sobre eventual cobertura de seguro ou proteção em caso de acidentes durante as atividades voluntárias, quando disponível.`,
    },

    {
      id: 'deveres',
      titulo: 'Deveres e Compromissos do Voluntário',
      texto: `Como voluntário do projeto, assumo os seguintes compromissos:

1. REGULARIDADE: Cumprir os compromissos de frequência, horários e prazos acordados com o projeto. Em caso de impossibilidade, comunicar com antecedência razoável para que seja possível organizar a substituição;

2. ÉTICA E CONDUTA: Manter postura ética, respeitosa e inclusiva no trato com os beneficiários, especialmente crianças e adolescentes, com a equipe do projeto e com os demais voluntários. Não utilizar os espaços do projeto para fins religiosos, políticos, comerciais ou outros que não se relacionem com os objetivos institucionais;

3. PROTEÇÃO À CRIANÇA E AO ADOLESCENTE: Respeitar integralmente o Estatuto da Criança e do Adolescente (Lei 8.069/1990), abstendo-me de qualquer atitude que possa configurar abuso, violência, exploração ou negligência. Denunciar imediatamente qualquer situação de risco ao setor responsável;

4. CONFIDENCIALIDADE: Guardar sigilo sobre informações pessoais, familiares e de saúde dos beneficiários a que tiver acesso no exercício das atividades voluntárias, utilizando-as exclusivamente para os fins do projeto;

5. DILIGÊNCIA: Exercer as atividades voluntárias com cuidado, responsabilidade e comprometimento com a qualidade do serviço prestado aos beneficiários;

6. COMUNICAÇÃO: Manter o projeto informado sobre qualquer situação que possa comprometer a continuidade das atividades voluntárias ou que envolva risco aos beneficiários;

7. BENS DO PROJETO: Zelar pela conservação dos espaços, equipamentos e materiais utilizados nas atividades. Quaisquer danos causados por negligência ou dolo poderão ser objeto de reparação;

8. IMAGEM: Não publicar conteúdo que identifique beneficiários do projeto, especialmente crianças e adolescentes, sem autorização expressa do responsável legal e do projeto;

9. COMPROMETIMENTO INSTITUCIONAL: Representar o projeto de forma condizente com seus valores e missão em todas as situações relacionadas às atividades voluntárias.`,
    },

    {
      id: 'imagem_voluntario',
      titulo: 'Autorização de Uso de Imagem do Voluntário',
      texto: `Autorizo o projeto a captar e utilizar minha imagem e voz em fotografias, vídeos e materiais institucionais relacionados às atividades voluntárias, para fins de divulgação do trabalho desenvolvido pelo projeto.

Estou ciente de que:
• Esta autorização não gera direito de remuneração;
• O uso será feito com respeito à minha dignidade e imagem;
• Posso solicitar a revogação desta autorização por escrito ao projeto a qualquer momento.

Esta autorização é OPCIONAL. O voluntário pode não autorizar sem que isso afete sua participação no projeto.`,
    },

    {
      id: 'lgpd_voluntario',
      titulo: 'Proteção de Dados Pessoais (LGPD)',
      texto: `Autorizo o tratamento dos meus dados pessoais pelo projeto, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), para as seguintes finalidades:

• Cadastro e registro formal como voluntário do projeto;
• Controle de frequência e registro de horas voluntárias;
• Comunicação sobre atividades, formações e eventos relacionados ao projeto;
• Emissão de declarações e certificados de voluntariado;
• Cumprimento de obrigações legais.

Dados tratados: nome, CPF, RG, e-mail, telefone, endereço, qualificações e demais informações fornecidas no cadastro.

Compartilhamento: dados poderão ser compartilhados com órgãos públicos competentes, quando exigido por lei, e com parceiros do projeto, sob acordo de confidencialidade.

Meus direitos como titular (art. 18 da LGPD): tenho garantido o direito de confirmação, acesso, correção, portabilidade, bloqueio e eliminação dos dados, mediante solicitação ao setor administrativo do projeto.

Prazo de armazenamento: os dados serão mantidos pelo período de vigência da atividade voluntária e pelos prazos legais aplicáveis após o encerramento.`,
    },
  ],
}
