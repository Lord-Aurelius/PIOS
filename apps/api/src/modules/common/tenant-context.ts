import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type RequestTenantContext = {
  tenantId: string;
  campaignId?: string;
  userId: string;
  permissions: string[];
};

export const TenantContext = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestTenantContext => {
    const request = context.switchToHttp().getRequest();
    return request.tenantContext;
  }
);
