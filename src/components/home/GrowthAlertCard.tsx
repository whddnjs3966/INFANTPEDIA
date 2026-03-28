"use client";

import { motion } from "framer-motion";
import { TrendingUp, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useBabyStore } from "@/lib/store/baby-store";
import { getGrowthAlerts, type GrowthAlert } from "@/lib/utils/growth-alerts";

const severityStyles = {
  info: {
    border: "border-blue-200/50",
    bg: "bg-gradient-to-r from-blue-50 to-sky-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    textColor: "text-blue-700",
    chevronColor: "text-blue-400",
  },
  warning: {
    border: "border-amber-200/50",
    bg: "bg-gradient-to-r from-amber-50 to-orange-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    textColor: "text-amber-700",
    chevronColor: "text-amber-400",
  },
};

interface GrowthAlertCardProps {
  months: number;
}

export default function GrowthAlertCard({ months }: GrowthAlertCardProps) {
  const router = useRouter();
  const measurements = useMeasurementStore((s) => s.measurements);
  const gender = useBabyStore((s) => s.profile?.gender ?? "male");
  const alerts = getGrowthAlerts(months, measurements, gender);

  if (alerts.length === 0) return null;

  return (
    <>
      {alerts.map((alert, index) => (
        <GrowthAlertItem
          key={`${alert.type}-${alert.metric}-${index}`}
          alert={alert}
          onPress={() => router.push("/growth")}
        />
      ))}
    </>
  );
}

function GrowthAlertItem({
  alert,
  onPress,
}: {
  alert: GrowthAlert;
  onPress: () => void;
}) {
  const styles = severityStyles[alert.severity];

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
      className={`w-full rounded-[28px] border ${styles.border} ${styles.bg} p-4 text-left shadow-[0_2px_12px_rgb(0,0,0,0.04)]`}
    >
      <div className="flex items-center gap-3">
        <span className={`rounded-xl ${styles.iconBg} p-2`}>
          <TrendingUp size={18} className={styles.iconColor} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-700">
            {alert.emoji} {alert.type === "no_data" ? "성장 기록" : "성장 알림"}
          </p>
          <p className={`mt-0.5 text-[13px] font-medium ${styles.textColor}`}>
            {alert.message}
          </p>
        </div>
        <ChevronRight size={16} className={styles.chevronColor} />
      </div>
    </motion.button>
  );
}
