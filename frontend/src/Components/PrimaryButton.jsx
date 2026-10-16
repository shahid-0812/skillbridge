const PrimaryButton = ({
    children,
    onClick,
    type = "button",
    disabled = false,
}) => {
    return (
        <button
            type={type}
            className={`flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-xs font-semibold transition whitespace-nowrap bg-blue-500 text-white shadow-sm ${disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#1E40E0] cursor-pointer"
                }`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default PrimaryButton;