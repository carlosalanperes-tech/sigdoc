"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const documents_controller_1 = require("./documents.controller");
describe('DocumentsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [documents_controller_1.DocumentsController],
        }).compile();
        controller = module.get(documents_controller_1.DocumentsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=documents.controller.spec.js.map