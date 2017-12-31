import {Entity, Column} from 'typeorm'

@Entity()
export class Room {
  id: number
  name: string

  @Column('json') state: any
}
