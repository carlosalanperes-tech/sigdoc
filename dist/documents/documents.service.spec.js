"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const documents_service_1 = require("./documents.service");
describe('DocumentsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [documents_service_1.DocumentsService],
        }).compile();
        service = module.get(documents_service_1.DocumentsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=documents.service.spec.js.map