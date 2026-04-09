import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// 학습 경로 데이터
const learningPath = [
  {
    step: 1,
    title: "ERC20 원리 학습",
    description: "토큰 표준이 무엇인지, 핵심 함수 6개의 역할을 배웁니다.",
    href: "/tutorial",
    badge: "이론",
    icon: "📖",
  },
  {
    step: 2,
    title: "Remix에서 배포",
    description: "Remix IDE로 직접 토큰을 만들고 Sepolia에 배포합니다.",
    href: "/deploy-guide",
    badge: "실습",
    icon: "🚀",
  },
  {
    step: 3,
    title: "토큰 상호작용",
    description: "전송, 승인, 위임 전송 등 ERC20 함수를 직접 실행합니다.",
    href: "/token-interact",
    badge: "실습",
    icon: "🔄",
  },
  {
    step: 4,
    title: "거래 내역 분석",
    description: "토큰 전송 이벤트를 수집하고 그래프로 시각화합니다.",
    href: "/dashboard",
    badge: "심화",
    icon: "📊",
  },
];

// 사전 준비 체크리스트
const prerequisites = [
  "메타마스크 브라우저 확장 설치",
  "Sepolia 테스트넷 추가 (메타마스크에서 네트워크 선택)",
  "Sepolia ETH 확보 (Google 'Sepolia Faucet' 검색)",
  "Remix IDE 접속 확인 (remix.ethereum.org)",
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* 히어로 섹션 */}
      <section className="mb-12 text-center">
        <Badge className="mb-4" variant="secondary">Week 7 실습</Badge>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          ERC20 토큰 만들기
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          나만의 토큰을 만들고, 메타마스크에 등록하고, 전송해보세요.
          <br />
          블록체인 위에서 돈이 어떻게 움직이는지 직접 체험합니다.
        </p>
      </section>

      {/* 학습 경로 */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold">학습 경로</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {learningPath.map((item) => (
            <Link key={item.step} href={item.href}>
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{item.icon}</span>
                    <Badge variant="outline">{item.badge}</Badge>
                  </div>
                  <CardTitle className="text-lg">
                    Step {item.step}. {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 추가 도구 */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold">추가 도구</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/faucet">
            <Card className="transition-colors hover:border-primary/50 hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">🚰 토큰 퍼셋</CardTitle>
                <CardDescription>
                  테스트용 토큰을 무료로 받을 수 있는 수도꼭지
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/quiz">
            <Card className="transition-colors hover:border-primary/50 hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">🧠 개념 퀴즈</CardTitle>
                <CardDescription>
                  ERC20 핵심 개념을 얼마나 이해했는지 확인하세요
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      {/* 사전 준비 체크리스트 */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold">사전 준비</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4 text-sm text-muted-foreground">
              실습을 시작하기 전에 아래 항목을 확인하세요.
            </p>
            <ul className="space-y-3">
              {prerequisites.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs">
                    {i + 1}
                  </span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link href="/tutorial">
                <Button size="lg" className="w-full sm:w-auto">
                  학습 시작하기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
