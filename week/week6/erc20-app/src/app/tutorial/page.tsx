"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepCard from "@/components/tutorial/StepCard";
import ProgressTracker from "@/components/tutorial/ProgressTracker";
import { TUTORIAL_STEPS } from "@/constants/tutorial-steps";

// localStorage 키
const STORAGE_KEY = "erc20-tutorial-completed";

// localStorage에서 완료된 단계 목록을 읽어오는 헬퍼
function loadCompletedSteps(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === "number")
    ) {
      return parsed as number[];
    }
    return [];
  } catch {
    return [];
  }
}

// 튜토리얼 메인 페이지
export default function TutorialPage() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // 마운트 시 저장된 진행률 복원
  useEffect(() => {
    setCompletedSteps(loadCompletedSteps());
  }, []);

  // 단계 완료 처리 — localStorage에 저장
  const handleComplete = (stepId: number) => {
    setCompletedSteps((prev) => {
      if (prev.includes(stepId)) return prev;
      const next = [...prev, stepId];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage 사용 불가 환경 무시
      }
      return next;
    });
  };

  const stepTitles = TUTORIAL_STEPS.map((s) => s.title);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* 페이지 제목 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">ERC20 원리 학습</h1>
        <p className="mt-2 text-muted-foreground">
          5단계로 이해하는 ERC20 토큰 표준. 각 단계를 펼쳐서 읽고 완료 버튼을
          누르세요.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* 좌측 사이드바 — 진행률 트래커 */}
        <aside className="w-full lg:w-64 lg:shrink-0">
          <div className="lg:sticky lg:top-4">
            <ProgressTracker
              totalSteps={TUTORIAL_STEPS.length}
              completedSteps={completedSteps}
              stepTitles={stepTitles}
            />
          </div>
        </aside>

        {/* 우측 메인 콘텐츠 — 단계 카드 목록 */}
        <main className="flex-1 space-y-4">
          {TUTORIAL_STEPS.map((step) => (
            <StepCard
              key={step.id}
              step={step}
              isCompleted={completedSteps.includes(step.id)}
              onComplete={handleComplete}
            />
          ))}

          {/* 하단 네비게이션 — 다음 페이지 링크 */}
          <div className="mt-8 flex items-center justify-between rounded-xl border border-border bg-muted/40 px-5 py-4">
            <div>
              <p className="text-sm font-medium">다음 단계</p>
              <p className="text-xs text-muted-foreground">
                Remix IDE로 직접 토큰을 배포해보세요
              </p>
            </div>
            <Link href="/deploy-guide">
              <Button size="sm">
                배포 가이드
                <ArrowRight className="ml-1 size-3.5" />
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
