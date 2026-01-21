export interface Room {
  id: string;
  name: string;
  createdAt: number;
}

export interface RoomListResponse {
  rooms: Room[];
}
