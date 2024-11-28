import React, { useEffect, useState } from 'react';

import TimeUnit from './time-unit';

const CountdownTimer: React.FC = () => {
	const [timeLeft, setTimeLeft] = useState<number>(0);
	const [previousTime, setPreviousTime] = useState<number>(0);

	// Initialize target time (24 hours later from the current time)
	const countToDate = new Date().setHours(new Date().getHours() + 24);

	// Update timer every 250ms
	useEffect(() => {
		const interval = setInterval(() => {
			const currentDate: any = new Date();
			const timeBetweenDates = Math.ceil((countToDate - currentDate) / 1000);
			setTimeLeft(timeBetweenDates);
		}, 250);

		return () => clearInterval(interval);
	}, [countToDate]);

	useEffect(() => {
		if (timeLeft !== previousTime) {
			setPreviousTime(timeLeft);
		}
	}, [timeLeft, previousTime]);

	// Calculate the breakdown of time
	const seconds = timeLeft % 60;
	const minutes = Math.floor(timeLeft / 60) % 60;
	const hours = Math.floor(timeLeft / 3600);

	return (
		<div className="flex w-full flex-row gap-4">
			<TimeUnit tens={Math.floor(hours / 10)} ones={hours % 10} unit="hours" />
			<TimeUnit
				tens={Math.floor(minutes / 10)}
				ones={minutes % 10}
				unit="minutes"
			/>
			<TimeUnit
				tens={Math.floor(seconds / 10)}
				ones={seconds % 10}
				unit="seconds"
			/>
		</div>
	);
};

export default CountdownTimer;
