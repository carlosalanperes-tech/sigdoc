"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const dashboard_service_1 = require("./dashboard.service");
describe('DashboardService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [dashboard_service_1.DashboardService],
        }).compile();
        service = module.get(dashboard_service_1.DashboardService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=dashboard.service.spec.js.map