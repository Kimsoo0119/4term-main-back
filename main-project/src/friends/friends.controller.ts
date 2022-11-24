import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateFriendDto } from './dto/create-friend.dto';
import { DeleteFriendDto } from './dto/delete-friend.dto';
import { FriendsService } from './friends.service';

@Controller('friends')
@ApiTags('친구 API')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get('/:userNo')
  @ApiOperation({
    summary: '친구 목록 API',
    description: '친구 목록 조회',
  })
  async getFriendList(
    @Param('userNo', ParseIntPipe) userNo: number,
  ): Promise<object> {
    const response = await this.friendsService.getFriendList(userNo);

    return { response };
  }

  @Post('/request')
  @ApiOperation({
    summary: '친구 신청 API',
    description: '친구 신청 API',
  })
  async createFriendRequest(
    @Body() createFriendDto: CreateFriendDto,
  ): Promise<object> {
    await this.friendsService.createFriendRequest(createFriendDto);

    return {
      msg: '친구 신청이 완료되었습니다.',
    };
  }

  @Patch('/accept/:userNo')
  @ApiOperation({
    summary: '친구  요청 수락 API',
    description: '토큰의 userNo와 body로 받은 senderNo',
  })
  async acceptFriend(
    @Param('userNo', ParseIntPipe) receiverNo: number,
    @Body('senderNo', ParseIntPipe) senderNo: number,
  ): Promise<object> {
    await this.friendsService.acceptFriendRequest(receiverNo, senderNo);

    return {
      msg: '친구 신청을 수락했습니다.',
    };
  }

  @Get('/request/receive/:userNo')
  @ApiOperation({
    summary: '받은 친구 신청 목록 조회 API',
    description: '유저가 받은 친구 신청 전체 조회',
  })
  async getAllReceiveFriendRequest(
    @Param('userNo', ParseIntPipe) receiverNo: number,
  ): Promise<object> {
    const response = await this.friendsService.getAllReceiveFriendRequest(
      receiverNo,
    );

    return { response };
  }

  @Get('/request/send/:userNo')
  @ApiOperation({
    summary: '보낸 친구 신청 목록 조회 API',
    description: '유저가 보낸 친구 신청 전체조회',
  })
  async getAllSendFriendRequest(
    @Param('userNo', ParseIntPipe) senderNo: number,
  ): Promise<object> {
    const response = await this.friendsService.getAllSendFriendRequest(
      senderNo,
    );

    return { response };
  }

  @Delete('/request/refuse/:userNo')
  @ApiOperation({
    summary: '친구 신청 거절 API',
    description: '친구 신청 거절 API',
  })
  async refuseRequest(
    @Param('userNo', ParseIntPipe) receiverNo: number,
    @Body('friendNo', ParseIntPipe) senderNo: number,
  ) {
    await this.friendsService.refuseRequest({ receiverNo, senderNo });

    return {
      msg: '친구 요청을 거절했습니다.',
    };
  }

  // 추후 토큰의 유저no와 friendNo 확인 후 삭제
  @Delete('/delete')
  @ApiOperation({
    summary: '친구 삭제 API',
    description: '친구 삭제 API',
  })
  async deleteFriend(
    @Body() deleteFriendDto: DeleteFriendDto,
  ): Promise<object> {
    await this.friendsService.deleteFriend(deleteFriendDto);

    return {
      msg: '친구삭제가 완료되었습니다.',
    };
  }

  @Get('/search/:nickname')
  @ApiOperation({
    summary: '친구 검색 API',
    description: '닉네임으로 친구 검색',
  })
  async searchFriend(
    @Param('nickname') nickname: string,
    @Body('userNo', ParseIntPipe) userNo: number,
  ) {
    const response = await this.friendsService.searchFriend(nickname, userNo);

    return {
      response,
    };
  }
}
