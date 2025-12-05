import { LoginForm } from "@/components/auth/login-form"
import { LoginBackground } from "@/components/auth/login-background"

export default function LoginPage() {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
            <LoginBackground />
            <div className="relative z-10 w-full max-w-md p-4">
                <LoginForm />
            </div>
        </div>
    )
}
