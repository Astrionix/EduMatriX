"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial, Float } from "@react-three/drei"
import * as THREE from "three"
import { useTheme } from "next-themes"
import { random } from "maath"

function Particles(props: any) {
    const ref = useRef<any>(null)
    const { theme } = useTheme()

    // Generate random points in a sphere
    const sphere = useMemo(() => {
        // 6000 is divisible by 3 (x, y, z for each point)
        const data = random.inSphere(new Float32Array(6000), { radius: 15 }) as Float32Array
        // Validate to prevent NaN errors
        for (let i = 0; i < data.length; i++) {
            if (isNaN(data[i])) data[i] = 0;
        }
        return data;
    }, [])

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10
            ref.current.rotation.y -= delta / 15
        }
    })

    const color = theme === 'dark' ? '#3b82f6' : '#9333ea' // Blue/Purple based on theme

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color={color}
                    size={0.05}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    )
}

function NetworkLines() {
    const { theme } = useTheme()
    const groupRef = useRef<THREE.Group>(null)

    // Create a stable set of nodes for the network
    const nodes = useMemo(() => {
        const temp = []
        for (let i = 0; i < 50; i++) {
            temp.push(new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10
            ))
        }
        return temp
    }, [])

    // Create connections
    const linesGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry()
        const points = []

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dist = nodes[i].distanceTo(nodes[j])
                if (dist < 4) {
                    points.push(nodes[i])
                    points.push(nodes[j])
                }
            }
        }
        geometry.setFromPoints(points)
        return geometry
    }, [nodes])

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.02
        }
    })

    const lineColor = theme === 'dark' ? '#06b6d4' : '#3b82f6' // Cyan/Blue

    return (
        <group ref={groupRef}>
            <lineSegments geometry={linesGeometry}>
                <lineBasicMaterial color={lineColor} transparent opacity={0.15} />
            </lineSegments>
        </group>
    )
}

export function DashboardBackground() {
    return (
        <div className="fixed inset-0 -z-10 h-full w-full pointer-events-none">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <NetworkLines />
                </Float>
                <Particles />
            </Canvas>
        </div>
    )
}
