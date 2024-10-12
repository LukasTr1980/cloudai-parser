import { FeatureCardProps } from "../types";

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
    <div className="flex flex-col items-center p-4 bg-white shadow rounded-lg">
        {icon}
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        <p className="text-center text-gray-600">{description}</p>
    </div>
);

export default FeatureCard;
