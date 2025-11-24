import { getForbiddenNextStatuses } from "@/lib/get-forbidden-next-statuses";
import type {
  Auction,
  AuctionDetails,
  AuctionsCountParams,
  AuctionsListingParams,
  CreateAuctionParams,
  ListingReturn,
  UpdateAuctionPaidAtParams,
  UpdateAuctionParams,
} from "../domains/auction";
import type { AuctionRepository } from "../ports/auction-repository";
import type { UserRepository } from "../ports/user-repository";

export class AuctionService {
  constructor(
    readonly userRepo: UserRepository,
    readonly auctionRepo: AuctionRepository,
  ) {}

  async listing(
    params: AuctionsListingParams = {},
  ): Promise<ListingReturn<Auction>> {
    const {
      filterBy = {},
      orderBy = { key: "createdAt", order: "desc" },
      pagination = { page: 0, size: 10 },
    } = params;

    const [list, total] = await Promise.all([
      this.auctionRepo.list({ filterBy, orderBy, pagination }),
      this.auctionRepo.count({ filterBy }),
    ]);

    return { list, total };
  }

  async detailsById(id: string): Promise<AuctionDetails | null> {
    return await this.auctionRepo.findById(id);
  }

  async create(params: CreateAuctionParams): Promise<Auction> {
    const me = await this.userRepo.me();

    // RLS auth_users_can_create_auction
    if (!me) {
      throw new Error("Only authenticated user allowed");
    }

    return await this.auctionRepo.create({ ...params, ownerId: me.id });
  }

  async update(params: UpdateAuctionParams): Promise<Auction> {
    const [me, auction] = await Promise.all([
      this.userRepo.me(),
      this.auctionRepo.findById(params.id),
    ]);

    // RLS auth_users_can_create_auction
    if (!me) {
      throw new Error("Only authenticated user allowed");
    }

    // RLS auth_auction_owner_can_update_draft_auctions
    if (me.id !== auction?.ownerId) {
      throw new Error("Only auction owner allowed");
    }

    // only allow to set the correct status
    const excludedNextStatus = getForbiddenNextStatuses({
      status: auction.status,
      highestBid: auction.highestBid,
    });

    if (excludedNextStatus.includes(params.status)) {
      throw new Error("Can not set this status");
    }

    return await this.auctionRepo.update(params);
  }

  async count(params: AuctionsCountParams = {}): Promise<number> {
    return await this.auctionRepo.count(params);
  }

  /** Called from stripe webhook to mark auction as paid */
  async updatePaidAt(params: UpdateAuctionPaidAtParams) {
    if (!params?.paidAt) {
      throw new Error("paidAt must be a date");
    }

    return await this.auctionRepo.updatePaidAt(params);
  }
}
