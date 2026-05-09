import { Body, Controller, Post } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { PrismaService } from "../prisma/prisma.service";

type WorkspaceRole = "creator" | "candidate" | "media" | "clerk" | "field";

type StoredAccount = {
  candidateName?: string;
  office?: string;
  party?: string;
  region?: string;
  userKey: string;
  username: string;
  password?: string;
  passwordHash?: string;
  passwordSalt?: string;
  role: WorkspaceRole;
  status: "Active" | "Suspended";
  updatedAt: string;
};

type AccountConfig = {
  creatorAccount?: StoredAccount;
  clientAccounts?: StoredAccount[];
};

class CandidateAccountDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  office!: string;

  @IsString()
  party!: string;

  @IsString()
  region!: string;

  @IsString()
  @MinLength(3)
  userKey!: string;

  @IsString()
  @MinLength(3)
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

class CreatorAccountDto {
  @IsString()
  @MinLength(3)
  userKey!: string;

  @IsString()
  @MinLength(3)
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

class LoginDto {
  @IsString()
  userKey!: string;

  @IsString()
  username!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsIn(["creator", "candidate", "media", "clerk", "field"])
  role?: WorkspaceRole;
}

@Controller("public/accounts")
export class AccountsController {
  private readonly platformSlug = "house-aurelius-platform";

  constructor(private readonly prisma: PrismaService) {}

  @Post("candidates")
  async saveCandidate(@Body() body: CandidateAccountDto) {
    const { tenant, config } = await this.getPlatformConfig();
    const account: StoredAccount = {
      candidateName: body.name,
      office: body.office,
      party: body.party,
      region: body.region,
      userKey: body.userKey,
      username: body.username,
      ...this.hashPassword(body.password),
      role: "candidate",
      status: "Active",
      updatedAt: new Date().toISOString()
    };
    const existing = config.clientAccounts ?? [];
    const clientAccounts = [account, ...existing.filter((item) => item.username.toLowerCase() !== body.username.toLowerCase() && item.userKey.toLowerCase() !== body.userKey.toLowerCase())];
    await this.saveConfig(tenant.id, { ...config, clientAccounts });
    return { ok: true, username: account.username, role: account.role, candidateName: account.candidateName };
  }

  @Post("creator")
  async saveCreator(@Body() body: CreatorAccountDto) {
    const { tenant, config } = await this.getPlatformConfig();
    const creatorAccount: StoredAccount = {
      userKey: body.userKey,
      username: body.username,
      ...this.hashPassword(body.password),
      role: "creator",
      status: "Active",
      updatedAt: new Date().toISOString()
    };
    await this.saveConfig(tenant.id, { ...config, creatorAccount });
    return { ok: true, username: creatorAccount.username, role: creatorAccount.role };
  }

  @Post("login")
  async login(@Body() body: LoginDto) {
    const { config } = await this.getPlatformConfig();
    const defaultCreator: StoredAccount = {
      userKey: process.env.CREATOR_DEFAULT_USER_KEY ?? "CREATOR-HQ",
      username: process.env.CREATOR_DEFAULT_USERNAME ?? "creator@pios.local",
      password: process.env.CREATOR_DEFAULT_PASSWORD ?? "Creator123!",
      role: "creator",
      status: "Active",
      updatedAt: new Date().toISOString()
    };
    const accounts = [config.creatorAccount ?? defaultCreator, ...(config.clientAccounts ?? [])];
    const match = accounts.find(
      (account) =>
        account.status === "Active" &&
        (!body.role || account.role === body.role) &&
        account.userKey.toLowerCase() === body.userKey.trim().toLowerCase() &&
        account.username.toLowerCase() === body.username.trim().toLowerCase() &&
        this.verifyPassword(account, body.password)
    );
    if (!match) {
      return { ok: false, message: "Invalid user key, username, or password." };
    }
    return {
      ok: true,
      username: match.username,
      role: match.role,
      candidateName: match.candidateName
    };
  }

  private async getPlatformConfig() {
    const tenant = await this.prisma.tenant.upsert({
      where: { slug: this.platformSlug },
      update: {},
      create: {
        name: "House Aurelius Platform",
        slug: this.platformSlug,
        country: "Kenya",
        brand: {}
      }
    });
    const config = (tenant.aiConfig ?? {}) as unknown as AccountConfig;
    return { tenant, config };
  }

  private async saveConfig(tenantId: string, config: AccountConfig) {
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { aiConfig: config as unknown as Prisma.InputJsonValue }
    });
  }

  private hashPassword(password: string) {
    const passwordSalt = randomBytes(16).toString("hex");
    const passwordHash = scryptSync(password, passwordSalt, 64).toString("hex");
    return { passwordHash, passwordSalt };
  }

  private verifyPassword(account: StoredAccount, password: string) {
    if (account.passwordHash && account.passwordSalt) {
      const attempted = scryptSync(password, account.passwordSalt, 64);
      const stored = Buffer.from(account.passwordHash, "hex");
      return stored.length === attempted.length && timingSafeEqual(stored, attempted);
    }
    return account.password === password;
  }
}
