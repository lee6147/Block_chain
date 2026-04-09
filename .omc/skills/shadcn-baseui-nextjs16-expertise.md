# shadcn/ui v4 + @base-ui/react in Next.js 16

## The Insight
Next.js 16 with shadcn v4 uses **@base-ui/react**, NOT radix-ui. The component API is fundamentally different: `asChild` pattern doesn't exist, and some components like `Progress` require function children with specific signatures.

## Why This Matters
Multiple build failures occurred because agents assumed radix-ui patterns:
- `Button asChild` → doesn't exist, use `buttonVariants()` + native element instead
- `<ProgressValue>{percentage}%</ProgressValue>` → fails, children must be `(formattedValue, value) => ReactNode`
- `<Tabs defaultValue="x">` → API differs from radix Tabs

## Recognition Pattern
- `Property 'asChild' does not exist` TypeScript error
- `Type 'string' is not assignable to type '(formattedValue: string, value: number) => ReactNode'`
- Any shadcn component behaving unexpectedly after Next.js 16 upgrade

## The Approach
1. **Always read** `node_modules/next/dist/docs/` before writing Next.js 16 code — AGENTS.md explicitly warns about this
2. Check `components.json` for the style field — `base-nova` means @base-ui/react
3. For buttons as links: `<Link className={buttonVariants({ variant: "outline" })} href="...">` instead of `<Button asChild><Link>...</Link></Button>`
4. For Progress with value display: `<ProgressValue>{(formatted, val) => <span>{formatted}</span>}</ProgressValue>`
5. When in doubt, read the actual component source in `src/components/ui/*.tsx` — it shows the real API
