"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

// Solidity 코드 표시 컴포넌트 — 줄 번호, 복사 버튼 포함
export default function CodeBlock({
  code,
  language = "solidity",
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // 클립보드에 코드 복사
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API 미지원 환경 처리
    }
  };

  const lines = code.split("\n");

  return (
    <div className={cn("relative rounded-lg overflow-hidden border border-border", className)}>
      {/* 상단 헤더 바 */}
      <div className="flex items-center justify-between bg-muted/80 px-4 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleCopy}
          aria-label="코드 복사"
        >
          {copied ? (
            <Check className="size-3 text-green-500" />
          ) : (
            <Copy className="size-3" />
          )}
        </Button>
      </div>

      {/* 코드 영역 */}
      <div className="overflow-x-auto bg-zinc-950 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="hover:bg-white/5 transition-colors">
                {/* 줄 번호 */}
                <td className="select-none py-0.5 pl-4 pr-3 text-right text-xs text-zinc-500 w-8 font-mono align-top">
                  {index + 1}
                </td>
                {/* 코드 내용 */}
                <td className="py-0.5 pr-4 font-mono text-xs text-zinc-100 whitespace-pre">
                  <CodeLine line={line} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 한국어 주석과 Solidity 키워드에 색상 적용
function CodeLine({ line }: { line: string }) {
  // 한국어 주석 (// 이후 내용) 감지
  const commentIndex = line.indexOf("//");

  if (commentIndex !== -1) {
    const codePart = line.slice(0, commentIndex);
    const commentPart = line.slice(commentIndex);
    return (
      <>
        <SolidityTokens text={codePart} />
        <span className="text-green-400/80">{commentPart}</span>
      </>
    );
  }

  // 블록 주석 /* */
  if (line.trimStart().startsWith("/*") || line.trimStart().startsWith("*")) {
    return <span className="text-green-400/80">{line}</span>;
  }

  return <SolidityTokens text={line} />;
}

// Solidity 키워드 색상 처리
function SolidityTokens({ text }: { text: string }) {
  const keywords =
    /\b(pragma|solidity|contract|interface|function|returns|public|private|internal|external|view|pure|override|virtual|mapping|address|uint256|uint8|string|bool|memory|storage|calldata|emit|event|indexed|import|is|new|constructor|modifier|require|revert|if|else|for|while|return|true|false|payable|struct|enum)\b/g;

  const parts = text.split(keywords);

  return (
    <>
      {parts.map((part, i) => {
        if (keywords.test(part)) {
          keywords.lastIndex = 0; // 정규식 상태 리셋
          return (
            <span key={i} className="text-purple-400">
              {part}
            </span>
          );
        }
        // 문자열 리터럴
        if (part.startsWith('"') || part.startsWith("'")) {
          return (
            <span key={i} className="text-yellow-300">
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
