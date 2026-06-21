import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2, 3, 4, 5)
  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2, 3)
  @Post('generate')
  generate(@Body() body: any, @Req() req: any) {
    return this.documentsService.generate(body, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2, 3)
  @Post(':id/send')
  sendByEmail(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.documentsService.sendByEmail(id, body, req.user);
  }

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(1, 2, 3)
@Post(':id/request-approval')
requestApproval(@Param('id') id: string, @Req() req: any) {
  return this.documentsService.requestApproval(id, req.user);
}	
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(1, 2, 4)
@Post(':id/approve')
approve(@Param('id') id: string, @Body() body: any, @Req() req: any) {
  return this.documentsService.approve(id, body, req.user);
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(1, 2, 4)
@Post(':id/reject')
reject(@Param('id') id: string, @Body() body: any, @Req() req: any) {
  return this.documentsService.reject(id, body, req.user);
}
	
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2, 3, 4, 5)
  @Get(':id/pdf')
  async generatePdf(@Param('id') id: string, @Res() res: any) {
    const pdf = await this.documentsService.generatePdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="documento-${id}.pdf"`,
    });

    res.send(pdf);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2, 3, 4, 5)
	@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(1, 2, 3, 4, 5)
@Get(':id/approvals')
getApprovals(@Param('id') id: string) {
  return this.documentsService.getApprovals(id);
}
	
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2, 4)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: any) {
    return this.documentsService.updateStatus(id, body.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2, 3)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.documentsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2, 3)
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.documentsService.create(body, req.user);
  }
}