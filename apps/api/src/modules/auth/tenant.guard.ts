import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }

    const payload = await this.jwt.verifyAsync(header.slice(7));
    request.tenantContext = {
      tenantId: payload.tenantId,
      campaignId: payload.campaignId,
      userId: payload.sub,
      permissions: payload.permissions ?? []
    };
    return true;
  }
}
