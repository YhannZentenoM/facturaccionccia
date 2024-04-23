const Modal = ({ isOpen, onClose, children, size = "sm", title="" }) => {

    if (!isOpen) {
        return null;
    }

    return (
        <>
            <div className="fixed inset-0 flex items-start justify-center z-50">
                <div className="modal-overlay bg-zinc-700/70 w-full h-full absolute"></div>
                <div
                    className={`bg-white ${size === "sm" ? "w-[700px]" : "w-[850px]" } p-5 pt-8 rounded-lg shadow-lg z-50 relative mt-10`}
                >
                    <div className={`absolute top-2 left-0 flex justify-between w-full px-3`}>
                        <h2 className="text-lg">{title}</h2>
                        <button
                            className="text-gray-500"
                            onClick={onClose}>
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </>
    );
};

export default Modal;
