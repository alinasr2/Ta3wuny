export interface IReview {
  id: number;
  reviewerName: string;
  reviewerImageUrl: string;
  targetName: string;
  targetImageUrl: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  orderId?: number;
}

export interface IRatingSummary {
  userId: string;
  averageRating: number;
  totalReviews: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
}

export interface ICreateReview {
  orderId: number;
  targetUserId: string;
  rating: number;
  comment: string;
}
