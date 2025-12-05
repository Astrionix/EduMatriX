"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Float, MeshDistortMaterial, Icosahedron } from "@react-three/drei"
import { motion } from "framer-motion"
import { useRef, useState } from "react"
import * as THREE from "three"

function LogoMesh() {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHover] = useState(false)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.5
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5
        }
    })

    return (
        <Float speed={4} rotationIntensity={1} floatIntensity={2}>
            <Icosahedron
                ref={meshRef}
                args={[1, 0]}
                scale={hovered ? 1.2 : 1}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <MeshDistortMaterial
                    color={hovered ? "#06b6d4" : "#3b82f6"}
                    attach="material"
                    distort={0.6}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Icosahedron>
        </Float>
    )
}

export function PremiumLogo() {
    return (
        <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-10 w-10 relative">
                <Canvas camera={{ position: [0, 0, 3] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} />
                    <LogoMesh />
                </Canvas>
            </div>

            <div className="flex flex-col">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"
                >
                    MCA Portal
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "100%" }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                />
            </div>
        </div>
    )
}
