import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { createHash } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";

type LoginInput = {
  email: string;
  password: string;
  tenantSlug: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async login(input: LoginInput) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: input.tenantSlug } });
    if (!tenant) throw new UnauthorizedException("Invalid credentials");

    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email: input.email } },
      include: { memberships: { include: { role: true, campaign: true } } }
    });
    if (!user || user.passwordHash !== this.hash(input.password)) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const membership = user.memberships[0];
    const permissions = user.memberships.flatMap((item) => item.role.permissions);
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      tenantId: tenant.id,
      campaignId: membership?.campaignId,
      permissions
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tenant: { id: tenant.id, name: tenant.name, brand: tenant.brand },
        campaign: membership?.campaign
      }
    };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, status: true, mfaEnabled: true }
    });
  }

  private hash(password: string) {
    return createHash("sha256").update(password).digest("hex");
  }
}
