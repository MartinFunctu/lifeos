import { cn, waitForMs } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { persistStore } from "stores/persistStore"
import routes from "routes"
import useLogin from "api/pb_auth/useLogin"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { pb } from "@/lib/pocketbase"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {

  const WAIT_FOR_MS_AFTER_LOGIN = 800;
  const { t } = useTranslation();
  const [isRegistering, setIsRegistering] = useState(false);

  const loginFormScheme = z.object({
    email: z.string().min(1, t('login.email_required')).email(t('login.email_invalid')),
    password: z.string().min(isRegistering ? 6 : 1, isRegistering ? "Heslo musí mať aspoň 6 znakov" : t('login.password_required')),
  })


  const { lastEmailUsed, setLastEmailUsed } = persistStore();

  const loginForm = useForm<z.infer<typeof loginFormScheme>>({
    resolver: zodResolver(loginFormScheme),
    defaultValues: {
      email: lastEmailUsed,
      password: "",
    }
  })


  const navigate = useNavigate()
  const mutation = useLogin();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof loginFormScheme>) => {
    setIsLoading(true);
    try {
      if (isRegistering) {
        // Handle Registration
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });

        const resData = await response.json();

        if (!response.ok) {
          throw new Error(resData.message || "Registration failed");
        }

        // Auto-login after registration
        pb.authStore.save(resData.token, resData.user);
        toast.success("Účet úspešne vytvorený");

        await waitForMs(WAIT_FOR_MS_AFTER_LOGIN);
        navigate(routes.ADMIN_DASHBOARD, { replace: true });

      } else {
        // Handle Login
        await mutation.mutateAsync({ email: data.email, password: data.password })
        await waitForMs(WAIT_FOR_MS_AFTER_LOGIN);
        setLastEmailUsed(data.email);
        toast.success(t('login.success'));
        navigate(routes.ADMIN_DASHBOARD, {
          replace: true
        })
      }
    } catch (error) {
      console.error(error)
      const message = error instanceof Error ? error.message : t('login.error');
      loginForm.setError("root", { message })
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    loginForm.clearErrors();
  }

  const isPending = mutation.isPending || isLoading;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{isRegistering ? "Vytvoriť účet" : t('login.title')}</CardTitle>
          <CardDescription>
            {isRegistering ? "Zadajte svoj email a heslo pre vytvorenie účtu" : t('login.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2 ">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="">
                        <Label htmlFor={field.name}>{t('login.email')}</Label>
                        <Input
                          type="email"
                          placeholder="m@example.com"
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor={field.name}>{t('login.password')}</Label>
                        <Input
                          type="password"
                          placeholder="********"
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {loginForm.formState.errors.root && (
                  <div className="text-sm text-red-500 font-medium">
                    {loginForm.formState.errors.root.message}
                  </div>
                )}
                <Button type="submit" className="w-full transition-all" disabled={isPending}>
                  {
                    isPending ?
                      <span className="animate-scale-in overflow-hidden duration-200">
                        <Loader2 className={cn("mr-2 h-4 w-4 animate-spin")} />
                      </span>
                      :
                      <span className="">
                        {isRegistering ? "Vytvoriť účet" : t('login.submit')}
                      </span>
                  }

                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                {isRegistering ? "Už máte účet? " : "Nemáte účet? "}
                <button type="button" onClick={toggleMode} className="underline underline-offset-4 cursor-pointer text-primary hover:text-primary/80">
                  {isRegistering ? "Prihlásiť sa" : "Vytvoriť"}
                </button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
