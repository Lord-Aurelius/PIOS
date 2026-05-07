import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AlertsModule } from "./modules/alerts/alerts.module";
import { AuthModule } from "./modules/auth/auth.module";
import { FieldModule } from "./modules/field/field.module";
import { GisModule } from "./modules/gis/gis.module";
import { IntelligenceModule } from "./modules/intelligence/intelligence.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { SocialModule } from "./modules/social/social.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    IntelligenceModule,
    FieldModule,
    SocialModule,
    GisModule,
    AlertsModule
  ]
})
export class AppModule {}
