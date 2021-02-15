export const Loader = ({disableLoaderText, className}) => {
    return <div className={`${className}`}>
        <div className={`spinner-border text-primary`} role="status">
            <span className="sr-only">Loading...</span>
        </div>
        {disableLoaderText ? null : <p>Loading, please wait...</p>}
    </div>
}
