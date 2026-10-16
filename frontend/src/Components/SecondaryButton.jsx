const SecondaryButton = ({ children, onClick, type = "button" }) => {
    return (
        <button
            type={type}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-xs font-semibold transition whitespace-nowrap bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 cursor-pointer"
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default SecondaryButton;