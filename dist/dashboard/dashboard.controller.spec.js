"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const dashboard_controller_1 = require("./dashboard.controller");
describe('DashboardController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [dashboard_controller_1.DashboardController],
        }).compile();
        controller = module.get(dashboard_controller_1.DashboardController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=dashboard.controller.spec.js.map