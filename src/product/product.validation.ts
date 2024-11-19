import { BadRequestException } from '@nestjs/common';

interface ProductValidationResult {
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  stock: number;
  type: string;
}

export function validateProductData(body: any): ProductValidationResult {
  const errors = [];

  // Name validation
  if (!body.name) {
    errors.push('Name is required');
  } else if (typeof body.name !== 'string') {
    errors.push('Name must be a string');
  }

  // Price validation
  if (!body.price) {
    errors.push('Price is required');
  } else {
    const price = Number(body.price);
    if (isNaN(price)) {
      errors.push('Price must be a valid number');
    } else if (price < 0) {
      errors.push('Price cannot be negative');
    }
  }

  // Stock validation
  if (body.stock === undefined) {
    errors.push('Stock is required');
  } else {
    const stock = Number(body.stock);
    if (isNaN(stock)) {
      errors.push('Stock must be a valid number');
    } else if (!Number.isInteger(stock)) {
      errors.push('Stock must be a whole number');
    } else if (stock < 0) {
      errors.push('Stock cannot be negative');
    }
  }

  // Type validation
  if (!body.type) {
    errors.push('Type is required');
  } else if (typeof body.type !== 'string') {
    errors.push('Type must be a string');
  }

  // Optional fields validation
  if (body.description && typeof body.description !== 'string') {
    errors.push('Description must be a string');
  }

  if (body.image_url && typeof body.image_url !== 'string') {
    errors.push('Image URL must be a string');
  }

  if (errors.length > 0) {
    throw new BadRequestException({
      status: 'error',
      message: 'Validation failed',
      errors,
    });
  }

  // Return validated and transformed data
  return {
    name: body.name.trim(),
    price: Number(body.price),
    stock: Number(body.stock),
    type: body.type.trim(),
    ...(body.description && { description: body.description.trim() }),
    ...(body.image_url && { image_url: body.image_url.trim() }),
  };
}
