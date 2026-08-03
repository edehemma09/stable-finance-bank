import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CustomerShell } from "@/components/customer-shell";

export const Route = createFileRoute("/_authenticated/app")({
  component: () => <CustomerShell />,
});

export { Outlet };
