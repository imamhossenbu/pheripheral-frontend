import type { DeviceStatus } from "@/lib/api/device.api";

interface Props {
    status: DeviceStatus;
}

const config: Record<DeviceStatus, { label: string; className: string; dot: string }> = {
    AVAILABLE: {
        label: "Available",
        className: "badge badge-success",
        dot: "status-dot status-dot-success",
    },
    IN_MAINTENANCE: {
        label: "Maintenance",
        className: "badge badge-warning",
        dot: "status-dot status-dot-warning",
    },
    DEPLOYED: {
        label: "Deployed",
        className: "badge badge-info",
        dot: "status-dot",
    },
    RETIRED: {
        label: "Retired",
        className: "badge badge-muted",
        dot: "status-dot status-dot-muted",
    },
};

export default function DeviceStatusBadge({ status }: Props) {
    const { label, className, dot } = config[status] ?? config.RETIRED;
    return (
        <span className={className}>
            <span className={dot} />
            {label}
        </span>
    );
}