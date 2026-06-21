import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    findAll(): Promise<any>;
    generate(body: any, req: any): Promise<any>;
    sendByEmail(id: string, body: any, req: any): Promise<{
        message: string;
        document_id: string;
        document_code: any;
        recipient_email: any;
    }>;
    requestApproval(id: string, req: any): Promise<any>;
    approve(id: string, body: any, req: any): Promise<any>;
    reject(id: string, body: any, req: any): Promise<any>;
    generatePdf(id: string, res: any): Promise<void>;
    getApprovals(id: string): Promise<any>;
    findOne(id: string): Promise<any>;
    updateStatus(id: string, body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    create(body: any, req: any): Promise<any>;
}
