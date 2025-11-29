import { Trans } from "@lingui/react/macro";
import { CoinsIcon, TrophyIcon } from "lucide-react";
import type { FC } from "react";
import Stripe from "stripe";
import { FormatCurrency } from "@/app/_components/format-currency";
import { TypographyH4 } from "@/app/_components/typography/h4";
import { TypographyH5 } from "@/app/_components/typography/h5";
import type { AuctionDetails } from "@/core/domains/auction";
import { HeaderCard } from "../../_components/header-card";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";

type Props = {
  auction: AuctionDetails;
  stripeSessionId: string;
};

export const SuccessHeaderCard: FC<Props> = async (props) => {
  const { auction, stripeSessionId } = props;

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
  const isPaid =
    session.payment_status === "paid" || session.status === "complete";

  const header = isPaid ? (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <TrophyIcon className="size-4 text-amber-500" />
        <TypographyH4 className="whitespace-nowrap">
          <Trans>You successfully paid this auction.</Trans>
        </TypographyH4>
      </div>
      <div className="flex items-center gap-2">
        <CoinsIcon className="size-4 text-amber-500" />
        <TypographyH4 className="whitespace-nowrap">
          <Trans>Amount paid</Trans>:
        </TypographyH4>
        <TypographyH5>
          <FormatCurrency value={auction.highestBid ?? null} />
        </TypographyH5>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <TypographyH5>
        <Trans>
          You did not pay this auction yet. Contact us for more information.
        </Trans>
      </TypographyH5>
    </div>
  );

  return <HeaderCard auction={auction} header={header} />;
};
