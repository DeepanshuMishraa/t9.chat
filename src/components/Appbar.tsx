import { NavLink, Outlet } from "react-router";
import { ThemeToggler } from "./toggler";
import { RiGithubFill } from "@remixicon/react";

export default function Appbar() {
  return (
    <div className="flex justify-between items-center p-4 m-4">
      <NavLink to="/" className="text-2xl font-bold">t9.chat</NavLink>
      <div className="flex items-center gap-4">
        <ThemeToggler />
        <a href="https://github.com/DeepanshuMishraa/t9.chat" target="_blank" rel="noopener noreferrer">
          <RiGithubFill size={30} />
        </a>
      </div>
      <Outlet />
    </div>
  )
}
