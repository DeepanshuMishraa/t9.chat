import { signIn, useSession } from "@/lib/auth-client";
import { RiGoogleFill, RiRobot2Fill } from "@remixicon/react";
import Image from "next/image";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import Appbar from "../components/Appbar";
import localFont from "next/font/local";

const font = localFont({
	src: "./fonts/HollaMediaeval.ttf",
	variable: "--font-holla",
});

export default function Home() {
	const navigate = useNavigate();
	const { data: session } = useSession();

	useEffect(() => {
		if (session?.user) {
			navigate("/chat");
		}
	}, [session, navigate]);

	const handleGoogleSignIn = async () => {
		try {
			await signIn.social({
				provider: "google",
				fetchOptions: {
					onSuccess: () => {
						navigate("/chat");
					},
				},
			});
		} catch (error) {
			console.error("Failed to sign in:", error);
		}
	};

	if (session?.user) {
		return null;
	}

	return (
		<div
			className="h-screen relative"
			style={{
				backgroundImage: `url('/bg.png')`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat'
			}}
		>
			<div className="absolute inset-0 bg-black/20" />
			<div className="relative z-20">
				<Appbar />
			</div>
			<div className="container mx-auto px-4 py-24 relative z-10">
				<div className="flex flex-col items-center text-center space-y-8">
					<div className="relative">
						<div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-primary/50 blur-2xl opacity-25" />
						<Image
							src="/t9.png"
							alt="t9.chat"
							width={100}
							height={100}
							className="rounded-3xl"
						
					</div>
					<h1 className={`${font.className} text-4xl md:text-6xl font-bold text-gray-300`}>
						t9.chat
					</h1>
					<p className={`${font.className} text-xl md:text-2xl  tracking-wide text-gray-300 max-w-2xl`}>
						Experience the blazing fast multimodal ai chat
					</p>
					<Button
						size="lg"
						variant="outline"
						className={`${font.className} text-lg px-8 py-6 flex items-center gap-3 cursor-pointer hover:bg-gray-100`}
						onClick={handleGoogleSignIn}
					>
						<RiGoogleFill className="w-5 h-5" />
						Continue with Google
					</Button>
				</div>
			</div>
		</div>
	);
}
