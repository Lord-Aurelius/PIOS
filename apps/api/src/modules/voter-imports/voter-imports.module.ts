import { Module } from "@nestjs/common";
import { VoterImportsController } from "./voter-imports.controller";

@Module({ controllers: [VoterImportsController] })
export class VoterImportsModule {}
