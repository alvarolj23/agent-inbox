import { cn } from "@/lib/utils";
import { Thread } from "@langchain/langgraph-sdk";
import React from "react";
import { ThreadIdCopyable } from "./thread-id";
import { ThreadStatusBadge } from "./statuses";
import { useQueryParams } from "../hooks/use-query-params";
import { VIEW_STATE_THREAD_QUERY_PARAM } from "../constants";

interface GenericInboxItemProps<
  ThreadValues extends Record<string, any> = Record<string, any>,
> {
  threadData: {
    thread: Thread<ThreadValues>;
    status: "idle" | "busy" | "error";
    interrupts?: never;
  };
}

export function GenericInboxItem<
  ThreadValues extends Record<string, any> = Record<string, any>,
>({ threadData }: GenericInboxItemProps<ThreadValues>) {
  const { searchParams, updateQueryParams, getSearchParam } = useQueryParams();
  const [active, setActive] = React.useState(false);
  const threadIdQueryParam = searchParams.get(VIEW_STATE_THREAD_QUERY_PARAM);
  const isStateViewOpen = !!threadIdQueryParam;
  const isCurrentThreadStateView =
    threadIdQueryParam === threadData.thread.thread_id;

  React.useEffect(() => {
    if (threadIdQueryParam === threadData.thread.thread_id && !active) {
      setActive(true);
    } else if (threadIdQueryParam !== threadData.thread.thread_id && active) {
      setActive(false);
    }
  }, [searchParams, threadData]);

  const handleToggleViewState = () => {
    updateQueryParams(
      VIEW_STATE_THREAD_QUERY_PARAM,
      threadData.thread.thread_id
    );
  };

  const actionColorMap = {
    idle: {
      bg: "#E5E7EB",
      border: "#D1D5DB",
    },
    busy: {
      bg: "#FDE68A",
      border: "#FCD34D",
    },
    error: {
      bg: "#FECACA",
      border: "#F87171",
    },
  };
  const actionColor = actionColorMap[threadData.status];
  const actionLetter = threadData.status[0].toUpperCase();

  return (
    <div
      onClick={() => {
        if (!active) {
          setActive(true);
          handleToggleViewState();
        }
      }}
      className={cn(
        "flex flex-col gap-6 items-start justify-start",
        "rounded-xl border-[1px] ",
        "p-6 min-h-[50px]",
        active ? "border-gray-200 shadow-md" : "border-gray-200/75",
        !active && "cursor-pointer",
        isStateViewOpen ? "max-w-[60%] w-full" : "w-full"
      )}
    >
      <div className="flex items-center justify-between w-full">
        <div className="w-full flex items-center justify-start gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm"
            style={{
              backgroundColor: actionColor.bg,
              borderWidth: "1px",
              borderColor: actionColor.border,
            }}
          >
            {actionLetter}
          </div>
          <p>Thread ID:</p>
          <ThreadIdCopyable threadId={threadData.thread.thread_id} />
        </div>
        {!isCurrentThreadStateView && (
          <ThreadStatusBadge status={threadData.status} />
        )}
      </div>
    </div>
  );
}
