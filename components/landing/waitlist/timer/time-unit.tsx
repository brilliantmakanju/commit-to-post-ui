import React from 'react';

import FlipCard from './flip-card';

interface TimeUnitProps {
	tens: number;
	ones: number;
	unit: string;
	className?: string; // Allow custom class names for styling
	style?: React.CSSProperties; // Allow custom inline styles
}

const TimeUnit = ({ tens, ones, unit, className, style }: TimeUnitProps) => {
	return (
		<div className={`flex items-center gap-[1px] ${className}`} style={style}>
			<div
				className="flip-card h-[140px] w-[100px] text-[5rem]"
				id={`${unit}-tens`}
			>
				<div className="top" />
				<div className="bottom" />
				<FlipCard
					unit={document.querySelector(`#${unit}-tens`)}
					newNumber={tens}
				/>
			</div>
			<div
				className="flip-card h-[140px] w-[100px] text-[5rem]"
				id={`${unit}-ones`}
			>
				<div className="top" />
				<div className="bottom" />
				<FlipCard
					unit={document.querySelector(`#${unit}-ones`)}
					newNumber={ones}
				/>
			</div>
		</div>
	);
};

export default TimeUnit;
