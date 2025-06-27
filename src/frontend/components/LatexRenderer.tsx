import Latex from "react-latex-next";

export const RenderLatex = ({ children }: { children: string }) => {
	return <Latex>{children}</Latex>;
};
