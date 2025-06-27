import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { CodeBlock } from "./code";
import { RenderLatex } from "./LatexRenderer";
import "katex/dist/katex.min.css";

function ImageWithSkeleton({ src, alt }: { src: string; alt: string }) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	const handleLoad = () => {
		setLoading(false);
	};

	const handleError = (e: any) => {
		setLoading(false);
		setError(true);
	};

	if (!src || src.trim() === "") {
		return null;
	}

	return (
		<div className="relative w-full max-w-lg mx-auto my-4">
			{loading && (
				<div className="absolute inset-0 animate-pulse bg-muted rounded-lg flex items-center justify-center min-h-[200px]">
					<div className="flex flex-col items-center gap-2">
						<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
						<span className="text-sm text-muted-foreground">
							Loading image...
						</span>
					</div>
				</div>
			)}

			{error ? (
				<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
					<p className="text-destructive text-sm">Failed to load image</p>
					<p className="text-xs text-muted-foreground mt-1">{alt}</p>
				</div>
			) : (
				<img
					src={src}
					alt={alt}
					onLoad={handleLoad}
					onError={handleError}
					className={cn(
						"w-full h-auto rounded-lg shadow-md transition-opacity duration-300",
						loading ? "opacity-0" : "opacity-100",
					)}
					style={{ display: loading ? "none" : "block" }}
				/>
			)}
		</div>
	);
}

function autoWrapMathExpressions(text: string): string {
	const mathPatterns = [
		/\b(sin|cos|tan|log|ln|exp|sqrt|sum|integral|limit|derivative)\s*\([^)]*\)/gi,
		/\([^)]*\)\/\d+!/g,
		/[a-zA-Z]\^[\d\w()]+/g,
		/[∑∏∫∂∇√±≤≥≠≈∞π]/g,
		/[a-zA-Z][_^][a-zA-Z0-9()]+/g,
		/\d+!/g,
		/from\s+[a-zA-Z]+=\d+\s+to\s+∞/gi,
		/[a-zA-Z]\([^)]*\)\s*=\s*[^.!?]*[+\-*/^]/g,
	];

	let processedText = text;

	const hasMathContent = mathPatterns.some(pattern => pattern.test(text));

	if (hasMathContent) {
		const lines = processedText.split('\n');
		const processedLines = lines.map(line => {
			if (line.includes('$') || line.includes('\\begin') || line.includes('\\end')) {
				return line;
			}

			const lineHasMath = mathPatterns.some(pattern => pattern.test(line));

			if (lineHasMath) {
				if (line.includes('=') && line.trim().length > 10) {
					return `$$${line.trim()}$$`;
				}
				else {
					let processedLine = line;
					mathPatterns.forEach(pattern => {
						processedLine = processedLine.replace(pattern, (match) => `$${match}$`);
					});
					return processedLine;
				}
			}

			return line;
		});

		processedText = processedLines.join('\n');
	}

	return processedText;
}

export default function MarkdownRenderer({ content }: { content: string }) {
	const processedContent = useMemo(() => {
		if (!content) return content;

		let processedText = content;

		const base64ImageRegex =
			/!\[([^\]]*)\]\(data:image\/[^;]+;base64,([^)]+)\)/g;
		const matches = [...content.matchAll(base64ImageRegex)];

		if (matches.length > 0) {
			matches.forEach((match, index) => {
				console.log(
					`Image ${index + 1}: alt="${match[1]}", data length=${match[2]?.length}`,
				);
			});
		}

		processedText = autoWrapMathExpressions(processedText);

		return processedText;
	}, [content]);

	const hasLatex = useMemo(() => {
		const latexPatterns = [
			/\$\$[\s\S]*?\$\$/g,
			/\$[^$\n]*?\$/g,
			/\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\}/g,
			/\\[a-zA-Z]+(\{[^}]*\})*(\[[^\]]*\])*/g,
		];

		return latexPatterns.some(pattern => pattern.test(processedContent));
	}, [processedContent]);

	const isLaTeXContent = (text: string) => {
		const latexCount = (text.match(/\$\$[\s\S]*?\$\$|\$[^$\n]*?\$|\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\}|\\[a-zA-Z]+/g) || []).length;
		const textLength = text.replace(/\s/g, '').length;
		const latexLength = (text.match(/\$\$[\s\S]*?\$\$|\$[^$\n]*?\$/g) || []).join('').length;

		return latexCount > 2 || latexLength > textLength * 0.2;
	};

	return (
		<div>
			{(() => {
				const base64ImageRegex =
					/!\[([^\]]*)\]\(data:image\/[^;]+;base64,([^)]+)\)/g;
				const matches = [...content.matchAll(base64ImageRegex)];

				if (matches.length > 0) {
					return matches.map((match, index) => {
						const alt = match[1] || "Generated Image";
						const fullDataUrl = `data:image/png;base64,${match[2]}`;

						return (
							<div key={index}>
								<ImageWithSkeleton src={fullDataUrl} alt={alt} />
							</div>
						);
					});
				}

				if (hasLatex && isLaTeXContent(processedContent)) {
					return <RenderLatex>{processedContent}</RenderLatex>;
				}

				return (
					<Markdown
						remarkPlugins={[remarkGfm, remarkMath]}
						rehypePlugins={[rehypeKatex]}
						components={{
							img({ src, alt }) {
								const srcString = typeof src === "string" ? src : "";
								return (
									<ImageWithSkeleton
										src={srcString}
										alt={alt || "Generated image"}
									/>
								);
							},
							code: CodeBlock as any,
							p({ children }) {
								return <p className="mb-4 last:mb-0">{children}</p>;
							},
							ul({ children }) {
								return (
									<ul className="list-disc pl-4 mb-4 last:mb-0">{children}</ul>
								);
							},
							ol({ children }) {
								return (
									<ol className="list-decimal pl-4 mb-4 last:mb-0">
										{children}
									</ol>
								);
							},
							li({ children }) {
								return <li className="mb-1 last:mb-0">{children}</li>;
							},
							blockquote({ children }) {
								return (
									<blockquote className="border-l-4 border-primary/50 pl-4 italic ">
										{children}
									</blockquote>
								);
							},
							a({ children, href }) {
								return (
									<a
										href={href}
										className="text-primary underline hover:no-underline "
										target="_blank"
										rel="noopener noreferrer"
									>
										{children}
									</a>
								);
							},
							table({ children }) {
								return (
									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-border">
											{children}
										</table>
									</div>
								);
							},
							span({ className, children }) {
								if (className === 'math math-inline') {
									return <span className="katex-inline">{children}</span>;
								}
								return <span className={className}>{children}</span>;
							},
							div({ className, children }) {
								if (className === 'math math-display') {
									return <div className="katex-display my-4 text-center">{children}</div>;
								}
								return <div className={className}>{children}</div>;
							},
						}}
					>
						{processedContent}
					</Markdown>
				);
			})()}
		</div>
	);
}
