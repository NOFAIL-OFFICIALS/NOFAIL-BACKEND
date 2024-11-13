import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop({ unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  businessName: string;

  @Prop()
  cacNumber: string;
}

export const userSchema = SchemaFactory.createForClass(User);
