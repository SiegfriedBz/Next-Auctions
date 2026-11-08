import { z } from "zod";
import { UserSchema } from "./user";

// enums
export const AuctionCategorySchema = z.enum([
  "ELECTRONICS",
  "FASHION",
  "COLLECTIBLES",
  "ART",
  "MUSIC",
  "SPORTS",
  "HOME",
  "TOYS",
  "AUTOMOTIVE",
]);
export type AuctionCategory = z.infer<typeof AuctionCategorySchema>;

export const AuctionStatusSchema = z.enum(["DRAFT", "OPEN", "CLOSED"]);
export type AuctionStatus = z.infer<typeof AuctionStatusSchema>;

// Auction
export const AuctionSchema = z.object({
  id: z.uuid(),
  ownerId: z.uuid(),
  highestBidderId: z.uuid().optional(),
  highestBid: z.number().optional(),
  title: z
    .string()
    .min(5, { message: "Title must contain at least 5 characters" }),
  description: z
    .string()
    .min(8, { message: "Description must contain at least 8 characters" }),
  storageId: z.uuid().optional(),
  images: z.array(z.string()).optional(),
  category: AuctionCategorySchema,
  startingPrice: z
    .number()
    .min(1, { message: "Starting price must be greater than 1" }),
  status: AuctionStatusSchema,
  startedAt: z.date().optional(),
  endAt: z.date().optional(),
  paidAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Auction = z.infer<typeof AuctionSchema>;

// users_public only returns an email to its owner, and a seller's to the winner of their closed auction
const PublicUserSchema = UserSchema.omit({
  role: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  email: z.email().nullable(),
});

// AuctionDetailsSchema for auction details page
export const AuctionDetailsSchema = AuctionSchema.extend({
  owner: PublicUserSchema.nullable(),
}).extend({
  highestBidder: PublicUserSchema.nullable(),
});

export type AuctionDetails = z.infer<typeof AuctionDetailsSchema>;

export type AuctionsListingParams = {
  filterBy?: Partial<
    Pick<Auction, "title" | "status" | "category" | "ownerId">
  > & { ids?: string[] };
  orderBy?: {
    key: AuctionsSortKey;
    order: AuctionsSortOrder;
  };
  pagination?: {
    page: number;
    size: number;
  };
};

export type ListingReturn<T> = { list: T[]; total: number };

export type AuctionsCountParams = Omit<
  AuctionsListingParams,
  "pagination" | "orderBy"
>;

// create & update params - FE
const BaseAuctionFields = AuctionSchema.pick({
  title: true,
  description: true,
  category: true,
  startingPrice: true,
  storageId: true,
  images: true,
});

const BaseAuctionUpdateFields = AuctionSchema.pick({ id: true }).extend(
  BaseAuctionFields.shape,
);

// create auction - FE params
export const CreateAuctionStatusSchema = z.enum([
  AuctionStatusSchema.enum.DRAFT,
  AuctionStatusSchema.enum.OPEN,
]);
export const CreateAuctionParamsSchema = BaseAuctionFields.extend({
  endAt: AuctionSchema.shape.endAt.optional(),
  status: CreateAuctionStatusSchema,
});
export type CreateAuctionParams = z.infer<typeof CreateAuctionParamsSchema>;

// update auction - FE params
export const UpdateAuctionStatusSchema = AuctionStatusSchema;
export const UpdateAuctionParamsSchema = BaseAuctionUpdateFields.extend({
  endAt: AuctionSchema.shape.endAt.optional(),
  paidAt: AuctionSchema.shape.paidAt.optional(),
  status: UpdateAuctionStatusSchema,
});
export type UpdateAuctionParams = z.infer<typeof UpdateAuctionParamsSchema>;

// update auction paidAt - stripe webhook params
export const UpdateAuctionPaidAtParamsSchema = AuctionSchema.pick({
  id: true,
  paidAt: true,
});
export type UpdateAuctionPaidAtParams = z.infer<
  typeof UpdateAuctionPaidAtParamsSchema
>;

// Sorting
export const SORTABLE_KEYS = [
  "category",
  "status",
  "startingPrice",
  "createdAt",
] as const;
export const AuctionsSortKeySchema = z.enum(SORTABLE_KEYS);
export type AuctionsSortKey = z.infer<typeof AuctionsSortKeySchema>;
export const AuctionsSortOrderSchema = z.enum(["asc", "desc"]);
export type AuctionsSortOrder = z.infer<typeof AuctionsSortOrderSchema>;

export const ORDER_COLUMN_MAP: Record<string, string> = {
  createdAt: "created_at",
  startingPrice: "starting_price",
};
