import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AppProjectPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await auth();

    // Ensure user is authenticated
    if (!session?.user) {
        redirect("/login");
    }

    // Redirect to the explore page for this project
    // The explore page handles all project viewing logic
    redirect(`/explore/${id}`);
}
