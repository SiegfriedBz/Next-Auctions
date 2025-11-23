"use client";

import { Trans, useLingui } from "@lingui/react/macro";
import { BellIcon, BellRingIcon } from "lucide-react";
import { type FC, memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type Notification,
  NotificationTypeSchema,
  type NotificationTypeSchemaT,
} from "@/core/domains/notifications";
import { cn } from "@/lib/utils";
import { NotificationItem } from "../../real-time/notification-item";

type Props = {
  notifications: Notification[];
  onMarkNotificationAsSeen: (notificationId: string) => void;
};

export const NotificationMenuContent: FC<Props> = (props) => {
  const { notifications = [], onMarkNotificationAsSeen } = props;
  const count = notifications.length;

  const { t } = useLingui();

  const notificationsByType = useMemo(() => {
    return notifications.reduce<
      Record<NotificationTypeSchemaT, Notification[]>
    >(
      (acc, n) => {
        acc[n.type] = acc[n.type] || [];
        acc[n.type].push(n);
        return acc;
      },
      {} as Record<NotificationTypeSchemaT, Notification[]>,
    );
  }, [notifications]);

  const tabsList = useMemo(() => {
    return [
      {
        value: "payments",
        label: t`Payments`,
        defaultLabel: t`No new payment`,
        notifications:
          notificationsByType[NotificationTypeSchema.enum.NEW_PAYMENT] || [],
      },
      {
        value: "bids",
        label: t`Bids`,
        defaultLabel: t`No new bid`,
        notifications:
          notificationsByType[NotificationTypeSchema.enum.NEW_BID] || [],
      },
      {
        value: "won-auctions",
        label: t`Won auctions`,
        defaultLabel: t`No new won auction`,
        notifications:
          notificationsByType[NotificationTypeSchema.enum.NEW_AUCTION_WON] ||
          [],
      },
    ];
  }, [notificationsByType, t]);

  return (
    <Tabs
      defaultValue="payments"
      className="w-full max-[425px]:min-w-[84vw] max-sm:min-w-[76vw] max-md:min-w-[54vw] min-w-[32vw] h-full min-h-[32vh] p-1"
    >
      <div className="flex justify-center items-center gap-x-2 mt-2">
        {count > 0 ? (
          <BellRingIcon className="size-4 opacity-90" />
        ) : (
          <BellIcon className="size-4 opacity-80" />
        )}
        <Trans>Notifications</Trans>
      </div>

      <div className="max-xl:min-h-[9vh] min-w-full">
        <TabsList className="w-full flex gap-1 flex-wrap">
          {tabsList.map((tab) => {
            const count = tab.notifications.length;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="cursor-pointer opacity-80"
              >
                {tab.label}
                <Badge
                  className={cn(
                    "size-4 text-xs",
                    count > 0 ? "opacity-100" : "opacity-50",
                  )}
                >
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      <Separator className="my-2" />

      <div>
        {tabsList.map((tab) => {
          return (
            <TabsContent key={`content-${tab.value}`} value={tab.value}>
              <MemoTabContentInner
                notifications={tab.notifications}
                label={tab.defaultLabel}
                onMarkNotificationAsSeen={onMarkNotificationAsSeen}
              />
            </TabsContent>
          );
        })}
      </div>
    </Tabs>
  );
};

type TabContentInnerProps = {
  notifications: Notification[];
  label: string;
  onMarkNotificationAsSeen: (notificationId: string) => void;
};

const TabContentInner: FC<TabContentInnerProps> = (props) => {
  const { notifications = [], onMarkNotificationAsSeen, label } = props;
  const count = notifications.length;

  return (
    <ul className="grid gap-2 w-full px-0.5 pb-2">
      {count === 0 ? (
        <li className="text-sm h-12 whitespace-nowrap flex justify-center items-center text-shadow-muted-foreground">
          {label}
        </li>
      ) : (
        notifications.map((notification) => {
          return (
            <li
              key={notification.id}
              className="text-sm h-12 whitespace-nowrap flex justify-center items-center "
            >
              <NavigationMenuLink asChild>
                <NotificationItem
                  notification={notification}
                  onMarkNotificationAsSeen={onMarkNotificationAsSeen}
                />
              </NavigationMenuLink>
            </li>
          );
        })
      )}
    </ul>
  );
};

const MemoTabContentInner = memo(TabContentInner);
