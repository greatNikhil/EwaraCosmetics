"use client";

import { Suspense } from "react";
import { AdminOrdersView } from "./AdminOrdersView";

function AdminOrdersContent() {
  return <AdminOrdersView />;
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
