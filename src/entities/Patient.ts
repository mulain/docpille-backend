import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  firstName!: string

  @Column()
  lastName!: string

  @Column({ nullable: true })
  dateOfBirth?: string

  @Column()
  @Index({ unique: true })
  email!: string

  @Column({ nullable: true })
  phoneNumber?: string

  @Column()
  passwordHash!: string

  @Column({ nullable: true })
  address?: string

  @Column({ default: false })
  isEmailVerified!: boolean

  @Column({ type: 'varchar', nullable: true })
  emailVerificationToken?: string | null

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationExpires?: Date | null

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date | null

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
