import { NavLink, Outlet } from "react-router";
import { ThemeToggler } from "./toggler";

export default function Appbar() {
  return (
    <div className="flex justify-between items-center p-4 m-4 bg-background">
      <NavLink to="/">t9.chat</NavLink>
      <div className="flex items-center gap-4">
        <ThemeToggler />
        <NavLink to="/">Home</NavLink>
        <NavLink to="/docs">Docs</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </div>
      <Outlet />
    </div>
  )
}
