import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, path } = req;

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        this.metricsService.httpRequestsTotal.inc({
          method,
          path: this.normalizePath(path),
          status_code: String(res.statusCode),
        });
      }),
    );
  }

  private normalizePath(path: string): string {
    return path.replace(/\/[a-z0-9]{20,}/gi, '/:id');
  }
}
