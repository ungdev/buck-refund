import { Global, Module } from '@nestjs/common';
import UsersController from './user.controller';
import UsersService from './user.service';

@Global()
@Module({ controllers: [UsersController], providers: [UsersService], exports: [UsersService] })
export class UsersModule {}
