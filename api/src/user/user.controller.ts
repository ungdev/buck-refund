import { Body, Controller, Post, Put } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { User } from './interfaces/user.interface';
import UsersService from './user.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import UserSetIbanDto from './dto/req/user-set-iban.dto';
import { AppException, ERROR_CODE } from 'src/exceptions';
import { ApiAppErrorResponse } from 'src/app.dto';
import { ConfigModule } from 'src/config/config.module';

@Controller('user')
@ApiTags('User')
export default class UsersController {
  constructor(private usersService: UsersService, private config: ConfigModule) {}

  @Put('/iban')
  @ApiOperation({ description: 'Sets the IBAN of the current user.' })
  @ApiOkResponse()
  @ApiAppErrorResponse(ERROR_CODE.IBAN_INVALID, 'The IBAN provided verification keys are not matching its content')
  async setCurrentIban(@GetUser() user: User, @Body() dto: UserSetIbanDto) {
    const data = await this.usersService.consumeLocker(user, dto.data);
    if (!data) throw new AppException(ERROR_CODE.LOCKER_ERROR);
    if (user.processed) throw new AppException(ERROR_CODE.ALREADY_PROCESSED);
    if (user.balance < 1)
      throw new AppException(
        ERROR_CODE.USER_BALANCE_TOO_LOW,
        (this.config.BALANCE_MIN_VALUE / 100).toLocaleString('fr-FR', { currency: 'EUR', style: 'currency' }),
      );
    if (!this.usersService.isValidIban(data)) throw new AppException(ERROR_CODE.IBAN_INVALID);
    await this.usersService.setIban(user.id, data);
    return {};
  }

  @Post('/locker')
  @ApiOperation({ description: 'Creates a locker instance' })
  @ApiOkResponse()
  @ApiAppErrorResponse(ERROR_CODE.IBAN_INVALID, 'The IBAN provided verification keys are not matching its content')
  async getLocker(@GetUser() user: User) {
    if (user.processed) throw new AppException(ERROR_CODE.ALREADY_PROCESSED);
    const data = await this.usersService.createLocker(user.id);
    return { data };
  }
}
