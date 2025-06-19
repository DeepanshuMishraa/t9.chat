import { Button } from "@/frontend/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/frontend/components/ui/card";
import { Link } from "react-router";

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<Card className="w-[420px]">
				<CardHeader>
					<CardTitle>Page Not Found</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						The page you are looking for doesn&apos;t exist or has been moved.
					</p>
				</CardContent>
				<CardFooter>
					<Button asChild>
						<Link to="/">Return Home</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
