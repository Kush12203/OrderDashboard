import { FaSearch } from "react-icons/fa";

function SearchBar({ search, setSearch }) {

    return (

        <div className="search-box">

            <FaSearch />

            <input

                type="text"

                placeholder="Search Customer..."

                value={search}

                onChange={(e)=>setSearch(e.target.value)}

            />

        </div>

    );

}

export default SearchBar;