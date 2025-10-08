"use client";

import React, { useEffect, useRef } from "react";

interface CanvasConfettiProps {
	isOpen: boolean;
	centerX?: number;
	centerY?: number;
}

const CODE_SYMBOLS = [
	"{",
	"}",
	"[",
	"]",
	"<",
	">",
	"(",
	")",
	"/",
	"*",
	"+",
	"-",
	"=",
	"!",
	"?",
	"&",
	"|",
	"%",
	"$",
	"#",
	"@",
	"~",
	"^",
	":",
	";",
	".",
	",",
	"_",
	"'",
	'"',
	"`",
	"if",
	"else",
	"=>",
	"let",
	"var",
	"const",
	"fn",
	"return",
	"for",
	"while",
	"null",
	"true",
	"false",
	"import",
	"export",
	"async",
	"await",
	"++",
	"--",
	"::",
	"//",
	"/*",
	"*/",
	"<!--",
	"-->",
];

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	rotation: number;
	rotationSpeed: number;
	depth: number;
	symbol: string;
	alpha: number;
}

const CONFETTI_COUNT = 50;

export const CanvasConfetti: React.FC<CanvasConfettiProps> = ({
	isOpen,
	centerX,
	centerY,
}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const animationRef = useRef<number>();

	useEffect(() => {
		if (!isOpen) return;

		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d");
		if (!context || !canvas) return;

		const width = window.innerWidth;
		const height = window.innerHeight;
		canvas.width = width;
		canvas.height = height;

		const cx = centerX ?? width / 2;
		const cy = centerY ?? height / 2;

		const particles: Particle[] = Array.from({ length: CONFETTI_COUNT }).map(
			() => {
				const depth = Math.random();
				const angle = Math.random() * 2 * Math.PI;
				const speed = 3 + depth * 4;
				return {
					x: cx,
					y: cy,
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed,
					size: 10 + depth * 14,
					rotation: Math.random() * 360,
					rotationSpeed: (Math.random() - 0.5) * 5 * (0.5 + depth),
					depth,
					symbol: CODE_SYMBOLS[Math.floor(Math.random() * CODE_SYMBOLS.length)],
					alpha: 0.7 + depth * 0.3, // more visible
				};
			},
		);

		const animate = () => {
			// lighter motion blur for trails
			context.fillStyle = "rgba(255,255,255,0.1)";
			context.fillRect(0, 0, width, height);

			particles.forEach(p => {
				context.save();
				context.translate(p.x, p.y);
				context.rotate((p.rotation * Math.PI) / 180);
				context.font = `${p.size}px monospace`;
				context.globalAlpha = p.alpha;
				context.fillStyle = `rgba(${p.depth * 255}, ${p.depth * 255}, ${p.depth * 255}, ${p.alpha})`; // black->white based on depth
				context.shadowColor = "#fff";
				context.shadowBlur = 6 + p.depth * 8;
				context.fillText(p.symbol, 0, 0);
				context.restore();

				// update physics
				p.vy += 0.05 * (1 - p.depth);
				p.vx *= 0.99;
				p.vy *= 0.99;
				p.x += p.vx;
				p.y += p.vy;
				p.rotation += p.rotationSpeed;

				// wrap around edges
				if (p.y > height + 50) p.y = -50;
				if (p.x > width + 50) p.x = -50;
				if (p.x < -50) p.x = width + 50;
			});

			animationRef.current = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
		};
	}, [isOpen, centerX, centerY]);

	return (
		<canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" />
	);
};
