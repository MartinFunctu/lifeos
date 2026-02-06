import { useState, useEffect } from "react";
import { pb } from "@/lib/pocketbase";
import { AuthModel } from "pocketbase";

export default function useAuth() {
    const [user, setUser] = useState<AuthModel | null>(pb.authStore.model);

    useEffect(() => {
        return pb.authStore.onChange((token, model) => {
            setUser(model);
        });
    }, []);

    return { user };
}
