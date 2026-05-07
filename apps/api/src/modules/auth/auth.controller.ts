import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { IsEmail, IsString, MinLength } from "class-validator";
import { RequestTenantContext, TenantContext } from "../common/tenant-context";
import { AuthService } from "./auth.service";
import { TenantGuard } from "./tenant.guard";

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  tenantSlug!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  login(@Body() body: LoginDto) {
    return this.auth.login(body);
  }

  @Get("me")
  @UseGuards(TenantGuard)
  me(@TenantContext() context: RequestTenantContext) {
    return this.auth.me(context.userId);
  }
}
