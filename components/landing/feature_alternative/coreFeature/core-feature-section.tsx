import { BarChart3, FileText } from 'lucide-react';

import coreFeaturesData from '../data/corefeature.json';
import CoreFeatureItem from './core-feature-item';

// Define a type for the available icon keys
type IconKey = 'FileText' | 'BarChart3'; // Add all other icon names here as union types

// Define the iconMap with specific keys
const iconMap: Record<IconKey, JSX.Element> = {
	FileText: <FileText className="h-8 w-8 text-[#D35400]" />,
	BarChart3: <BarChart3 className="h-8 w-8 text-[#D35400]" />,
};

const CoreFeaturesSection = () => {
	return (
		<section className="w-full px-4 md:px-6">
			<div className="space-y-20">
				{coreFeaturesData.map((feature, index) => (
					<CoreFeatureItem
						key={index}
						icon={iconMap[feature.icon as IconKey]} // Map the icon name to its JSX component
						title={feature.title}
						description={feature.description}
						points={feature.points}
						imagePosition={feature.imagePosition}
						imageURL={feature.imageURL}
					/>
				))}
			</div>
		</section>
	);
};

export default CoreFeaturesSection;
