"use client";

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProgressTrackerProps {
  totalSteps: number;
  completedSteps: number[];
  stepTitles: string[];
}

// 튜토리얼 진행률 추적 컴포넌트 — localStorage 저장은 부모(page.tsx)에서 관리
export default function ProgressTracker({
  totalSteps,
  completedSteps,
  stepTitles,
}: ProgressTrackerProps) {
  const completedCount = completedSteps.length;
  const progressValue =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">학습 진행률</span>
        <Badge variant={completedCount === totalSteps ? "default" : "outline"}>
          {completedCount === totalSteps ? "완료!" : `${completedCount}/${totalSteps}`}
        </Badge>
      </div>

      {/* 진행 바 */}
      <Progress value={progressValue}>
        <ProgressLabel className="sr-only">진행률</ProgressLabel>
        <ProgressValue>
          {(_, value) => (value !== null ? `${value}%` : "0%")}
        </ProgressValue>
      </Progress>

      {/* 단계별 상태 목록 */}
      <ul className="space-y-2">
        {stepTitles.map((title, index) => {
          const stepId = index + 1;
          const isDone = completedSteps.includes(stepId);

          return (
            <li key={stepId} className="flex items-center gap-2">
              {/* 완료 여부 아이콘 */}
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  isDone
                    ? "bg-green-500 text-white"
                    : "border border-border text-muted-foreground"
                )}
              >
                {isDone ? "✓" : stepId}
              </span>
              {/* 단계 이름 */}
              <span
                className={cn(
                  "text-xs truncate",
                  isDone ? "text-foreground line-through opacity-60" : "text-muted-foreground"
                )}
              >
                {title}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
