"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CodeBlock from "@/components/tutorial/CodeBlock";
import { TutorialStep } from "@/types";

interface StepCardProps {
  step: TutorialStep;
  isCompleted: boolean;
  onComplete: (id: number) => void;
}

// 튜토리얼 단계 카드 — 비유/정석 탭 전환, 접기/펼치기, 완료 체크 포함
export default function StepCard({ step, isCompleted, onComplete }: StepCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={isCompleted ? "ring-1 ring-green-500/40" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          {/* 단계 번호 + 제목 */}
          <div className="flex items-center gap-3">
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                isCompleted
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isCompleted ? "✓" : step.id}
            </span>
            <div>
              <CardTitle className="text-base">
                Step {step.id}. {step.title}
              </CardTitle>
              <CardDescription className="mt-0.5">{step.description}</CardDescription>
            </div>
          </div>

          {/* 완료/펼치기 버튼 영역 */}
          <div className="flex shrink-0 items-center gap-2">
            {isCompleted && (
              <Badge variant="outline" className="text-green-600 border-green-500/40">
                완료
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-label={isExpanded ? "접기" : "펼치기"}
            >
              {isExpanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* 펼쳐진 콘텐츠 영역 */}
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* 본문 요약 */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.content}
          </p>

          {/* 비유 / 정석 탭 */}
          {(step.simpleExplanation || step.technicalExplanation) && (
            <Tabs defaultValue="simple">
              <TabsList>
                <TabsTrigger value="simple">비유로 이해</TabsTrigger>
                <TabsTrigger value="technical">정석 설명</TabsTrigger>
              </TabsList>

              {step.simpleExplanation && (
                <TabsContent value="simple">
                  <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 px-4 py-3">
                    <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
                      {step.simpleExplanation}
                    </p>
                  </div>
                </TabsContent>
              )}

              {step.technicalExplanation && (
                <TabsContent value="technical">
                  <div className="mt-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 px-4 py-3">
                    <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-200">
                      {step.technicalExplanation}
                    </p>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          )}

          {/* 코드 예시 */}
          {step.codeExample && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                코드 예시
              </p>
              <CodeBlock code={step.codeExample} language="solidity" />
            </div>
          )}

          {/* 완료 버튼 */}
          {!isCompleted && (
            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                onClick={() => onComplete(step.id)}
              >
                이 단계 완료
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
