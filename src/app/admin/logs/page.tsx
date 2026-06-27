import {
  inventoryLogService,
  deviceDropdownService,
} from "@/lib/api/inventoryApi";
import { LogsClient } from "@/components/admin/logs/LogsClient";

interface Props {
  searchParams: Promise<{
    page?: string;
    deviceId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function AdminLogsPage({ searchParams }: Props) {
  const params = await searchParams;

  const [logsRes, devicesRes] = await Promise.all([
    inventoryLogService.getAll({
      page: params.page ? Number(params.page) : 1,
      deviceId: params.deviceId,
      action: params.action,
      startDate: params.startDate,
      endDate: params.endDate,
    }),
    deviceDropdownService.getAll(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-overline">Inventory</p>
        <h1 className="text-heading-xl mt-2">Audit Logs</h1>
        <p className="text-body mt-2 max-w-2xl">
          Browse system event logs and manually record verification or
          maintenance entries.
        </p>
      </div>

      <LogsClient
        initialLogs={logsRes.data}
        initialMeta={logsRes.meta}
        devices={devicesRes.data ?? []}
      />
    </div>
  );
}
