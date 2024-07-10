import Link from "next/link";

const CommandRow = ({ id, minTime, maxTime, source, target, type, link }) => {
    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{minTime}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{maxTime}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{source}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{target}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Link href={link} target="_blank" rel="noopener noreferrer">
                    <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                        Button
                    </button>
                </Link>
            </td>
        </tr>
    );
};

export default CommandRow;
