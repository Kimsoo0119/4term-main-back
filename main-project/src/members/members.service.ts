import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GuestMembersRepository } from './repository/guest-members.repository';
import { HostMembersRepository } from './repository/host-members.repository';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(GuestMembersRepository)
    private readonly guestMembersRepository: GuestMembersRepository,

    @InjectRepository(HostMembersRepository)
    private readonly hostMembersRepository: HostMembersRepository,
  ) {}

  async addGuestMembers(meetingNo, host) {
    const raw = await this.guestMembersRepository.addGuestMembers(
      meetingNo,
      host,
    );
  }

  async addHostMembers(meetingNo, host) {
    const raw = await this.hostMembersRepository.addHostMembers(
      meetingNo,
      host,
    );
  }
}
