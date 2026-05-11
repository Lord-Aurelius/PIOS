import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AlertsModule } from "./modules/alerts/alerts.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { AuthModule } from "./modules/auth/auth.module";
import { FieldModule } from "./modules/field/field.module";
import { GisModule } from "./modules/gis/gis.module";
import { IntelligenceModule } from "./modules/intelligence/intelligence.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { SocialModule } from "./modules/social/social.module";
import { SurveysModule } from "./modules/surveys/surveys.module";
import { VoterImportsModule } from "./modules/voter-imports/voter-imports.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AccountsModule,
    AuthModule,
    IntelligenceModule,
    FieldModule,
    SocialModule,
    GisModule,
    SurveysModule,
    VoterImportsModule,
    AlertsModule
  ]
})
export class AppModule {}
