export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;

  category: string;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;

  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;

  reviews: {
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }[];

  returnPolicy: string;

  meta: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };

  thumbnail: string;
  images: string[];
};
