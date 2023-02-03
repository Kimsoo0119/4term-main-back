import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { EventDto } from '../dto/event.dto';
import { Events } from '../entity/events.entity';
import { Event } from '../interface/events.interface';

@EntityRepository(Events)
export class EventsRepository extends Repository<Events> {
  //  조회 관련
  async getEvents(): Promise<Event<string[]>[]> {
    try {
      const events: Event<string>[] = await this.createQueryBuilder('events')
        .leftJoin('events.eventImage', 'images')
        .select([
          'events.no AS no',
          'events.title AS title',
          'events.description AS description',
          'DATE_FORMAT(events.createdDate, "%Y.%m.%d %T") AS createdDate',
          'JSON_ARRAYAGG(images.imageUrl) AS images',
        ])
        .orderBy('no', 'DESC')
        .groupBy('events.no')
        .getRawMany();

      const convertEvents: Event<string[]>[] = events.map(
        ({ imageUrls, ...eventInfo }) => {
          const event: Event<string[]> = {
            ...eventInfo,
            imageUrls: JSON.parse(imageUrls),
          };

          return event;
        },
      );

      return convertEvents;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getEvents-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getEvent(eventNo: number): Promise<Events> {
    try {
      const events = await this.createQueryBuilder('events')
        .leftJoin('events.eventImage', 'images')
        .select([
          'events.no AS no',
          'events.title AS title',
          'events.description AS description',
          'JSON_ARRAYAGG(images.imageUrl) AS images',
        ])
        .where('events.no = :eventNo', { eventNo })
        .getRawOne();

      return events;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getEvent-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 생성 관련
  async createEvent(eventsDto: EventDto): Promise<void> {
    try {
      await this.createQueryBuilder('events')
        .insert()
        .into(Events)
        .values(eventsDto)
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createEvent-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 수정 관련
  async updateEvent(eventNo: number, eventsDto: EventDto): Promise<void> {
    try {
      await this.createQueryBuilder('events')
        .update(Events)
        .set(eventsDto)
        .where('no = :eventNo', { eventNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateEvent-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteEvent(eventNo: number): Promise<void> {
    try {
      await this.createQueryBuilder('events')
        .delete()
        .from(Events)
        .where('no = :eventNo', { eventNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteEvent-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
