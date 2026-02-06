import { useMutation } from "@tanstack/react-query";
import endpoints from "endpoints";
import { type LoginRequest } from "../../../../../shared/schema";
import { pb } from "@/lib/pocketbase";

export default function useLogin() {
    return useMutation({
        mutationFn: async (vars: LoginRequest) => {
            const response = await fetch(endpoints.LOGIN, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(vars),
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }

            const data = await response.json();

            // Manually update PocketBase store with the response data
            // Since we are using a custom backend, we simulate the PB model
            pb.authStore.save(data.token, data.user);

            return data;
        },
    });
}
