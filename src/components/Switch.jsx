const Switch = ({
    title,
    onChange,
    checked = false
}) => {
    

    return (
        <label className="flex items-center cursor-pointer gap-3">
            <div className="text-gray-500 font-normal text-sm">
                {title}
            </div>
            <div className="relative">
                <input
                    type="checkbox"
                    className="hidden"
                    onChange={onChange}
                    checked={checked}
                />
                <div className={`toggle__line w-10 h-4 bg-gray-400 rounded-full shadow-inner ${checked ? 'bg-primary' : 'bg-gray-300'}`}></div>
                <div
                    className={`toggle__dot absolute w-5 h-5 bg-primary rounded-full shadow inset-y-0 left-0 ${checked ? 'transform translate-x-full bg-primary' : 'bg-gray-300'}`}
                ></div>
            </div>
        </label>
    );
};

export default Switch;
