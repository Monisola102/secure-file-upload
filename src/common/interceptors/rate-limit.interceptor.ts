import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ERROR_MESSAGES } from '../constants';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private readonly requests = new Map<string, number[]>();
  private readonly maxRequests = 10;
  private readonly windowMs = 60 * 1000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      return next.handle();
    }

    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];

    const recentRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );

    if (recentRequests.length >= this.maxRequests) {
      throw new HttpException(
        ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    this.cleanup(now);

    return next.handle();
  }

  private cleanup(now: number): void {
    for (const [userId, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(
        (timestamp) => now - timestamp < this.windowMs,
      );

      if (validTimestamps.length === 0) {
        this.requests.delete(userId);
      } else {
        this.requests.set(userId, validTimestamps);
      }
    }
  }
}
