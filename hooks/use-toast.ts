"use client"

// Simplified version of use-toast for now
export const useToast = () => {
    return {
        toast: (props: any) => {
            console.log("Toast:", props)
            // In a real app, this would trigger a UI toast
        }
    }
}
