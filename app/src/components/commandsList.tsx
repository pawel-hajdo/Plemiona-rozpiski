'use client'

import CommandRow from "@/components/commandRow";
import {useState} from "react";

const CommandsList = ({commands}) => {

    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (columnName) => {
        if (sortColumn === columnName) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnName);
            setSortDirection('asc');
        }
    };

    const sortedCommands = [...commands].sort((a, b) => {
        const columnA = sortColumn ? a[sortColumn] : null;
        const columnB = sortColumn ? b[sortColumn] : null;

        if (columnA && columnB) {
            if (sortDirection === 'asc') {
                return columnA.localeCompare(columnB);
            } else {
                return columnB.localeCompare(columnA);
            }
        } else {
            return 0;
        }
    });
    return (
        <div className="w-full bg-white p-4 rounded shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <SortableHeader
                        title="ID"
                        onClick={() => handleSort('commandNumberId')}
                        sortDirection={sortColumn === 'commandNumberId' ? sortDirection : null}
                    />
                    <SortableHeader
                        title="minTime"
                        onClick={() => handleSort('minTime')}
                        sortDirection={sortColumn === 'minTime' ? sortDirection : null}
                    />
                    <SortableHeader
                        title="maxTime"
                        onClick={() => handleSort('maxTime')}
                        sortDirection={sortColumn === 'maxTime' ? sortDirection : null}
                    />
                    <SortableHeader
                        title="source"
                        onClick={() => handleSort('source')}
                        sortDirection={sortColumn === 'source' ? sortDirection : null}
                    />
                    <SortableHeader
                        title="target"
                        onClick={() => handleSort('target')}
                        sortDirection={sortColumn === 'target' ? sortDirection : null}
                    />
                    <SortableHeader
                        title="type"
                        onClick={() => handleSort('type')}
                        sortDirection={sortColumn === 'type' ? sortDirection : null}
                    />
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">link</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedCommands.map((command, index) => (
                        <CommandRow
                            key={index}
                            id={command.commandNumberId}
                            minTime={command.minTime}
                            maxTime={command.maxTime}
                            source={command.source}
                            target={command.target}
                            type={command.type}
                            link={command.link}
                            //className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const SortableHeader = ({ title, onClick, sortDirection }) => (
    <th
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
        onClick={onClick}
    >
        {title}
        {sortDirection && (
            <span className="ml-1">
                {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
        )}
    </th>
);

export default CommandsList;
