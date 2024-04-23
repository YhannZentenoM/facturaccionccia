const Loading = () => {
    return (
        <div className='bg-black/40 inset-0 w-full h-screen fixed z-10'>
            <div className='flex flex-col items-center justify-center w-full h-full gap-1'>
                <img className='w-8 h-8' src='/loading.svg' alt='Loading' />
                <span className="text-black/80 text-sm font-medium">Generando comprobante ...</span>
            </div>
        </div>
    )
}

export default Loading