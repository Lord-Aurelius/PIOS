import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { FieldController } from "./field.controller";

@Module({ imports: [AuthModule], controllers: [FieldController] })
export class FieldModule {}
