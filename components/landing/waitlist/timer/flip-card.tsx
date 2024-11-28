import React, { useEffect, useState } from 'react';

interface FlipCardProps {
	unit: HTMLElement | null;
	newNumber: number;
}

const FlipCard = ({ unit, newNumber }: FlipCardProps) => {
	const [previousNumber, setPreviousNumber] = useState<number>(0);

	useEffect(() => {
		if (unit) {
			const topHalf = unit.querySelector('.top') as HTMLElement;
			const startNumber = Number.parseInt(topHalf?.textContent || '0', 10);

			if (newNumber !== startNumber) {
				setPreviousNumber(startNumber);
				const bottomHalf = unit.querySelector('.bottom') as HTMLElement;
				const topFlip = document.createElement('div');
				topFlip.classList.add('top-flip');
				const bottomFlip = document.createElement('div');
				bottomFlip.classList.add('bottom-flip');

				topFlip.textContent = String(startNumber);
				bottomFlip.textContent = String(newNumber);

				topFlip.addEventListener('animationstart', () => {
					if (topHalf) {
						topHalf.textContent = String(newNumber);
					}
				});

				topFlip.addEventListener('animationend', () => {
					topFlip.remove();
				});

				bottomFlip.addEventListener('animationend', () => {
					if (bottomHalf) {
						bottomHalf.textContent = String(newNumber);
						bottomFlip.remove();
					}
				});

				unit.append(topFlip, bottomFlip);
			}
		}
	}, [unit, newNumber, previousNumber]);

	return <></>;
};

export default FlipCard;
