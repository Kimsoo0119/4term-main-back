import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Board } from './board.entity';

// fk없음, entity취합 후 생성예정
@Entity('board_member_infos')
export class BoardMemberInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'int' })
  male: number;

  @Column({ type: 'int' })
  female: number;

  @OneToOne((type) => Board, (board) => board.boardMemberaInfo)
  @JoinColumn({ name: 'board_no' })
  boardNo: Board;
}
