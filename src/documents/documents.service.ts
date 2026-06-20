import { documents_status } from '@prisma/client';
import * as puppeteer from 'puppeteer';
import * as nodemailer from 'nodemailer';
import { DOCUMENT_TEMPLATES } from './document-templates';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';
function convertBigIntToString(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    ),
  );
}

function buildDocumentCode(document: any): string {
  const typeMap: Record<number, string> = {
    1: 'OFÍCIO',
    2: 'MEMORANDO',
    3: 'AVISO',
    4: 'COMUNICAÇÃO INTERNA', 
    5: 'PORTARIA',
    6: 'RELATÓRIO',
  };

  const type = typeMap[Number(document.document_type_id)] || 'DOCUMENTO';
  const number = String(document.number).padStart(3, '0'); 

  return `${type} Nº ${number}/${document.year}`;
}

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}
private openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
	async sendByEmail(id: string, data: any, user: any) {
  const document = await this.findOne(id);
 const pdf = Buffer.from(await this.generatePdf(id));
		
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 465),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const to = data.to || document.recipient_email;

  if (!to) {
    throw new BadRequestException('Destinatário de e-mail não informado');
  }

  const subject = data.subject || document.subject || document.document_code;

  const message =
    data.message ||
    `Encaminhamos, em anexo, o documento ${document.document_code}.`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    cc: data.cc,
    subject,
    text: message,
    attachments: [
      {
        filename: `${document.document_code.replace(/[\/\\:*?"<>|]/g, '-')}.pdf`,
        content: pdf,
        contentType: 'application/pdf',
      },
    ],
  });

  await this.prisma.document_sends.create({
    data: {
      document_id: BigInt(id),
      sent_by: BigInt(user.userId),
      channel: 'email',
      recipient_name: document.recipient_name,
      recipient_email: to,
      subject,
      message,
      status: 'sent',
    },
  });

 console.log('ATUALIZANDO STATUS PARA SENT');

const updatedDocument = await this.prisma.documents.update({
  where: {
    id: BigInt(id),
  },
  data: {
    status: 'sent',
  },
});

console.log('STATUS ATUALIZADO');
console.log(updatedDocument);

  return {
    message: 'Documento enviado com sucesso',
    document_id: id,
    document_code: document.document_code,
    recipient_email: to,
  };
}
	
	async generatePdf(id: string) {
  const document = await this.findOne(id);

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 60px;
            font-size: 14px;
            line-height: 1.6;
            color: #111;
          }

          .header {
            text-align: center;
            margin-bottom: 40px;
          }

          .institution {
            font-size: 16px;
            font-weight: bold;
          }

          .title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin: 40px 0 30px 0;
          }

          .recipient {
            margin-bottom: 30px;
          }

          .content {
            white-space: pre-line;
            text-align: justify;
          }

          .signature {
            margin-top: 80px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="institution">TEATRO MUNICIPAL SEVERINO CABRAL</div>
          <div>Campina Grande - PB</div>
        </div>

        <div class="title">${document.document_code}</div>

        <div class="recipient">
          <strong>Destinatário:</strong> ${document.recipient_name || ''}
        </div>

        <div class="content">
          ${document.content || ''}
        </div>

        <div class="signature">
          _______________________________________<br/>
          Carlos Alan Peres da Silva<br/>
          Gerência do Teatro Municipal Severino Cabral
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

 await page.setContent(html, {
  waitUntil: 'load',
});

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm',
    },
  });

  await browser.close();

  return pdf;
}
	
	async updateStatus(id: string, status: documents_status) {
  const allowedStatuses: documents_status[] = [
    'draft',
    'review',
    'pending_approval',
    'approved',
    'sent',
    'archived',
    'cancelled',
  ];

  if (!allowedStatuses.includes(status)) {
    throw new BadRequestException('Status inválido');
  }

  const existing = await this.prisma.documents.findUnique({
    where: {
      id: BigInt(id),
    },
  });

  if (!existing) {
    throw new NotFoundException('Documento não encontrado');
  }

  const updated = await this.prisma.documents.update({
    where: {
      id: BigInt(id),
    },
    data: {
      status,
    },
  });

  const result = convertBigIntToString(updated);

  return {
    ...result,
    document_code: buildDocumentCode(result),
  };
}
	async generate(data: any, user: any) {
  const documentTypeId = Number(data.document_type_id);

 const template = DOCUMENT_TEMPLATES[documentTypeId] || {
  name: 'Documento',
  title: 'DOCUMENTO',
  structure: '',
  promptInstruction:
    'Elabore um documento administrativo formal, claro e objetivo.',
};

const documentType = template.name;

  const prompt = `
Você é um assistente especializado em redação oficial administrativa brasileira.

Tipo documental: ${documentType}

Instrução específica:
${template.promptInstruction}

Estrutura esperada:
${template.structure}

Dados:
- Assunto: ${data.subject}
- Destinatário: ${data.recipient_name || 'Não informado'}
- Instruções: ${data.instructions}

Regras:
- Não invente fatos.
- Não inclua assinatura falsa.
- Use linguagem institucional.
- Respeite a estrutura esperada do tipo documental.
- Entregue apenas o corpo do documento.
`;

  let content = '';
  let generatedByAI = true;

  try {
    const response = await this.openai.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: prompt,
    });

    content = response.output_text;
  } catch (error) {
    console.error('Erro ao gerar documento com IA:', error);

    generatedByAI = false;

    content = `
${template.title}

Assunto: ${data.subject}

Destinatário: ${data.recipient_name || 'Não informado'}

Considerando a necessidade apresentada, encaminhamos o presente documento para tratar do assunto acima indicado.

${data.instructions}

Sem mais para o momento, renovamos votos de estima e consideração.
`;
  }

  return this.create(
    {
      document_type_id: data.document_type_id,
      subject: data.subject,
      recipient_name: data.recipient_name,
      recipient_email: data.recipient_email,
      content,
      ai_prompt: prompt,
      ai_model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      generated_by_ai: generatedByAI,
    },
    user,
  );
}
	
	
  async findAll() {
    const documents = await this.prisma.documents.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });

    const result = convertBigIntToString(documents);

    return result.map((doc: any) => ({
      ...doc,
      document_code: buildDocumentCode(doc),
    }));
  }

	async approve(id: string, data: any, user: any) {
  const document = await this.prisma.documents.findUnique({
    where: { id: BigInt(id) },
  });

  if (!document) {
    throw new NotFoundException('Documento não encontrado');
  }

  const updated = await this.prisma.documents.update({
    where: { id: BigInt(id) },
    data: { status: 'approved' },
  });

  await this.prisma.document_approvals.create({
  data: {
    document_id: BigInt(id),
    requested_by: BigInt(user.userId),
    approved_by: BigInt(user.userId),
    status: 'approved',
    comments: data.note || null,
    decided_at: new Date(),
  },
});

  const result = convertBigIntToString(updated);

  return {
    message: 'Documento aprovado com sucesso',
    ...result,
    document_code: buildDocumentCode(result),
  };
}

async reject(id: string, data: any, user: any) {
  const document = await this.prisma.documents.findUnique({
    where: { id: BigInt(id) },
  });

  if (!document) {
    throw new NotFoundException('Documento não encontrado');
  }

  const updated = await this.prisma.documents.update({
    where: { id: BigInt(id) },
    data: { status: 'review' },
  });

  await this.prisma.document_approvals.create({
  data: {
    document_id: BigInt(id),
    requested_by: BigInt(user.userId),
    approved_by: BigInt(user.userId),
    status: 'rejected',
    comments: data.note || null,
    decided_at: new Date(),
  },
});

  const result = convertBigIntToString(updated);

  return {
    message: 'Documento devolvido para revisão',
    ...result,
    document_code: buildDocumentCode(result),
  };
}
	
  async findOne(id: string) {
    const document = await this.prisma.documents.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    const result = convertBigIntToString(document);

    return {
      ...result,
      document_code: buildDocumentCode(result),
    };
  }

  async update(id: string, data: any) {
    const existing = await this.prisma.documents.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!existing) {
      throw new NotFoundException('Documento não encontrado');
    }

    if (existing.status !== 'draft') {
      throw new BadRequestException(
        'Somente documentos em rascunho podem ser editados',
      );
    }

    const updated = await this.prisma.documents.update({
      where: {
        id: BigInt(id),
      },
      data: {
        subject: data.subject ?? existing.subject,
        recipient_name: data.recipient_name ?? existing.recipient_name,
        recipient_email: data.recipient_email ?? existing.recipient_email,
        content: data.content ?? existing.content,
        status: data.status ?? existing.status,
      },
    });

    const result = convertBigIntToString(updated);

    return {
      ...result,
      document_code: buildDocumentCode(result),
    };
  }

  async create(data: any, user: any) {
    const institutionId = BigInt(user.institutionId);
    const documentTypeId = BigInt(data.document_type_id);
    const year = new Date().getFullYear();

    const document = await this.prisma.$transaction(async (tx) => {
      let sequence = await tx.document_sequences.findFirst({
        where: {
          institution_id: institutionId,
          document_type_id: documentTypeId,
          year,
        },
      });

      if (!sequence) {
        sequence = await tx.document_sequences.create({
          data: {
            institution_id: institutionId,
            document_type_id: documentTypeId,
            year,
            current_number: 0,
          },
        });
      }

      const lastDocument = await tx.documents.findFirst({
        where: {
          institution_id: institutionId,
          document_type_id: documentTypeId,
          year,
        },
        orderBy: {
          number: 'desc',
        },
      });

      const currentNumber = Math.max(
        sequence.current_number ?? 0,
        lastDocument?.number ?? 0,
      );

      const nextNumber = currentNumber + 1;

      await tx.document_sequences.update({
        where: {
          id: sequence.id,
        },
        data: {
          current_number: nextNumber,
        },
      });

      return tx.documents.create({
        data: {
          institution_id: institutionId,
          document_type_id: documentTypeId,
          template_id: data.template_id ? BigInt(data.template_id) : null,
          created_by: BigInt(user.userId),
          number: nextNumber,
          year,
          subject: data.subject,
          recipient_name: data.recipient_name,
          recipient_email: data.recipient_email,
          status: 'draft',
          content: data.content,
          ai_prompt: data.ai_prompt || null,
          ai_model: data.ai_model || null,
          generated_by_ai: data.generated_by_ai ?? false,
        },
      });
    });

    const result = convertBigIntToString(document);

    return {
      ...result,
      document_code: buildDocumentCode(result),
    };
  }
}