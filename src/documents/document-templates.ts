export const DOCUMENT_TEMPLATES: Record<number, any> = {
  1: {
    name: 'Ofício',
    title: 'OFÍCIO',
    structure: `
Local e data.

À autoridade/destinatário,

Assunto.

Texto formal de encaminhamento, solicitação ou comunicação oficial.

Fecho institucional.

Assinatura.
`,
    promptInstruction:
      'Elabore um ofício formal, com linguagem oficial, destinatário claro, assunto objetivo, fundamentação breve e fecho institucional.',
  },

  2: {
    name: 'Memorando',
    title: 'MEMORANDO',
    structure: `
Ao setor/destinatário interno,

Assunto.

Comunicação objetiva sobre demanda administrativa interna.

Encaminhamento ou solicitação.

Fecho.
`,
    promptInstruction:
      'Elabore um memorando administrativo interno, objetivo, claro e institucional.',
  },

  3: {
    name: 'Aviso Institucional',
    title: 'AVISO',
    structure: `
Título do aviso.

Informação principal.

Orientações ao público ou aos servidores.

Data/período, se houver.

Responsável institucional.
`,
    promptInstruction:
      'Elabore um aviso institucional claro, direto e adequado à comunicação pública ou interna.',
  },

  4: {
    name: 'Comunicação Interna',
    title: 'COMUNICAÇÃO INTERNA',
    structure: `
Destinatário interno.

Assunto.

Informação administrativa.

Providências necessárias.

Fecho.
`,
    promptInstruction:
      'Elabore uma comunicação interna objetiva, com linguagem administrativa e orientação clara.',
  },

  5: {
    name: 'Portaria',
    title: 'PORTARIA',
    structure: `
PORTARIA Nº ___/____

Considerandos.

Resolve.

Artigos numerados.

Vigência.

Assinatura da autoridade competente.
`,
    promptInstruction:
      'Elabore uma portaria administrativa com considerandos, artigos numerados, linguagem normativa e sem inventar base legal.',
  },

  6: {
    name: 'Relatório',
    title: 'RELATÓRIO',
    structure: `
Identificação.

Objetivo.

Descrição das atividades ou fatos.

Análise.

Conclusão.

Encaminhamentos.
`,
    promptInstruction:
      'Elabore um relatório administrativo com identificação, objetivo, descrição, análise, conclusão e encaminhamentos.',
  },
};