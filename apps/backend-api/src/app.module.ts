import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { InventoryModule } from './inventory/inventory.module';
import { VenuesModule } from './venues/venues.module';
import { ReportsModule } from './reports/reports.module';
import { RequestsModule } from './requests/requests.module';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    AuthModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    InventoryModule,
    VenuesModule,
    ReportsModule,
    RequestsModule,
    AiAssistantModule,
  ],
})
export class AppModule {}
