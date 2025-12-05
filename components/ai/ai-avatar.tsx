"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Sphere, MeshDistortMaterial } from "@react-three/drei"
import { useTheme } from "next-themes"

function AnimatedSphere() {
    const ref = useRef<any>()
    const { theme } = useTheme()

    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.getElapsedTime()
            ref.current.distort = 0.4 + Math.sin(t) * 0.2
        }
    })

    const color = theme === 'dark' ? '#818cf8' : '#4f46e5'

    return (
        <Sphere visible args={[1, 100, 200]} scale={2} ref={ref}>
            <MeshDistortMaterial
                color={color}
                attach="material"
                distort={0.5}
                speed={2}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    )
}

export function AIAvatar() {
    return (
        <div className="h-24 w-24 relative">
            <Canvas camera={{ position: [0, 0, 4] }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <AnimatedSphere />
            </Canvas>
        </div>
    )
}
