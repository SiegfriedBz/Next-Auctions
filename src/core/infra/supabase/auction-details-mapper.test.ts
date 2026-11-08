import {
  AuctionCategorySchema,
  type AuctionDetails,
  AuctionStatusSchema,
} from "@/core/domains/auction";
import { auctionDetailsMapper } from "./auction-details-mapper";

const VALID_UUID = "00000000-0000-0000-0000-000000000000";

describe("auctionDetailsMapper", () => {
  it("returns null when input is null", () => {
    expect(auctionDetailsMapper(null)).toBeNull();
  });

  it("maps SupabaseAuctionDetails fields to AuctionDetails correctly", () => {
    const supabaseAuctionDetails = {
      id: VALID_UUID,
      owner_id: VALID_UUID,
      title: "Vintage Guitar",
      description: "Classic 70s guitar",
      category: AuctionCategorySchema.enum.MUSIC,
      status: AuctionStatusSchema.enum.OPEN,
      starting_price: 100,
      highest_bidder_id: VALID_UUID,
      highest_bid: 150,
      storage_id: VALID_UUID,
      images: ["https://github.com/shadcn.png"],
      started_at: "2025-08-12T12:00:00.000Z",
      end_at: "2025-08-20T12:00:00.000Z",
      created_at: "2025-08-01T12:00:00.000Z",
      updated_at: "2025-08-05T12:00:00.000Z",
      paid_at: "2025-08-20T12:00:00.000Z",
      owner: {
        id: VALID_UUID,
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        avatar_url: "https://example.com/avatar.png",
      },
      highest_bidder: {
        id: VALID_UUID,
        first_name: "Jane",
        last_name: "DoeDoe",
        email: "jane.doedoe@example.com",
        avatar_url: null,
      },
    };

    const expected: AuctionDetails = {
      id: VALID_UUID,
      ownerId: VALID_UUID,
      title: "Vintage Guitar",
      description: "Classic 70s guitar",
      category: AuctionCategorySchema.enum.MUSIC,
      status: AuctionStatusSchema.enum.OPEN,
      startingPrice: 100,
      highestBidderId: VALID_UUID,
      highestBid: 150,
      storageId: VALID_UUID,
      images: ["https://github.com/shadcn.png"],
      startedAt: new Date("2025-08-12T12:00:00.000Z"),
      endAt: new Date("2025-08-20T12:00:00.000Z"),
      createdAt: new Date("2025-08-01T12:00:00.000Z"),
      updatedAt: new Date("2025-08-05T12:00:00.000Z"),
      paidAt: new Date("2025-08-20T12:00:00.000Z"),
      owner: {
        id: VALID_UUID,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        avatarUrl: "https://example.com/avatar.png",
      },
      highestBidder: {
        id: VALID_UUID,
        firstName: "Jane",
        lastName: "DoeDoe",
        email: "jane.doedoe@example.com",
        avatarUrl: undefined,
      },
    };

    expect(auctionDetailsMapper(supabaseAuctionDetails)).toEqual(expected);
  });

  it("handles optional fields correctly", () => {
    const supabaseAuctionDetails = {
      id: VALID_UUID,
      owner_id: VALID_UUID,
      title: "Vintage Guitar",
      description: "Classic 70s guitar",
      category: AuctionCategorySchema.enum.MUSIC,
      status: AuctionStatusSchema.enum.DRAFT,
      starting_price: 100,
      storage_id: null,
      highest_bidder_id: null,
      highest_bid: null,
      images: [],
      created_at: "2025-08-01T12:00:00.000Z",
      updated_at: "2025-08-05T12:00:00.000Z",
      started_at: "2025-08-01T12:00:00.000Z",
      end_at: null,
      paid_at: null,
      owner: {
        id: VALID_UUID,
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        avatar_url: "https://example.com/avatar.png",
      },
      highest_bidder: null,
    };

    const expected: AuctionDetails = {
      id: VALID_UUID,
      ownerId: VALID_UUID,
      title: "Vintage Guitar",
      description: "Classic 70s guitar",
      category: AuctionCategorySchema.enum.MUSIC,
      status: AuctionStatusSchema.enum.DRAFT,
      startingPrice: 100,
      storageId: undefined,
      highestBidderId: undefined,
      highestBid: undefined,
      images: [],
      createdAt: new Date("2025-08-01T12:00:00.000Z"),
      updatedAt: new Date("2025-08-05T12:00:00.000Z"),
      startedAt: new Date("2025-08-01T12:00:00.000Z"),
      endAt: undefined,
      paidAt: undefined,
      owner: {
        id: VALID_UUID,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        avatarUrl: "https://example.com/avatar.png",
      },
      highestBidder: null,
    };

    expect(auctionDetailsMapper(supabaseAuctionDetails)).toEqual(expected);
  });

  it("keeps an email hidden by users_public as null", () => {
    const supabaseAuctionDetails = {
      id: VALID_UUID,
      owner_id: VALID_UUID,
      title: "Vintage Guitar",
      description: "Classic 70s guitar",
      category: AuctionCategorySchema.enum.MUSIC,
      status: AuctionStatusSchema.enum.DRAFT,
      starting_price: 100,
      storage_id: null,
      highest_bidder_id: null,
      highest_bid: null,
      images: [],
      created_at: "2025-08-01T12:00:00.000Z",
      updated_at: "2025-08-05T12:00:00.000Z",
      started_at: "2025-08-01T12:00:00.000Z",
      end_at: null,
      paid_at: null,
      owner: {
        id: VALID_UUID,
        first_name: "John",
        last_name: "Doe",
        email: null,
        avatar_url: null,
      },
      highest_bidder: null,
    };

    expect(auctionDetailsMapper(supabaseAuctionDetails)?.owner).toEqual({
      id: VALID_UUID,
      firstName: "John",
      lastName: "Doe",
      email: null,
      avatarUrl: undefined,
    });
  });
});
