import { Body, Controller, Put } from '@nestjs/common';
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
  async getCurrentUser(@GetUser() user: User, @Body() dto: UserSetIbanDto) {
    if (user.balance < 1)
      throw new AppException(
        ERROR_CODE.USER_BALANCE_TOO_LOW,
        (this.config.BALANCE_MIN_VALUE / 100).toLocaleString('fr-FR', { currency: 'EUR', style: 'currency' }),
      );
    if (!this.usersService.isValidIban(dto.data)) throw new AppException(ERROR_CODE.IBAN_INVALID);
    await this.usersService.setIban(user.id, dto);
    return {};
  }
}
