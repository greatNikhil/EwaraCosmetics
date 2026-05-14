"use client";

type NotificationsProps = {
  notificationItems: Array<{
    id: number;
    title: string;
    subtitle: string;
    unread: boolean;
  }>;
};

export default function Notifications({
  notificationItems,
}: NotificationsProps) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-[#f0dde2]">
      {notificationItems.map((item, index) => (
        <div
          key={item.id}
          className={`flex items-start gap-3 px-4 py-3 ${
            item.unread ? "bg-[#fdf6f7] font-medium" : "bg-white text-[#8a7780]"
          } ${index !== notificationItems.length - 1 ? "border-b border-[#f0dde2]" : ""}`}
        >
          <span
            className={`mt-1 h-2 w-2 rounded-full ${
              item.unread ? "bg-[#7B2D42]" : "bg-transparent"
            }`}
          />
          <div>
            <p className="text-sm text-[#2f1f25]">{item.title}</p>
            <p className="mt-1 text-sm text-[#7f6b73]">{item.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
