"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { QUIZ_QUESTIONS } from "@/constants/quiz-data";
import { QuizQuestion } from "@/types";

// 카테고리 한국어 레이블
const CATEGORY_LABEL: Record<QuizQuestion["category"], string> = {
  concept: "개념",
  code: "코드",
  practice: "실습",
};

// 카테고리 Badge variant
const CATEGORY_VARIANT: Record<
  QuizQuestion["category"],
  "default" | "secondary" | "outline"
> = {
  concept: "default",
  code: "secondary",
  practice: "outline",
};

// 점수에 따른 등급 결정
function getGrade(score: number): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (score >= 10) return { label: "ERC20 마스터", variant: "default" };
  if (score >= 7) return { label: "잘 하고 있어요", variant: "secondary" };
  if (score >= 4) return { label: "복습이 필요해요", variant: "outline" };
  return { label: "튜토리얼을 다시 보세요", variant: "destructive" };
}

// 카테고리별 성적 계산
function calcCategoryStats(
  answers: (number | null)[],
  questions: QuizQuestion[]
): Record<QuizQuestion["category"], { correct: number; total: number }> {
  const stats: Record<QuizQuestion["category"], { correct: number; total: number }> = {
    concept: { correct: 0, total: 0 },
    code: { correct: 0, total: 0 },
    practice: { correct: 0, total: 0 },
  };

  questions.forEach((q, idx) => {
    stats[q.category].total += 1;
    if (answers[idx] === q.correctAnswer) {
      stats[q.category].correct += 1;
    }
  });

  return stats;
}

export default function QuizPage() {
  // 현재 문제 인덱스
  const [currentIndex, setCurrentIndex] = useState(0);
  // 각 문제에 대한 선택 답안 (null = 아직 선택 안 함)
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(QUIZ_QUESTIONS.length).fill(null)
  );
  // 퀴즈 완료 여부
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];
  const selectedAnswer = answers[currentIndex];
  const isAnswered = selectedAnswer !== null;
  const isLastQuestion = currentIndex === QUIZ_QUESTIONS.length - 1;

  // 총 맞힌 개수
  const totalScore = answers.filter(
    (ans, idx) => ans === QUIZ_QUESTIONS[idx].correctAnswer
  ).length;

  // 선택지 클릭 처리
  function handleSelectOption(optionIndex: number) {
    if (isAnswered) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
  }

  // 다음 문제로 이동
  function handleNext() {
    if (isLastQuestion) {
      setIsFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  // 다시 풀기
  function handleReset() {
    setCurrentIndex(0);
    setAnswers(Array(QUIZ_QUESTIONS.length).fill(null));
    setIsFinished(false);
  }

  // 선택지 버튼 스타일 결정
  function getOptionStyle(optionIndex: number): string {
    const base =
      "w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ";

    if (!isAnswered) {
      // 아직 답 선택 전: 호버 효과
      return base + "hover:border-primary/60 hover:bg-muted/50 cursor-pointer";
    }

    // 정답인 선택지: 초록색
    if (optionIndex === currentQuestion.correctAnswer) {
      return base + "border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200 cursor-default";
    }

    // 내가 선택한 오답: 빨간색
    if (optionIndex === selectedAnswer) {
      return base + "border-red-500 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 cursor-default";
    }

    // 나머지 선택지: 흐리게
    return base + "opacity-50 cursor-default";
  }

  // ===== 결과 화면 =====
  if (isFinished) {
    const grade = getGrade(totalScore);
    const categoryStats = calcCategoryStats(answers, QUIZ_QUESTIONS);

    // 틀린 문제 목록
    const wrongQuestions = QUIZ_QUESTIONS.filter(
      (q, idx) => answers[idx] !== q.correctAnswer
    );

    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold text-center">퀴즈 결과</h1>
        <p className="mb-8 text-center text-muted-foreground">
          ERC20 개념 퀴즈를 완료했습니다
        </p>

        {/* 총점 카드 */}
        <Card className="mb-6 text-center">
          <CardHeader>
            <CardTitle className="text-5xl font-bold">
              {totalScore}
              <span className="text-2xl text-muted-foreground">
                /{QUIZ_QUESTIONS.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={grade.variant} className="text-base px-4 py-1">
              {grade.label}
            </Badge>
          </CardContent>
        </Card>

        {/* 카테고리별 성적 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">카테고리별 성적</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["concept", "code", "practice"] as QuizQuestion["category"][]).map(
              (cat) => {
                const stat = categoryStats[cat];
                const percent = Math.round((stat.correct / stat.total) * 100);
                return (
                  <div key={cat}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{CATEGORY_LABEL[cat]}</span>
                      <span className="text-muted-foreground">
                        {stat.correct}/{stat.total} ({percent}%)
                      </span>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>
                );
              }
            )}
          </CardContent>
        </Card>

        {/* 틀린 문제 목록 */}
        {wrongQuestions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                틀린 문제 ({wrongQuestions.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {wrongQuestions.map((q, i) => (
                <div key={q.id}>
                  {i > 0 && <Separator className="mb-4" />}
                  <div className="flex items-start gap-2 mb-2">
                    <Badge variant={CATEGORY_VARIANT[q.category]} className="shrink-0 mt-0.5">
                      {CATEGORY_LABEL[q.category]}
                    </Badge>
                    <p className="text-sm font-medium">{q.question}</p>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-400 pl-1">
                    정답: {q.options[q.correctAnswer]}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* 버튼 */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={handleReset} className="flex-1">
            다시 풀기
          </Button>
          <Link href="/tutorial" className="flex-1">
            <Button variant="outline" className="w-full">
              튜토리얼로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ===== 문제 풀이 화면 =====
  const progressPercent = Math.round(
    (currentIndex / QUIZ_QUESTIONS.length) * 100
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">ERC20 개념 퀴즈</h1>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1}/{QUIZ_QUESTIONS.length}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* 문제 카드 */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={CATEGORY_VARIANT[currentQuestion.category]}>
              {CATEGORY_LABEL[currentQuestion.category]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              문제 {currentIndex + 1}
            </span>
          </div>
          <CardTitle className="text-base font-semibold leading-relaxed whitespace-pre-line">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 선택지 버튼 */}
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              className={getOptionStyle(idx)}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswered}
            >
              <span className="font-medium mr-2 text-muted-foreground">
                {["①", "②", "③", "④"][idx]}
              </span>
              {option}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* 피드백 Alert */}
      {isAnswered && (
        <Alert
          className={`mb-4 ${
            selectedAnswer === currentQuestion.correctAnswer
              ? "border-green-500 bg-green-50 dark:bg-green-950"
              : "border-red-500 bg-red-50 dark:bg-red-950"
          }`}
        >
          <AlertTitle
            className={
              selectedAnswer === currentQuestion.correctAnswer
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            }
          >
            {selectedAnswer === currentQuestion.correctAnswer
              ? "정답입니다!"
              : `오답입니다. 정답: ${currentQuestion.options[currentQuestion.correctAnswer]}`}
          </AlertTitle>
          <AlertDescription className="mt-2 text-sm leading-relaxed text-foreground/80">
            {currentQuestion.explanation}
          </AlertDescription>
        </Alert>
      )}

      {/* 다음 문제 버튼 */}
      {isAnswered && (
        <Button onClick={handleNext} className="w-full">
          {isLastQuestion ? "결과 보기" : "다음 문제"}
        </Button>
      )}
    </div>
  );
}
