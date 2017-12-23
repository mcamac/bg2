export interface PlayerConnection {
  setStorage(storage: GameStorage): void
  notifyRoom(room)
}

export interface GameStorage {
  createUser(id: string): Promise<any>
  getRoom(id: string): Promise<any>
  onRoomJoin(id: string, player: string): Promise<any>
  onRoomLeave(id: string, player: string): Promise<any>
  onRoomStart(id: string): Promise<any>
  onRoomReset(id: string): Promise<any>
  onRoomMove(id: string, player: string, move: any): Promise<any>
}

export interface Room {
  name: string
  game?: object
}
