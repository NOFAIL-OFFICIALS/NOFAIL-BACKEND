import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Product } from 'src/product/entity/product.entity';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Shop extends Document {
  @Prop()
  name: string;

  @Prop()
  category: string;

  @Prop()
  contact: string;

  @Prop()
  user_id: string;

  @Prop()
  unique_url: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    required: false,
  })
  products: Product[];
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
