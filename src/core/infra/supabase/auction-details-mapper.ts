import z from "zod";
import { AuctionDetailsSchema } from "@/core/domains/auction";
import { normalizeAuctionData, type SupabaseAuction } from "./auction-mapper";

// users_public returns a null email when the viewer may not see it
type SupabasePublicUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  avatar_url: string | null;
};

type SupabaseAuctionDetails = SupabaseAuction & {
  owner: SupabasePublicUser | null;
} & {
  highest_bidder: SupabasePublicUser | null;
};

export const auctionDetailsMapper = (row: SupabaseAuctionDetails | null) => {
  if (!row) return null;

  const normalized = {
    ...normalizeAuctionData(row),
    owner: row?.owner
      ? {
          id: row?.owner?.id,
          email: row?.owner?.email,
          firstName: row?.owner?.first_name,
          lastName: row?.owner?.last_name,
          avatarUrl: row?.owner?.avatar_url ?? undefined,
        }
      : null,
    highestBidder: row?.highest_bidder
      ? {
          id: row?.highest_bidder?.id,
          email: row?.highest_bidder?.email,
          firstName: row?.highest_bidder?.first_name,
          lastName: row?.highest_bidder?.last_name,
          avatarUrl: row?.highest_bidder?.avatar_url ?? undefined,
        }
      : null,
  };

  const result = AuctionDetailsSchema.safeParse(normalized);
  if (!result.success) {
    console.warn("Invalid auction details data", z.treeifyError(result.error));
    return null;
  }

  return result.data;
};
