import type { ReactNode } from "react";
// import { AdminNav } from "@/components/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {/* TOP NAVBAR REMOVED — navigation handled by sidebar only */}
      {children}
    </>
  );
}
