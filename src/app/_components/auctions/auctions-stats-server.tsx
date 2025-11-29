import { msg } from "@lingui/core/macro";
import { Plural, useLingui } from "@lingui/react/macro";
import { CoinsIcon, GavelIcon, UsersIcon } from "lucide-react";
import type { FC } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { User } from "@/core/domains/user";
import { auctions } from "@/core/instances/auctions";
import { bids } from "@/core/instances/bids";
import { users } from "@/core/instances/users";
import { cn } from "@/lib/utils";
import { TypographyH5 } from "../typography/h5";

type Props = {
  isCurrentUserStats?: boolean;
  className?: string;
};

export const AuctionsStatsServer: FC<Props> = async (props) => {
  const { isCurrentUserStats = true, className } = props;

  const { i18n } = useLingui();

  let me: User | null = null;
  let totalUsers: number = 0;

  if (isCurrentUserStats) {
    me = await users().me();
  } else {
    totalUsers = await users().count();
  }

  const [totalAuctions, totalBids] = await Promise.all([
    auctions().count({
      filterBy: {
        ownerId: me?.id ?? undefined,
      },
    }),
    bids().count({
      filterBy: {
        bidderId: me?.id ?? undefined,
      },
    }),
  ]);

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-4",
        {
          "lg:grid-cols-3": !isCurrentUserStats,
        },
        className,
      )}
    >
      <Card>
        <CardContent className="flex-1 flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl sm:text-3xl">
              {totalAuctions}
            </CardTitle>
            <TypographyH5>
              <Plural
                _0={i18n._(msg`No auction yet`)}
                one={i18n._(
                  isCurrentUserStats ? msg`auction` : msg`total auction`,
                )}
                other={i18n._(
                  isCurrentUserStats ? msg`auctions` : msg`total auctions`,
                )}
                value={totalAuctions}
              />
            </TypographyH5>
          </div>
          <GavelIcon size={32} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex-1 flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl sm:text-3xl">{totalBids}</CardTitle>
            <TypographyH5>
              <Plural
                _0={i18n._(msg`No bid yet`)}
                one={i18n._(isCurrentUserStats ? msg`bid` : msg`total bid`)}
                other={i18n._(isCurrentUserStats ? msg`bids` : msg`total bids`)}
                value={totalBids}
              />
            </TypographyH5>
          </div>
          <CoinsIcon size={32} />
        </CardContent>
      </Card>

      {!isCurrentUserStats && (
        <Card>
          <CardContent className="flex-1 flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl sm:text-3xl">
                {totalUsers}
              </CardTitle>
              <TypographyH5>
                <Plural
                  _0="No user yet"
                  one="total user"
                  other="total users"
                  value={totalUsers}
                />
              </TypographyH5>
            </div>
            <UsersIcon size={32} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
