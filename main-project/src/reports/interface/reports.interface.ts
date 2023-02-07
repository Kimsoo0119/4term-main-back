export interface Report<T> {
  no: number;
  title: string;
  description: string;
  userNo: number;
  targetBoardNo?: number;
  targetUserNo?: number;
  createdDate?: Date;
  imageUrls?: T;
}
