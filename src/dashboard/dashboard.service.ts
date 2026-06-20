import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function convertBigIntToString(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    ),
  );
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [
      totalDocuments,
      totalUsers,
      byStatus,
      byType,
      generatedByAI,
      sentDocuments,
      pendingApproval,
    ] = await Promise.all([
      this.prisma.documents.count(),
      this.prisma.users.count(),

      this.prisma.documents.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      }),

      this.prisma.documents.groupBy({
        by: ['document_type_id'],
        _count: {
          id: true,
        },
      }),

      this.prisma.documents.count({
        where: {
          generated_by_ai: true,
        },
      }),

      this.prisma.documents.count({
        where: {
          status: 'sent',
        },
      }),

      this.prisma.documents.count({
        where: {
          status: 'pending_approval',
        },
      }),
    ]);

    const typeMap: Record<number, string> = {
      1: 'Ofício',
      2: 'Memorando',
      3: 'Aviso Institucional',
      4: 'Comunicação Interna',
      5: 'Portaria',
      6: 'Relatório',
    };

    return convertBigIntToString({
      totals: {
        documents: totalDocuments,
        users: totalUsers,
        generated_by_ai: generatedByAI,
        sent: sentDocuments,
        pending_approval: pendingApproval,
      },
      documents_by_status: byStatus.map((item) => ({
        status: item.status,
        total: item._count.id,
      })),
      documents_by_type: byType.map((item) => ({
        document_type_id: item.document_type_id.toString(),
        document_type_name:
          typeMap[Number(item.document_type_id)] || 'Tipo não identificado',
        total: item._count.id,
      })),
    });
  }
}