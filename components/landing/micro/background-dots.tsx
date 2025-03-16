"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export function BackgroundDots({ className }: { className?: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const context = canvas.getContext("2d");
		if (!context) return;

		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		// Create dots
		const dots: {
			x: number;
			y: number;
			radius: number;
			baseRadius: number;
			vx: number;
			vy: number;
			active: boolean;
			pulsePhase: number;
			distanceToMouse: number;
		}[] = [];

		const createDots = () => {
			const gridSize = 40;
			const numberDotsX = Math.ceil(canvas.width / gridSize);
			const numberDotsY = Math.ceil(canvas.height / gridSize);

			for (let index = 0; index < numberDotsX; index++) {
				for (let index_ = 0; index_ < numberDotsY; index_++) {
					const x = index * gridSize + Math.random() * 20 - 10;
					const y = index_ * gridSize + Math.random() * 20 - 10;
					const radius = Math.random() * 1 + 0.5;

					dots.push({
						x,
						y,
						radius,
						baseRadius: radius,
						vx: Math.random() * 0.2 - 0.1,
						vy: Math.random() * 0.2 - 0.1,
						active: false,
						pulsePhase: Math.random() * Math.PI * 2, // Random starting phase
						distanceToMouse: Infinity,
					});
				}
			}
		};

		createDots();

		// Mouse interaction
		let mouseX = 0;
		let mouseY = 0;
		const activationRadius = 50; // Larger radius for multiple dot activation
		const maxPulseRadius = 3; // Maximum radius multiplier for pulse

		canvas.addEventListener("mousemove", event_ => {
			mouseX = event_.clientX;
			mouseY = event_.clientY;

			// Update all dots' states based on mouse position
			dots.forEach(dot => {
				const dx = mouseX - dot.x;
				const dy = mouseY - dot.y;
				const distance = Math.hypot(dx, dy);
				dot.distanceToMouse = distance;
				dot.active = distance < activationRadius;
			});
		});

		// Animation loop
		const animate = () => {
			context.clearRect(0, 0, canvas.width, canvas.height);

			// Update and draw dots
			for (const dot of dots) {
				// Move dots slightly
				dot.x += dot.vx;
				dot.y += dot.vy;

				// Bounce off edges
				if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
				if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

				// Update pulse phase
				dot.pulsePhase += 0.1; // Control pulse speed
				if (dot.pulsePhase > Math.PI * 2) {
					dot.pulsePhase = 0;
				}

				// Calculate current radius based on state
				let currentRadius = dot.baseRadius;
				if (dot.active) {
					// Create smooth pulse effect based on distance to mouse
					const pulseIntensity = 1 - dot.distanceToMouse / activationRadius;
					const pulseFactor =
						1 +
						(Math.sin(dot.pulsePhase) * 0.5 + 0.5) *
							maxPulseRadius *
							pulseIntensity;
					currentRadius = dot.baseRadius * pulseFactor;
				}

				// Draw dot with gradient
				const gradient = context.createRadialGradient(
					dot.x,
					dot.y,
					0,
					dot.x,
					dot.y,
					currentRadius * 2,
				);

				if (dot.active) {
					gradient.addColorStop(0, "#6366F1");
					gradient.addColorStop(1, "rgba(99, 102, 241, 0)");
				} else {
					gradient.addColorStop(0, "#333333");
					gradient.addColorStop(1, "rgba(51, 51, 51, 0)");
				}

				context.beginPath();
				context.arc(dot.x, dot.y, currentRadius * 2, 0, Math.PI * 2);
				context.fillStyle = gradient;
				context.fill();
			}

			requestAnimationFrame(animate);
		};

		animate();

		return () => {
			window.removeEventListener("resize", resizeCanvas);
		};
	}, []);

	return (
		<motion.canvas
			ref={canvasRef}
			className={`fixed inset-0 z-0 ${className}`}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 1 }}
		/>
	);
}
