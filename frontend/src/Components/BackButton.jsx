const BackButton = ({ onClick }) => {
    return (
        <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-xs font-semibold transition whitespace-nowrap bg-white text-gray-600 hover:text-[#334155] cursor-pointer"
            onClick={onClick}
        >
            <i className="fa-solid fa-arrow-left" />
            Back
        </button>
    );
};

export default BackButton;