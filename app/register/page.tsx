import { RegisterForm } from "@/components/auth/register-form"
import { LoginBackground } from "@/components/auth/login-background"

export default function RegisterPage() {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
            <LoginBackground />
            <div className="relative z-10 w-full max-w-md p-4">
                <RegisterForm />
            </div>
        </div>
    )
}
