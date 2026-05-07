import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { GisController } from "./gis.controller";

@Module({ imports: [AuthModule], controllers: [GisController] })
export class GisModule {}
