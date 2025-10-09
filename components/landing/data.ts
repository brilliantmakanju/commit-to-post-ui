import { Clock, Code, MessageCircle, Puzzle } from "lucide-react";

// interface Benefit {
// 	id: number;
// 	icon: any;
// 	title: string;
// 	description: string;
// 	modalContent: {
// 		title: string;
// 		description: string;
// 		features: string[];
// 	};
// 	gradient: string;
// }

export const benefits = [
	{
		id: 1,
		icon: Puzzle,
		title: "Effortless Integration",
		description: "Get started in minutes with our simple setup process.",
		features: [
			"Connect your GitHub account",
			"Select your repo and branch to monitor",
			"Sync your social platforms and let the AI do the rest!",
		],
	},
	{
		id: 2,
		icon: Clock,
		title: "Automated Updates",
		description:
			"Let AI handle your social media updates directly from Git commits.",
		features: [
			"Seamlessly integrates with GitHub",
			"Posts updates to your selected platforms",
		],
	},
	{
		id: 3,
		icon: MessageCircle,
		title: "Streamlined Social Posting",
		description:
			"Connect once and let the AI handle your social media presence.",
		features: [
			"Schedule posts for optimal visibility",
			"Automatically format posts for each platform",
		],
	},
	{
		id: 4,
		icon: Code,
		title: "Developer-Friendly Workflow",
		description:
			"Seamlessly integrates into your existing development process.",
		features: [
			"Specify branches to track for updates",
			"Define the project scope for tailored messaging",
		],
	},
];

export const repos = [
	"push-to-draft",
	"social-sync",
	"git-publisher",
	"dev-to-social",
	"commit-cast",
	"code-chronicle",
	"deploy-digest",
	"feature-feed",
	"build-broadcast",
	"release-reporter",
	"merge-messenger",
	"dev-dashboard",
	"project-pulse",
	"commit-commander",
	"git-gazette",
	"task-tracker-pro",
	"workflow-wizard",
	"automation-arsenal",
	"integration-hub",
	"pipeline-portal",
];

export const commitMessages = [
	"feat: add new user authentication system",
	"fix: resolve mobile responsive issues",
	"docs: update API documentation",
	"refactor: optimize database queries",
	"style: improve UI components design",
	"feat: implement real-time notifications",
	"fix: handle edge case in payment flow",
	"perf: reduce bundle size by 30%",
	"feat: add OAuth integration with Google and GitHub",
	"fix: memory leak in background sync process",
	"feat: implement drag and drop file upload",
	"refactor: migrate from REST to GraphQL API",
	"feat: add dark mode theme support",
	"fix: resolve CORS issues in production environment",
	"feat: implement advanced search functionality",
	"perf: optimize image loading with lazy loading",
	"feat: add multi-language internationalization support",
	"fix: handle timezone conversion edge cases",
	"feat: implement automated testing pipeline",
	"refactor: restructure component architecture",
	"feat: add real-time collaboration features",
	"fix: resolve database connection timeout issues",
	"feat: implement progressive web app capabilities",
	"perf: implement Redis caching layer",
	"feat: add comprehensive analytics dashboard",
	"fix: resolve security vulnerabilities in dependencies",
	"feat: implement microservices architecture",
	"refactor: optimize React component rendering",
	"feat: add advanced user permission system",
	"fix: resolve SSL certificate configuration issues",
	"feat: implement automated backup system",
	"perf: optimize SQL query performance",
	"feat: add webhook integration system",
	"fix: resolve cross-browser compatibility issues",
	"feat: implement advanced data visualization",
	"refactor: modernize legacy codebase to TypeScript",
	"feat: add machine learning recommendation engine",
	"fix: resolve race condition in concurrent operations",
	"feat: implement comprehensive logging system",
	"perf: optimize frontend asset delivery with CDN",
];

export const branches = [
	"main",
	"develop",
	"feature/auth",
	"hotfix/mobile",
	"release/v2.0",
	"feature/oauth-integration",
	"bugfix/memory-leak",
	"feature/file-upload",
	"refactor/graphql-migration",
	"feature/dark-mode",
	"hotfix/cors-production",
	"feature/advanced-search",
	"performance/image-optimization",
	"feature/i18n-support",
	"bugfix/timezone-handling",
	"feature/testing-pipeline",
	"refactor/component-architecture",
	"feature/collaboration",
	"hotfix/database-timeout",
	"feature/pwa-support",
	"performance/redis-cache",
	"feature/analytics-dashboard",
	"security/dependency-updates",
	"refactor/microservices",
	"performance/react-optimization",
	"feature/user-permissions",
	"hotfix/ssl-configuration",
	"feature/backup-system",
	"performance/sql-optimization",
	"feature/webhook-integration",
];

export const socialPosts = {
	"feat: add new user authentication system": {
		linkedin:
			"New authentication system deployed with MFA, JWT tokens, and SSO support. Includes Google and GitHub login options with enterprise-grade security.",
		slack:
			"Auth system update live. Added MFA, JWT, and social login support (Google/GitHub). All users migrated successfully.",
		discord:
			"Authentication overhaul complete. New system supports MFA, SSO, and multiple login providers. Smooth migration for all users.",
	},
	"fix: resolve mobile responsive issues": {
		linkedin:
			"Mobile responsiveness issues resolved. Improved layouts using CSS Grid and Flexbox with enhanced touch interactions across all devices.",
		slack:
			"Mobile fixes deployed. Rebuilt responsive layouts and improved touch navigation. App now works consistently on all screen sizes.",
		discord:
			"Mobile UX fixes are live. Better layouts, improved navigation, and consistent experience across iOS and Android.",
	},
	"docs: update API documentation": {
		linkedin:
			"API documentation completely refreshed. Added interactive examples, authentication guides, and SDK support for faster developer integration.",
		slack:
			"API docs updated with clear examples, auth guides, and SDK references. Interactive explorer now available for testing endpoints.",
		discord:
			"API docs got a major update. New examples, better structure, and interactive testing tools for easier integration.",
	},
	"refactor: optimize database queries": {
		linkedin:
			"Database performance improved by 50% through query optimization, indexing, and connection pooling. Added monitoring for continued performance tracking.",
		slack:
			"DB queries optimized - 50% faster response times. Added indexes, caching, and connection pooling across all services.",
		discord:
			"Database optimization complete. Queries are 50% faster thanks to better indexing and connection management.",
	},
	"style: improve UI components design": {
		linkedin:
			"UI component redesign completed with focus on accessibility and consistency. Updated design system ensures WCAG compliance across all interfaces.",
		slack:
			"UI components refreshed with improved spacing, colors, and accessibility. All components now follow updated design system standards.",
		discord:
			"UI got a fresh look. New components are cleaner, more accessible, and consistent throughout the app.",
	},
	"feat: implement real-time notifications": {
		linkedin:
			"Real-time notification system launched with WebSocket support. Features instant delivery, read receipts, and customizable preferences.",
		slack:
			"Real-time notifications are live. WebSocket-based system with push support, read tracking, and user preferences.",
		discord:
			"Real-time notifications now working. Built on WebSockets with history, read status, and offline delivery support.",
	},
	"fix: handle edge case in payment flow": {
		linkedin:
			"Payment flow edge case resolved with improved error handling and retry logic. Added transaction state tracking for better reliability.",
		slack:
			"Payment bug fixed. Added retry logic, better error handling, and transaction state management for edge cases.",
		discord:
			"Fixed tricky payment issue. Better error handling and retry logic prevent transaction failures during network issues.",
	},
	"perf: reduce bundle size by 30%": {
		linkedin:
			"Application bundle size reduced by 30% through tree shaking, code splitting, and dependency optimization. Significantly improved load times.",
		slack:
			"Bundle size down 30%. Applied tree shaking, lazy loading, and removed unused dependencies. Much faster load times.",
		discord:
			"Bundle size cut by 30%. Removed dead code, added lazy loading, and optimized dependencies. App loads much faster now.",
	},
	"feat: add OAuth integration with Google and GitHub": {
		linkedin:
			"OAuth integration added for Google and GitHub. Users can now sign in with their existing accounts while maintaining security best practices.",
		slack:
			"OAuth login added for Google and GitHub. Secure integration with proper scope management and token handling.",
		discord:
			"Google and GitHub login now available. OAuth integration makes signing in quick and secure.",
	},
	"fix: memory leak in background sync process": {
		linkedin:
			"Memory leak in background sync resolved. Improved resource management and added monitoring to prevent future memory issues.",
		slack:
			"Background sync memory leak fixed. Added proper cleanup and monitoring to track memory usage patterns.",
		discord:
			"Fixed memory leak in sync process. Better resource cleanup prevents memory buildup during background operations.",
	},
	"feat: implement drag and drop file upload": {
		linkedin:
			"Drag and drop file upload feature launched. Supports multiple file types with progress tracking and error handling.",
		slack:
			"Drag and drop uploads now available. Multi-file support with progress bars and validation for common file types.",
		discord:
			"File uploads just got easier. Drag and drop support with progress tracking and multi-file selection.",
	},
	"refactor: migrate from REST to GraphQL API": {
		linkedin:
			"Successfully migrated from REST to GraphQL API. Improved query efficiency and reduced over-fetching with flexible data requests.",
		slack:
			"API migration to GraphQL complete. Better query efficiency, reduced data transfer, and improved client flexibility.",
		discord:
			"Switched to GraphQL API. More efficient queries, better data fetching, and improved performance overall.",
	},
	"feat: add dark mode theme support": {
		linkedin:
			"Dark mode theme support added with automatic system preference detection. Consistent styling across all components and smooth transitions.",
		slack:
			"Dark mode is live. Automatic system detection, manual toggle, and consistent theming throughout the application.",
		discord:
			"Dark mode support added. Auto-detects system preference and provides manual toggle with smooth theme transitions.",
	},
	"fix: resolve CORS issues in production environment": {
		linkedin:
			"Production CORS configuration issues resolved. Improved security headers and proper origin handling for cross-domain requests.",
		slack:
			"CORS issues fixed in production. Updated security headers and origin policies for proper cross-domain handling.",
		discord:
			"Fixed CORS problems in production. Better security headers and origin management for API requests.",
	},
	"feat: implement advanced search functionality": {
		linkedin:
			"Advanced search functionality deployed with filters, sorting, and fuzzy matching. Improved search accuracy and user experience.",
		slack:
			"Advanced search is live. Added filters, sorting options, and fuzzy matching for better search results.",
		discord:
			"Search got a major upgrade. New filters, better matching, and sorting options make finding content much easier.",
	},
	"perf: optimize image loading with lazy loading": {
		linkedin:
			"Image loading performance optimized with lazy loading implementation. Reduced initial page load times and bandwidth usage.",
		slack:
			"Image lazy loading deployed. Faster page loads and reduced bandwidth usage with progressive image loading.",
		discord:
			"Images now load lazily. Better performance, faster page loads, and reduced data usage.",
	},
	"feat: add multi-language internationalization support": {
		linkedin:
			"Internationalization support added for multiple languages. Dynamic language switching with proper locale handling and formatting.",
		slack:
			"Multi-language support is live. Dynamic language switching with proper locale formatting and translation management.",
		discord:
			"App now supports multiple languages. Easy language switching with proper localization and formatting.",
	},
	"fix: handle timezone conversion edge cases": {
		linkedin:
			"Timezone conversion edge cases resolved. Improved date handling with proper DST support and regional timezone accuracy.",
		slack:
			"Timezone handling fixed. Better DST support and edge case management for accurate time display across regions.",
		discord:
			"Fixed timezone conversion bugs. Better handling of DST changes and edge cases for accurate time display.",
	},
	"feat: implement automated testing pipeline": {
		linkedin:
			"Automated testing pipeline implemented with comprehensive test coverage. Includes unit, integration, and end-to-end testing workflows.",
		slack:
			"Testing pipeline deployed. Automated unit, integration, and e2e tests with coverage reporting and CI integration.",
		discord:
			"Automated testing is now running. Full test coverage with unit, integration, and e2e tests in the pipeline.",
	},
	"refactor: restructure component architecture": {
		linkedin:
			"Component architecture restructured for better maintainability. Improved code organization with clear separation of concerns.",
		slack:
			"Component architecture refactored. Better organization, cleaner separation of concerns, and improved maintainability.",
		discord:
			"Restructured component architecture. Cleaner code organization and better separation make development easier.",
	},
	"feat: add real-time collaboration features": {
		linkedin:
			"Real-time collaboration features launched. Multiple users can now work together with live updates and conflict resolution.",
		slack:
			"Real-time collaboration is live. Multi-user support with live updates, cursor tracking, and conflict resolution.",
		discord:
			"Collaboration features added. Multiple users can work together in real-time with live updates and sync.",
	},
	"fix: resolve database connection timeout issues": {
		linkedin:
			"Database connection timeout issues resolved. Improved connection pooling and retry logic for better reliability.",
		slack:
			"DB connection timeouts fixed. Better connection pooling, retry logic, and monitoring for improved stability.",
		discord:
			"Fixed database timeout issues. Better connection management and retry logic prevent connection failures.",
	},
	"feat: implement progressive web app capabilities": {
		linkedin:
			"Progressive Web App capabilities added. Offline functionality, push notifications, and native app-like experience on mobile devices.",
		slack:
			"PWA features deployed. Offline support, push notifications, and app-like experience on mobile devices.",
		discord:
			"App is now a PWA. Works offline, sends push notifications, and feels like a native app on mobile.",
	},
	"perf: implement Redis caching layer": {
		linkedin:
			"Redis caching layer implemented for improved performance. Reduced database load and faster response times for frequently accessed data.",
		slack:
			"Redis caching deployed. Faster response times and reduced DB load for frequently requested data.",
		discord:
			"Added Redis caching. Much faster data access and reduced database load for better performance.",
	},
	"feat: add comprehensive analytics dashboard": {
		linkedin:
			"Analytics dashboard launched with real-time metrics and insights. Comprehensive reporting with customizable charts and data visualization.",
		slack:
			"Analytics dashboard is live. Real-time metrics, custom reports, and interactive charts for data insights.",
		discord:
			"Analytics dashboard added. Real-time metrics and insights with interactive charts and custom reporting.",
	},
	"fix: resolve security vulnerabilities in dependencies": {
		linkedin:
			"Security vulnerabilities in dependencies resolved. Updated all packages and implemented automated security scanning.",
		slack:
			"Security updates applied. All vulnerable dependencies updated and automated scanning implemented for future monitoring.",
		discord:
			"Fixed security vulnerabilities. All dependencies updated and automated scanning prevents future issues.",
	},
	"feat: implement microservices architecture": {
		linkedin:
			"Microservices architecture implemented for better scalability and maintainability. Service separation with proper API boundaries.",
		slack:
			"Microservices architecture deployed. Better service separation, improved scalability, and independent deployment capabilities.",
		discord:
			"Moved to microservices architecture. Better scalability, service separation, and independent deployments.",
	},
	"refactor: optimize React component rendering": {
		linkedin:
			"React component rendering optimized for better performance. Implemented memoization and reduced unnecessary re-renders.",
		slack:
			"React rendering optimized. Added memoization, reduced re-renders, and improved component performance across the board.",
		discord:
			"Optimized React components. Better rendering performance with memoization and reduced unnecessary updates.",
	},
	"feat: add advanced user permission system": {
		linkedin:
			"Advanced user permission system implemented with role-based access control. Granular permissions and resource-level security.",
		slack:
			"Advanced permissions system is live. Role-based access control with granular permissions and resource-level security.",
		discord:
			"New permission system added. Role-based access with granular controls and proper resource security.",
	},
	"fix: resolve SSL certificate configuration issues": {
		linkedin:
			"SSL certificate configuration issues resolved. Proper certificate chain setup and automated renewal process implemented.",
		slack:
			"SSL certificate issues fixed. Proper chain configuration and automated renewal process now in place.",
		discord:
			"Fixed SSL certificate problems. Proper configuration and automated renewal prevent future certificate issues.",
	},
	"feat: implement automated backup system": {
		linkedin:
			"Automated backup system implemented with scheduled backups and restore capabilities. Multiple backup strategies for data protection.",
		slack:
			"Automated backup system deployed. Scheduled backups with restore capabilities and multiple retention policies.",
		discord:
			"Automated backups are now running. Scheduled backups with easy restore and multiple retention options.",
	},
	"perf: optimize SQL query performance": {
		linkedin:
			"SQL query performance optimized with improved indexing and query restructuring. Database response times significantly improved.",
		slack:
			"SQL queries optimized. Better indexing, query restructuring, and monitoring for improved database performance.",
		discord:
			"Optimized SQL queries. Better indexes and query structure make database operations much faster.",
	},
	"feat: add webhook integration system": {
		linkedin:
			"Webhook integration system added for external service communication. Secure webhook handling with retry logic and validation.",
		slack:
			"Webhook system is live. Secure integration with external services, retry logic, and proper validation handling.",
		discord:
			"Webhook integration added. Easy connection to external services with secure handling and retry logic.",
	},
	"fix: resolve cross-browser compatibility issues": {
		linkedin:
			"Cross-browser compatibility issues resolved. Consistent behavior across Chrome, Firefox, Safari, and Edge browsers.",
		slack:
			"Browser compatibility fixes deployed. Consistent behavior across all major browsers with proper polyfills.",
		discord:
			"Fixed cross-browser issues. App now works consistently across Chrome, Firefox, Safari, and Edge.",
	},
	"feat: implement advanced data visualization": {
		linkedin:
			"Advanced data visualization features launched. Interactive charts, graphs, and dashboards with customizable display options.",
		slack:
			"Data visualization features are live. Interactive charts, custom dashboards, and flexible display options.",
		discord:
			"Added advanced data visualization. Interactive charts, graphs, and customizable dashboards for better insights.",
	},
	"refactor: modernize legacy codebase to TypeScript": {
		linkedin:
			"Legacy codebase modernized with TypeScript migration. Improved type safety, better developer experience, and reduced runtime errors.",
		slack:
			"TypeScript migration complete. Better type safety, improved developer experience, and reduced runtime errors.",
		discord:
			"Migrated to TypeScript. Better type safety, fewer bugs, and improved development experience.",
	},
	"feat: add machine learning recommendation engine": {
		linkedin:
			"Machine learning recommendation engine implemented. Personalized content suggestions based on user behavior and preferences.",
		slack:
			"ML recommendation engine is live. Personalized suggestions based on user behavior with continuous learning.",
		discord:
			"Added ML recommendation engine. Smart content suggestions that learn from user behavior and preferences.",
	},
	"fix: resolve race condition in concurrent operations": {
		linkedin:
			"Race condition in concurrent operations resolved. Improved synchronization and locking mechanisms for data consistency.",
		slack:
			"Race condition fixes deployed. Better synchronization and locking prevent data inconsistencies in concurrent operations.",
		discord:
			"Fixed race condition issues. Better synchronization prevents data conflicts during concurrent operations.",
	},
	"feat: implement comprehensive logging system": {
		linkedin:
			"Comprehensive logging system implemented with structured logs and monitoring. Enhanced debugging capabilities and system observability.",
		slack:
			"Logging system deployed. Structured logs, monitoring integration, and better debugging capabilities across all services.",
		discord:
			"Added comprehensive logging. Better debugging, monitoring, and system observability with structured logs.",
	},
	"perf: optimize frontend asset delivery with CDN": {
		linkedin:
			"Frontend asset delivery optimized with CDN implementation. Faster load times and improved global content delivery performance.",
		slack:
			"CDN deployment complete. Faster asset delivery, improved load times, and better global performance.",
		discord:
			"Assets now delivered via CDN. Much faster load times and better performance for users worldwide.",
	},
};

export const getRandomItem = <T>(array: T[]): T => {
	return array[Math.floor(Math.random() * array.length)];
};

export const getPostsForCommit = (commitMessage: string) => {
	const posts = socialPosts[commitMessage as keyof typeof socialPosts];
	return (
		posts || {
			linkedin:
				"Latest deployment completed with system improvements and enhanced functionality. Changes tested and validated before production release.",
			slack:
				"New update deployed successfully. System improvements and functionality enhancements now live in production.",
			discord:
				"Update is live with solid improvements. Everything tested and deployed without issues.",
		}
	);
};
