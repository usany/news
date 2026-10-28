import { Controller, Get } from '@nestjs/common';
import { RouteService } from './route.service.js';

@Controller('route')
export class RouteController {
  constructor(private readonly route: RouteService) {}

  /**
   * GET /route
   *
   * Lists the objects in the configured object storage bucket so a React SPA
   * can render and play them. See {@link RouteService.getRoute}.
   */
  @Get()
  getRoute() {
    return this.route.getRoute();
  }
}
