'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SplinePointer } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      router.replace("/");
    }
  }, [mounted, router]);

  if (!mounted) return null;

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <SplinePointer className="animate-spin" />
    </div>
  );
}
