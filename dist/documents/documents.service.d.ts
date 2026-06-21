import { documents_status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    private openai;
    sendByEmail(id: string, data: any, user: any): Promise<{
        message: string;
        document_id: string;
        document_code: any;
        recipient_email: any;
    }>;
    getApprovals(id: string): Promise<any>;
    generatePdf(id: string): Promise<Uint8Array<ArrayBufferLike>>;
    updateStatus(id: string, status: documents_status): Promise<any>;
    generate(data: any, user: any): Promise<any>;
    findAll(): Promise<any>;
    requestApproval(id: string, user: any): Promise<any>;
    approve(id: string, data: any, user: any): Promise<any>;
    reject(id: string, data: any, user: any): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    create(data: any, user: any): Promise<any>;
}
