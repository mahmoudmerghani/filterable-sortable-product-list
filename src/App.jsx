import { useState } from "react";

function ProductCategoryRow({ category }) {
    return (
        <tr>
            <th colSpan="2">{category}</th>
        </tr>
    );
}

function ProductRow({ product }) {
    const name = product.stocked ? (
        product.name
    ) : (
        <span style={{ color: "red" }}>{product.name}</span>
    );

    return (
        <tr>
            <td>{name}</td>
            <td>{product.price}</td>
        </tr>
    );
}

function ProductTableHeader({ header, ordering, onClick }) {
    let symbol = "";

    if (ordering === "asc") {
        symbol = "↑";
    }
    else if (ordering === "desc") {
        symbol = "↓";
    }

    return (
        <th>
            <button onClick={onClick}>{header} {symbol}</button>
        </th>
    );
}

function ProductTable({ products }) {
    const [nameOrdering, setNameOrdering] = useState("none");
    const [priceOrdering, setPriceOrdering] = useState("none");
    const [currentOrdering, setCurrentOrdering] = useState("name");
    const stateMachine = {
        asc: "desc",
        desc: "none",
        none: "asc",
    };

    function orderByName(products, order = "none") {
        if (order === "none") return products;

        const orderedProducts = [...products];

        if (order === "asc") {
            orderedProducts.sort((a, b) => (a.name < b.name ? -1 : 1));
        } else if (order === "desc") {
            orderedProducts.sort((a, b) => (a.name > b.name ? -1 : 1));
        }

        return orderedProducts;
    }

    function orderByPrice(products, order = "none") {
        if (order === "none") return products;

        const convertToNumber = (price) => {
            return Number(price.replace("$", ""));
        };

        const orderedProducts = [...products];

        if (order === "asc") {
            orderedProducts.sort(
                (a, b) => convertToNumber(a.price) - convertToNumber(b.price)
            );
        } else if (order === "desc") {
            orderedProducts.sort(
                (a, b) => convertToNumber(b.price) - convertToNumber(a.price)
            );
        }

        return orderedProducts;
    }

    function handleHeaderClick(headerName) {
        if (headerName === "name") {
            setNameOrdering(stateMachine[nameOrdering]);
            setCurrentOrdering("name");

            setPriceOrdering("none");

        } else if (headerName === "price") {
            setPriceOrdering(stateMachine[priceOrdering]);
            setCurrentOrdering("price");

            setNameOrdering("none");
        }
    }

    const isNameOrdering = currentOrdering === "name";
    const orderingFunction = isNameOrdering ? orderByName : orderByPrice;
    const orderedProducts = orderingFunction(
        products,
        isNameOrdering ? nameOrdering : priceOrdering
    );
    const categoryMap = {};

    for (const product of orderedProducts) {
        const category = product.category;

        if (categoryMap[category] === undefined) {
            categoryMap[category] = [];
        }

        categoryMap[category].push(product);
    }

    return (
        <table>
            <thead>
                <tr>
                    <ProductTableHeader
                        header="Name"
                        ordering={nameOrdering}
                        onClick={() => handleHeaderClick("name")}
                        />
                    <ProductTableHeader
                        header="Price"
                        ordering={priceOrdering}
                        onClick={() => handleHeaderClick("price")}
                    />
                </tr>
            </thead>
            <tbody>
                {Object.keys(categoryMap)
                    .sort()
                    .map((categoryKey) => (
                        <>
                            <ProductCategoryRow category={categoryKey} />
                            {categoryMap[categoryKey].map((product) => (
                                <ProductRow product={product} />
                            ))}
                        </>
                    ))}
            </tbody>
        </table>
    );
}

function SearchBar({ onType, onToggle }) {
    return (
        <form>
            <input type="text" placeholder="Search..." onChange={onType} />
            <label>
                <input type="checkbox" onChange={onToggle} /> Only show products
                in stock
            </label>
        </form>
    );
}

function FilterableProductTable({ products }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [stockOnly, setStockOnly] = useState(false);
    const filteredProducts = filterByName(
        filterByStockAvailability(products, stockOnly),
        searchTerm
    );

    function filterByName(products, searchTerm) {
        if (searchTerm === "") return products;

        const filterProducts = [];
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        for (const product of products) {
            if (product.name.toLowerCase().includes(lowerCaseSearchTerm)) {
                filterProducts.push(product);
            }
        }

        return filterProducts;
    }

    function filterByStockAvailability(products, showStockOnly) {
        if (!showStockOnly) return products;

        const filterProducts = [];

        for (const product of products) {
            if (product.stocked) {
                filterProducts.push(product);
            }
        }

        return filterProducts;
    }

    function handleSearch(e) {
        setSearchTerm(e.target.value);
    }

    function handleStockToggle(e) {
        setStockOnly(e.target.checked);
    }

    return (
        <div>
            <SearchBar onType={handleSearch} onToggle={handleStockToggle} />
            <ProductTable products={filteredProducts} />
        </div>
    );
}

const PRODUCTS = [
    { category: "Fruits", price: "$2", stocked: false, name: "Passionfruit" },
    { category: "Fruits", price: "$1", stocked: true, name: "Dragonfruit" },
    { category: "Vegetables", price: "$4", stocked: false, name: "Pumpkin" },
    { category: "Vegetables", price: "$2", stocked: true, name: "Spinach" },
    { category: "Fruits", price: "$1", stocked: true, name: "Apple" },
    { category: "Vegetables", price: "$1", stocked: true, name: "Peas" },
    { category: "Fruits", price: "$3", stocked: true, name: "Mango" },
    { category: "Fruits", price: "$2", stocked: false, name: "Pineapple" },
    { category: "Vegetables", price: "$3", stocked: true, name: "Broccoli" },
    { category: "Vegetables", price: "$2", stocked: true, name: "Carrot" },
    { category: "Fruits", price: "$4", stocked: true, name: "Pomegranate" },
    { category: "Vegetables", price: "$5", stocked: false, name: "Artichoke" },
];


export default function App() {
    return <FilterableProductTable products={PRODUCTS} />;
}
