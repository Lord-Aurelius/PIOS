import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PublicSocialController, SocialController } from "./social.controller";

@Module({ imports: [AuthModule], controllers: [SocialController, PublicSocialController] })
export class SocialModule {}
