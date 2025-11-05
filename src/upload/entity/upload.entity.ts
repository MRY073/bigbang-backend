import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('uploads')
export class UploadEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, comment: '文件原始名称' })
  originalName: string;

  @Column({ type: 'varchar', length: 255, comment: '文件存储路径' })
  filePath: string;

  @Column({ type: 'varchar', length: 100, comment: '文件类型（MIME类型）' })
  mimeType: string;

  @Column({ type: 'bigint', comment: '文件大小（字节）' })
  fileSize: number;

  @Column({ type: 'varchar', length: 50, comment: '上传类型参数' })
  type: string;

  @Column({ type: 'varchar', length: 100, comment: '店铺参数' })
  shop: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
