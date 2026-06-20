"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function convertBigIntToString(obj) {
    return JSON.parse(JSON.stringify(obj, (_, value) => typeof value === 'bigint' ? value.toString() : value));
}
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary() {
        const [totalDocuments, totalUsers, byStatus, byType, generatedByAI, sentDocuments, pendingApproval,] = await Promise.all([
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
        const typeMap = {
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
                document_type_name: typeMap[Number(item.document_type_id)] || 'Tipo não identificado',
                total: item._count.id,
            })),
        });
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map