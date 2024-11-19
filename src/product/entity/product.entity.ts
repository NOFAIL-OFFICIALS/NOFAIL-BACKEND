import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/entities/user.entity';

@Schema()
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user_id: User;

  @Prop({ required: true })
  price: number;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true })
  image_url: string;

  @Prop({ required: true })
  stock: number;

  @Prop({ required: true })
  type: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;

  @Prop({ unique: true })
  code: string;
}

export const productSchema = SchemaFactory.createForClass(Product);

productSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Only generate code for new documents
    const Product = this.constructor as any;

    // Find the document with the highest code number
    const lastProduct = await Product.findOne({}, { code: 1 })
      .sort({ code: -1 }) // Sort in descending order
      .limit(1);

    console.log(lastProduct);
    if (lastProduct) {
      // Extract the number from the last code and increment it
      const lastNumber = parseInt(lastProduct.code.replace('PROD', ''));
      this.code = `PROD${String(lastNumber + 1)}`;
    } else {
      this.code = 'PROD1';
    }
  }
  next();
});
