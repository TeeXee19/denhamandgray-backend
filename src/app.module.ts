import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { DbService } from './db/db.service';
import { PostsModule } from './posts/posts.module';
import { NotificationModule } from './notification/notificationl.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    AuthModule, 
    DbModule, 
    PostsModule, 
    NotificationModule,
    CloudinaryModule
  ],
  controllers: [AppController],
  providers: [AppService, DbService],
})
export class AppModule {}
