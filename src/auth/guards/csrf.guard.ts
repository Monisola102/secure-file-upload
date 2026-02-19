import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ERROR_MESSAGES } from '../../common/constants';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    const csrfTokenFromHeader = request.headers['x-csrf-token'];
    const csrfTokenFromSession = request.session?.csrfToken;

    if (!csrfTokenFromHeader || !csrfTokenFromSession) {
      throw new ForbiddenException(ERROR_MESSAGES.CSRF_TOKEN_INVALID);
    }

    const isValid = this.authService.validateCsrfToken(
      csrfTokenFromHeader,
      csrfTokenFromSession,
    );

    if (!isValid) {
      throw new ForbiddenException(ERROR_MESSAGES.CSRF_TOKEN_INVALID);
    }

    return true;
  }
}