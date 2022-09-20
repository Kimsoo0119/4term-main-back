import { Users } from 'src/users/entity/user.entity';
import { Meetings } from '../entity/meeting.entity';

export interface MeetingResponse {
  affectedRows: number;
  insertId?: number;
}

export interface MeetingDetail {
  location: string;
  time: Date;
}

export interface MeetingMemberDetail {
  host: Users;
  meeting: Meetings;
  hostHeadcount: number;
  guestHeadcount: number;
}
