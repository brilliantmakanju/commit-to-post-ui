"use client";
import React, { useEffect, useRef, useState } from "react";

// TypeWriter Component with Arch Linux styling
interface TypeWriterProps {
	text: string;
	speed?: number;
	onComplete?: () => void;
	className?: string;
}

export const TypeWriter: React.FC<TypeWriterProps> = ({
	text,
	speed = 50,
	onComplete,
	className = "",
}) => {
	const [displayText, setDisplayText] = useState("");
	const indexRef = useRef(0);
	const completedRef = useRef(false);

	useEffect(() => {
		if (indexRef.current < text.length) {
			const timer = setTimeout(() => {
				indexRef.current += 1;
				setDisplayText(text.slice(0, indexRef.current));
			}, speed);
			return () => clearTimeout(timer);
		} else if (!completedRef.current) {
			completedRef.current = true;
			onComplete?.();
		}
	}, [displayText, text, speed, onComplete]);

	return (
		<span className={className}>
			{displayText}
			{displayText.length < text.length && (
				<span className="animate-pulse text-arch-blue">█</span>
			)}
		</span>
	);
};
// import { motion } from "framer-motion";
// import React, { useCallback, useEffect, useRef, useState } from "react";

// // TypeWriter component with Ubuntu theme
// interface TypeWriterProps {
// 	text: string;
// 	speed?: number;
// 	onComplete?: () => void;
// 	className?: string;
// }

// export const TypeWriter: React.FC<TypeWriterProps> = ({
// 	text,
// 	speed = 50,
// 	onComplete,
// 	className = "",
// }) => {
// 	const [displayText, setDisplayText] = useState("");
// 	const indexRef = useRef(0);
// 	const completedRef = useRef(false);

// 	useEffect(() => {
// 		if (indexRef.current < text.length) {
// 			const timer = setTimeout(() => {
// 				indexRef.current += 1;
// 				setDisplayText(text.slice(0, indexRef.current));
// 			}, speed);
// 			return () => clearTimeout(timer);
// 		} else if (!completedRef.current) {
// 			completedRef.current = true;
// 			onComplete?.();
// 		}
// 	}, [displayText, text, speed, onComplete]);

// 	return (
// 		<span className={className}>
// 			{displayText}
// 			{displayText.length < text.length && (
// 				<span className="animate-pulse text-white">█</span>
// 			)}
// 		</span>
// 	);
// };
