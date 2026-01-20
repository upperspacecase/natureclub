const HexagonLogo = ({ className = "w-10 h-10" }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="currentColor"
        >
            <path
                d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
                strokeLinejoin="round"
                strokeWidth="2"
            />
        </svg>
    );
};

export default HexagonLogo;
