import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TenantGuard } from "./tenant.guard";

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET", "dev-secret-change-me"),
        signOptions: { expiresIn: "8h" }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, TenantGuard],
  exports: [AuthService, TenantGuard, JwtModule]
})
export class AuthModule {}
