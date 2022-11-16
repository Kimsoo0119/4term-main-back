import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingInfoRepository } from 'src/meetings/repository/meeting-info.repository';
import { MeetingRepository } from 'src/meetings/repository/meeting.repository';
import { InsertResult } from 'typeorm';
import { ChatList } from './entity/chat-list.entity';
import {
  ChatRoom,
  ChatRoomList,
  ChatRoomUsers,
  ChatUserInfo,
  CreateChat,
  JoinChatRoom,
  MessagePayload,
} from './interface/chat.interface';
import { ChatListRepository } from './repository/chat-list.repository';
import { ChatLogRepository } from './repository/chat-log.repository';
import { ChatUsersRepository } from './repository/chat-users.repository';

@Injectable()
export class ChatsGatewayService {
  constructor(
    @InjectRepository(ChatListRepository)
    private readonly chatListRepository: ChatListRepository,

    @InjectRepository(ChatUsersRepository)
    private readonly chatUsersRepository: ChatUsersRepository,

    @InjectRepository(ChatLogRepository)
    private readonly chatLogRepository: ChatLogRepository,

    @InjectRepository(MeetingRepository)
    private readonly meetingRepository: MeetingRepository,

    @InjectRepository(MeetingInfoRepository)
    private readonly meetingInfoRepository: MeetingInfoRepository,
  ) {}

  async initSocket(socket, userNo: number): Promise<void> {
    try {
      const chatRoomList = await this.getChatRoomListByUserNo(
        Object.values(userNo),
      );
      if (chatRoomList) {
        chatRoomList.forEach((el) => {
          socket.join(`${el.chatRoomNo}`);
        });
      }
    } catch (err) {
      throw err;
    }
  }

  async createRoom(socket, chat: CreateChat): Promise<void> {
    try {
      const { meetingNo } = chat;

      const meetingExist = await this.meetingRepository.findMeetingById(
        meetingNo,
      );
      if (!meetingExist) {
        throw new NotFoundException(
          `meetingNo가 ${meetingNo}인 약속을 찾지 못했습니다.`,
        );
      }

      const roomExist = await this.chatListRepository.checkRoomExistByMeetingNo(
        meetingNo,
      );
      if (roomExist) {
        throw new BadRequestException('이미 생성된 채팅방 입니다.');
      }

      const { roomName, userNo } = await this.getUserByMeetingNo(meetingNo);
      if (!roomName) {
        throw new NotFoundException('Meeting 정보 조회 오류입니다.');
      }

      const userNoList: number[] = userNo.split(',').map((item) => {
        return parseInt(item);
      });

      const chatRoomNo: number = await this.createRoomByMeetingNo({
        meetingNo,
        roomName,
      });
      if (!chatRoomNo) {
        throw new BadRequestException('채팅방 생성 오류입니다.');
      }

      const roomUsers: object[] = userNoList.reduce((values, userNo) => {
        values.push({ chatRoomNo, userNo });
        return values;
      }, []);

      const result = await this.setRoomUsers(roomUsers);
      if (!result) {
        throw new BadRequestException('채팅방 유저정보 생성 오류입니다.');
      }

      socket.join(`${chatRoomNo}`);
    } catch (err) {
      throw err;
    }
  }

  async joinRoom(socket, chat: JoinChatRoom): Promise<void> {
    try {
      const { userNo, chatRoomNo } = chat;
      const user: ChatRoomUsers =
        await this.chatListRepository.isUserInChatRoom(chatRoomNo, userNo);
      if (!user) {
        throw new BadRequestException('채팅방에 유저의 정보가 없습니다.');
      }

      socket.join(`${user.chatRoomNo}`);

      //추후 로그 또는 삭제
      socket.broadcast.to(`${user.chatRoomNo}`).emit('join-room', {
        username: user.nickname,
        msg: `${user.nickname}님이 접속하셨습니다.`,
      });
    } catch (err) {
      throw err;
    }
  }

  async getChatRoomListByUserNo(userNo): Promise<ChatRoomList[]> {
    try {
      const chatList: ChatRoomList[] =
        await this.chatUsersRepository.getChatRoomList(userNo);
      if (!chatList.length) {
        throw new BadRequestException('채팅방이 존재하지 않습니다.');
      }

      return chatList;
    } catch (err) {
      throw err;
    }
  }

  async sendChat(socket, messagePayload: MessagePayload): Promise<void> {
    try {
      const { userNo, chatRoomNo, message } = messagePayload;
      const chatRoom: ChatList = await this.checkChatRoom(chatRoomNo);
      if (!chatRoom) {
        throw new BadRequestException('존재하지 않는 채팅방입니다.');
      }

      const user: ChatRoomUsers =
        await this.chatListRepository.isUserInChatRoom(chatRoomNo, userNo);
      if (!user) {
        throw new BadRequestException('채팅방에 유저의 정보가 없습니다.');
      }

      await this.saveMessage(messagePayload);

      socket.broadcast.to(`${chatRoomNo}`).emit('message', {
        message,
        userNo,
        chatRoomNo,
      });
    } catch (err) {
      throw err;
    }
  }

  private async saveMessage(messagePayload: MessagePayload): Promise<void> {
    try {
      const insertId = await this.chatLogRepository.saveMessage(messagePayload);
      if (!insertId) {
        throw new BadRequestException('매세지 저장 오류 입니다.');
      }
    } catch (err) {
      throw err;
    }
  }

  private async getUserByMeetingNo(meetingNo): Promise<ChatRoom> {
    try {
      const meetingInfo: ChatRoom =
        await this.meetingInfoRepository.getMeetingUserByMeetingNo(meetingNo);

      meetingInfo.roomName =
        meetingInfo.guestUserNickname + ',' + meetingInfo.hostUserNickname;
      meetingInfo.userNo =
        meetingInfo.guestUserNo + ',' + meetingInfo.hostUserNo;

      return meetingInfo;
    } catch (err) {
      throw err;
    }
  }

  private async setRoomUsers(roomUsers): Promise<InsertResult> {
    try {
      const affectedRows: InsertResult =
        await this.chatUsersRepository.setRoomUsers(roomUsers);

      return affectedRows;
    } catch (err) {
      throw err;
    }
  }

  private async createRoomByMeetingNo(createChat: CreateChat): Promise<number> {
    try {
      const insertId: number = await this.chatListRepository.createRoom(
        createChat,
      );

      return insertId;
    } catch (err) {
      throw err;
    }
  }

  private async checkChatRoom(chatRoomNo): Promise<ChatList> {
    try {
      const chatRoom = await this.chatListRepository.checkRoomExistByChatNo(
        chatRoomNo,
      );

      return chatRoom;
    } catch (error) {
      throw error;
    }
  }
}