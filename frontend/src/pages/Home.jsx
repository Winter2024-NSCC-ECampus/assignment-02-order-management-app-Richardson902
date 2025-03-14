import { useEffect, useState } from "react";
import axios from "axios";
import ProductList from "../components/ProductList";

function Home({ selectedCategory }) {
  const [products, setProducts] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // First, fetch all products
        const response = await axios.get("/api/products");
        const productsData = response.data;

        // Then, fetch images for each product
        const updatedProducts = await Promise.all(
          productsData.map(async (product) => {
            try {
              const imageResponse = await axios.get(
                `/api/products/${product.id}/image`,
                { responseType: "blob" }
              );
              const imageUrl = URL.createObjectURL(imageResponse.data);
              return { ...product, imageUrl };
            } catch (error) {
              console.error(
                "Error fetching image for product ID:",
                product.id,
                error
              );
              return { ...product, imageUrl: "/placeholder-image.jpg" };
            }
          })
        );

        setProducts(updatedProducts);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setIsError(true);
        setIsLoading(false);
      }
    };

    fetchProducts();

    // Cleanup function to revoke object URLs to avoid memory leaks
    return () => {
      products.forEach((product) => {
        if (product.imageUrl && product.imageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(product.imageUrl);
        }
      });
    };
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  const getCategoryHeading = () => {
    switch (selectedCategory) {
      case "bouquets":
        return "collection of stunning bouquets";
      case "arrangements":
        return "collection of elegant arrangements";
      case "single-flowers":
        return "collection of beautiful single flowers";
      case "gifts":
        return "collection of delightful gift baskets";
      default:
        return "handpicked selection of beautiful blooms";
    }
  };

  if (isError) {
    return (
      <div className="container text-center my-5">
        <div className="alert alert-danger p-5">
          <h2>Something went wrong...</h2>
          <p>
            We couldn't load our beautiful flower collection. Please try again
            later.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-bloom-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-12">
          <h1 className="display-4 text-bloom-primary text-center mb-4">
            Bloom Cart Flower Shop
          </h1>
          <p className="lead text-center mb-5">
            Discover our {getCategoryHeading()}
          </p>
        </div>
      </div>

      <ProductList products={filteredProducts} />
    </div>
  );
}

export default Home;
