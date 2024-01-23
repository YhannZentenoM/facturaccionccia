import { useState } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel
} from '@tanstack/react-table'

const Table = ({ data, columns, children }) => {
    const [sorting, setSorting] = useState([])
    const [filtering, setFiltering] = useState('')

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting: sorting,
            globalFilter: filtering
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setFiltering
    })

    return (
        <>
            <div className="flex justify-between items-center">
                {children}
                <input
                    type="text"
                    className="px-5 py-2 bg-zinc-50 border border-zinc-400 rounded-xl"
                    placeholder="Buscar"
                    value={filtering}
                    onChange={e => setFiltering(e.target.value)}
                />
            </div>
            <table className="w-full text-sm">
                <thead className="bg-zinc-50">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}
                                    className="px-3 py-2 font-semibold border border-zinc-300 text-xs cursor-pointer"
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                    {
                                        { asc: '↑', desc: '↓' }[header.column.getIsSorted() ?? null]
                                    }
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="px-3 py-2 border border-zinc-300 text-xs uppercase">
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className='flex justify-between items-center mt-3 font-light text-xs'>
                <div className='flex items-center gap-1'>
                    Ver
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={e => {
                            table.setPageSize(Number(e.target.value))
                        }}
                        className='p-2 border border-zinc-300 rounded-md'
                    >
                        {[10, 20, 30, 40, 50].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                    entradas
                </div>
                <span className="flex items-center gap-1">
                    <div>Página</div>
                    <strong>
                        {table.getState().pagination.pageIndex + 1} de{' '}
                        {table.getPageCount()}
                    </strong>
                </span>
                <div className='flex items-center gap-2'>
                    <span className="flex items-center gap-1">
                        Ir a:
                        <input
                            type="number"
                            className="border border-zinc-300 p-2 rounded-md w-14"
                            max={table.getPageCount()}
                            min={1}
                            defaultValue={table.getState().pagination.pageIndex + 1}
                            onChange={e => {
                                const page = e.target.value ? Number(e.target.value) - 1 : 0
                                table.setPageIndex(page)
                            }}
                        />
                    </span>
                    <div>
                        <button onClick={() => table.setPageIndex(0)} className='px-2 py-1 border border-zinc-300 rounded-md text-zinc-600 hover:bg-primary hover:text-white transition-all duration-300'>
                            <svg xmlns="http://www.w3.org/2000/svg" className='w-6' viewBox="0 0 24 24"><path fill="currentColor" d="m4.836 12l6.207 6.207l1.414-1.414L7.664 12l4.793-4.793l-1.414-1.414L4.836 12Zm5.65 0l6.207 6.207l1.414-1.414L13.314 12l4.793-4.793l-1.414-1.414L10.486 12Z" /></svg>
                        </button>
                        <button disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} className='px-2 py-1 border border-zinc-300 rounded-md text-zinc-600 hover:bg-primary hover:text-white transition-all duration-300 disabled:bg-zinc-200/60 disabled:text-zinc-600'>
                            <svg xmlns="http://www.w3.org/2000/svg" className='w-6' viewBox="0 0 24 24"><path fill="currentColor" d="m10.828 12l4.95 4.95l-1.414 1.415L8 12l6.364-6.364l1.414 1.414l-4.95 4.95Z" /></svg>
                        </button>
                        <button disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} className='px-2 py-1 border border-zinc-300 rounded-md text-zinc-600 hover:bg-primary hover:text-white transition-all duration-300 disabled:bg-zinc-200/60 disabled:text-zinc-600'>
                            <svg xmlns="http://www.w3.org/2000/svg" className='w-6' viewBox="0 0 24 24"><path fill="currentColor" d="m13.171 12l-4.95-4.95l1.415-1.413L16 12l-6.364 6.364l-1.414-1.415l4.95-4.95Z" /></svg>
                        </button>
                        <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} className='px-2 py-1 border border-zinc-300 rounded-md text-zinc-600 hover:bg-primary hover:text-white transition-all duration-300'>
                            <svg xmlns="http://www.w3.org/2000/svg" className='w-6' viewBox="0 0 24 24"><path fill="currentColor" d="m19.164 12l-6.207-6.207l-1.414 1.414L16.336 12l-4.793 4.793l1.414 1.414L19.164 12Zm-5.65 0L7.307 5.793L5.893 7.207L10.686 12l-4.793 4.793l1.414 1.414L13.514 12Z" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Table