// app/page.jsx
import dynamic from "next/dynamic";

const ClientApp = dynamic(() => import("./ClientApp"), { ssr: false });

export default function Page() {
  return <ClientApp />;
}
