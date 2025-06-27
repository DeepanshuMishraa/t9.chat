import { RiGithubFill } from "@remixicon/react";
import { NavLink, Outlet } from "react-router";
import { ThemeToggler } from "../components/toggler";

export default function Appbar() {
	return (
		<div className="flex justify-between items-center p-4">
			<NavLink to="/" className="text-2xl font-bold text-white">
				t9.chat
			</NavLink>
			<div className="flex items-center gap-4">
				<ThemeToggler />
				<a
					href="https://github.com/DeepanshuMishraa/t9.chat"
					target="_blank"
					rel="noopener noreferrer"
					className="text-white"
				>
					<RiGithubFill size={30} />
				</a>
			</div>
			<Outlet />
		</div>
	);
}
